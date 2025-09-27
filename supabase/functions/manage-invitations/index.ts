import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  action: 'create' | 'accept' | 'reject' | 'cancel' | 'resend';
  recipient_email?: string;
  target_type?: 'project' | 'team';
  target_id?: string;
  role?: 'owner' | 'admin' | 'member' | 'observer';
  message?: string;
  expires_in_days?: number;
  token?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    const body: InvitationRequest = await req.json();
    const { action } = body;

    let result;

    switch (action) {
      case 'create':
        result = await createInvitation(supabase, user.id, body);
        break;
      case 'accept':
        result = await acceptInvitation(supabase, user.id, body.token!);
        break;
      case 'reject':
        result = await rejectInvitation(supabase, user.id, body.token!);
        break;
      case 'cancel':
        result = await cancelInvitation(supabase, user.id, body.token!);
        break;
      case 'resend':
        result = await resendInvitation(supabase, user.id, body.token!, body.message);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in manage-invitations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'INVITATION_ERROR',
          message: errorMessage 
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function createInvitation(
  supabase: any, 
  senderId: string, 
  body: InvitationRequest
) {
  const { 
    recipient_email, 
    target_type, 
    target_id, 
    role = 'member', 
    message, 
    expires_in_days = 7 
  } = body;

  // Validate required fields
  if (!recipient_email || !target_type || !target_id) {
    throw new Error('recipient_email, target_type, and target_id are required');
  }

  // Check for existing pending invitation
  const { data: existingInvitation } = await supabase
    .from('invitations')
    .select('id')
    .eq('recipient_email', recipient_email)
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .eq('status', 'pending')
    .single();

  if (existingInvitation) {
    throw new Error('A pending invitation already exists for this email and target');
  }

  // Verify sender has permission to invite
  const hasPermission = await checkInvitePermission(supabase, senderId, target_type, target_id);
  if (!hasPermission) {
    throw new Error('You do not have permission to invite users to this resource');
  }

  // Generate unique token
  const token = crypto.randomUUID() + '-' + Date.now().toString(36);
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expires_in_days);

  // Check if recipient already has an account
  const { data: recipientUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (await supabase.auth.admin.getUserByEmail(recipient_email)).data.user?.id || '')
    .single();

  // Create invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      sender_id: senderId,
      recipient_email,
      recipient_id: recipientUser?.id || null,
      target_type,
      target_id,
      role,
      token,
      message,
      expires_at: expiresAt.toISOString()
    })
    .select(`
      *,
      sender:profiles!sender_id(full_name, avatar_url)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  // Log activity
  await supabase
    .from('activity_logs')
    .insert({
      actor_id: senderId,
      activity_type: 'invitation_sent',
      entity_type: target_type,
      entity_id: target_id,
      new_values: { recipient_email, role, token },
      metadata: { message }
    });

  return {
    success: true,
    invitation,
    invitation_link: `${Deno.env.get('SUPABASE_URL')}/invite/${token}`
  };
}

async function acceptInvitation(supabase: any, userId: string, token: string) {
  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
    
    throw new Error('Invitation has expired');
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      recipient_id: userId,
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id);

  if (updateError) {
    throw new Error(`Failed to accept invitation: ${updateError.message}`);
  }

  // Add user to appropriate resource
  if (invitation.target_type === 'team') {
    await supabase
      .from('team_members')
      .insert({
        team_id: invitation.target_id,
        user_id: userId,
        role: invitation.role
      });
  } else if (invitation.target_type === 'project') {
    // For projects, we need to associate through a team or create a default association
    // This might need adjustment based on your specific business logic
    console.log('Project invitation accepted - implement project association logic');
  }

  // Log activity
  await supabase
    .from('activity_logs')
    .insert({
      actor_id: userId,
      activity_type: 'invitation_accepted',
      entity_type: invitation.target_type,
      entity_id: invitation.target_id,
      metadata: { invitation_id: invitation.id }
    });

  return { success: true, message: 'Invitation accepted successfully' };
}

async function rejectInvitation(supabase: any, userId: string, token: string) {
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      status: 'rejected',
      recipient_id: userId,
      rejected_at: new Date().toISOString()
    })
    .eq('id', invitation.id);

  if (updateError) {
    throw new Error(`Failed to reject invitation: ${updateError.message}`);
  }

  // Log activity
  await supabase
    .from('activity_logs')
    .insert({
      actor_id: userId,
      activity_type: 'invitation_rejected',
      entity_type: invitation.target_type,
      entity_id: invitation.target_id,
      metadata: { invitation_id: invitation.id }
    });

  return { success: true, message: 'Invitation rejected' };
}

async function cancelInvitation(supabase: any, userId: string, token: string) {
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('sender_id', userId)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invitation not found or you do not have permission to cancel it');
  }

  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', invitation.id);

  if (updateError) {
    throw new Error(`Failed to cancel invitation: ${updateError.message}`);
  }

  // Log activity
  await supabase
    .from('activity_logs')
    .insert({
      actor_id: userId,
      activity_type: 'invitation_cancelled',
      entity_type: invitation.target_type,
      entity_id: invitation.target_id,
      metadata: { invitation_id: invitation.id }
    });

  return { success: true, message: 'Invitation cancelled' };
}

async function resendInvitation(supabase: any, userId: string, token: string, newMessage?: string) {
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('sender_id', userId)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invitation not found or you do not have permission to resend it');
  }

  // Extend expiration by 7 days
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  const updateData: any = {
    expires_at: newExpiresAt.toISOString(),
    updated_at: new Date().toISOString()
  };

  if (newMessage !== undefined) {
    updateData.message = newMessage;
  }

  const { error: updateError } = await supabase
    .from('invitations')
    .update(updateData)
    .eq('id', invitation.id);

  if (updateError) {
    throw new Error(`Failed to resend invitation: ${updateError.message}`);
  }

  return { success: true, message: 'Invitation resent successfully' };
}

async function checkInvitePermission(
  supabase: any, 
  userId: string, 
  targetType: string, 
  targetId: string
): Promise<boolean> {
  if (targetType === 'project') {
    // Check if user is project owner or admin
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', targetId)
      .single();
    
    return project?.owner_id === userId;
  } else if (targetType === 'team') {
    // Check if user is team leader
    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', targetId)
      .single();
    
    return team?.leader_id === userId;
  }

  return false;
}