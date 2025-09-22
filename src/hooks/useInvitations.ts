import { useState, useEffect, useCallback } from 'react';
import { 
  Invitation, 
  InvitationFormData, 
  InvitationActivity, 
  InvitationStatus,
  CircleContact,
  InvitationTarget 
} from '@/types/invitation';
import { User } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEYS = {
  invitations: 'planeja_invitations',
  activities: 'planeja_invitation_activities',
  rateLimits: 'planeja_rate_limits'
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxInvites: 5,
  timeWindow: 60 * 1000, // 1 minute
  blockDuration: 30 * 1000 // 30 seconds
};

interface RateLimit {
  count: number;
  lastReset: number;
  blockedUntil?: number;
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activities, setActivities] = useState<InvitationActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedInvitations = localStorage.getItem(STORAGE_KEYS.invitations);
    const loadedActivities = localStorage.getItem(STORAGE_KEYS.activities);

    if (loadedInvitations) {
      try {
        const parsed = JSON.parse(loadedInvitations);
        // Convert date strings back to Date objects
        const convertedInvitations = parsed.map((inv: any) => ({
          ...inv,
          createdAt: new Date(inv.createdAt),
          expiresAt: new Date(inv.expiresAt),
          acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt) : undefined,
          rejectedAt: inv.rejectedAt ? new Date(inv.rejectedAt) : undefined,
          cancelledAt: inv.cancelledAt ? new Date(inv.cancelledAt) : undefined
        }));
        setInvitations(convertedInvitations);
      } catch (error) {
        console.error('Error loading invitations:', error);
      }
    }

    if (loadedActivities) {
      try {
        const parsed = JSON.parse(loadedActivities);
        const convertedActivities = parsed.map((act: any) => ({
          ...act,
          timestamp: new Date(act.timestamp)
        }));
        setActivities(convertedActivities);
      } catch (error) {
        console.error('Error loading invitation activities:', error);
      }
    }

    // Check for expired invitations
    const checkExpired = () => {
      setInvitations(prev => {
        const updated = prev.map(inv => {
          if (inv.status === 'pending' && new Date() > inv.expiresAt) {
            return { ...inv, status: 'expired' as InvitationStatus };
          }
          return inv;
        });
        return updated;
      });
    };

    checkExpired();
    const interval = setInterval(checkExpired, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.invitations, JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  }, [activities]);

  // Rate limiting check
  const checkRateLimit = useCallback((): boolean => {
    const rateLimitData = localStorage.getItem(STORAGE_KEYS.rateLimits);
    let rateLimit: RateLimit = { count: 0, lastReset: Date.now() };

    if (rateLimitData) {
      try {
        rateLimit = JSON.parse(rateLimitData);
      } catch (error) {
        console.error('Error parsing rate limit data:', error);
      }
    }

    const now = Date.now();

    // Check if still blocked
    if (rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
      const remainingSeconds = Math.ceil((rateLimit.blockedUntil - now) / 1000);
      toast({
        title: "Muito rápido",
        description: `Aguarde ${remainingSeconds} segundos antes de enviar outro convite.`,
        variant: "destructive"
      });
      return false;
    }

    // Reset counter if time window passed
    if (now - rateLimit.lastReset > RATE_LIMIT.timeWindow) {
      rateLimit = { count: 0, lastReset: now };
    }

    // Check if limit exceeded
    if (rateLimit.count >= RATE_LIMIT.maxInvites) {
      rateLimit.blockedUntil = now + RATE_LIMIT.blockDuration;
      localStorage.setItem(STORAGE_KEYS.rateLimits, JSON.stringify(rateLimit));
      
      const blockSeconds = Math.ceil(RATE_LIMIT.blockDuration / 1000);
      toast({
        title: "Limite atingido",
        description: `Muitos convites enviados. Aguarde ${blockSeconds} segundos.`,
        variant: "destructive"
      });
      return false;
    }

    // Increment counter
    rateLimit.count++;
    localStorage.setItem(STORAGE_KEYS.rateLimits, JSON.stringify(rateLimit));
    return true;
  }, [toast]);

  // Generate unique invitation ID
  const generateInvitationId = useCallback((): string => {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate shareable link token
  const generateLinkToken = useCallback((): string => {
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
  }, []);

  // Add activity log entry
  const addActivity = useCallback((activity: Omit<InvitationActivity, 'id' | 'timestamp'>) => {
    const newActivity: InvitationActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Check for duplicate invitations
  const checkDuplicate = useCallback((recipientEmail: string, target: InvitationTarget): Invitation | null => {
    return invitations.find(inv => 
      inv.recipientEmail === recipientEmail && 
      inv.target.type === target.type && 
      inv.target.id === target.id && 
      inv.status === 'pending'
    ) || null;
  }, [invitations]);

  // Send invitation
  const sendInvitation = useCallback(async (
    formData: InvitationFormData,
    target: InvitationTarget,
    currentUser: User
  ): Promise<{ success: boolean; invitation?: Invitation; duplicate?: boolean }> => {
    setIsLoading(true);

    try {
      // Check rate limit
      if (!checkRateLimit()) {
        setIsLoading(false);
        return { success: false };
      }

      // Check for duplicates
      const existingInvitation = checkDuplicate(formData.recipientEmail, target);
      if (existingInvitation) {
        toast({
          title: "Convite duplicado",
          description: `Já existe um convite pendente para ${formData.recipientEmail} neste ${target.type}.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false, duplicate: true };
      }

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expirationDays);

      const newInvitation: Invitation = {
        id: generateInvitationId(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        recipientEmail: formData.recipientEmail,
        recipientId: formData.recipientId,
        target,
        role: formData.role,
        teams: formData.teams,
        message: formData.message,
        status: 'pending',
        createdAt: new Date(),
        expiresAt,
        link: formData.generateLink ? generateLinkToken() : undefined
      };

      // Add to invitations
      setInvitations(prev => [newInvitation, ...prev]);

      // Log activity
      addActivity({
        type: 'sent',
        invitationId: newInvitation.id,
        performedBy: currentUser.id,
        performedByName: currentUser.name,
        targetName: target.name,
        recipientEmail: formData.recipientEmail,
        message: formData.message
      });

      // Show success toast with undo option
      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${formData.recipientEmail}.`,
        duration: 5000
      });

      setIsLoading(false);
      return { success: true, invitation: newInvitation };

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite. Tente novamente.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
  }, [checkRateLimit, checkDuplicate, generateInvitationId, generateLinkToken, addActivity, toast]);

  // Accept invitation
  const acceptInvitation = useCallback(async (
    invitationId: string,
    acceptingUser: User
  ): Promise<{ success: boolean }> => {
    setIsLoading(true);

    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        toast({
          title: "Erro",
          description: "Convite não encontrado.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false };
      }

      if (invitation.status !== 'pending') {
        toast({
          title: "Convite inválido",
          description: "Este convite não está mais disponível.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false };
      }

      if (new Date() > invitation.expiresAt) {
        // Mark as expired
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: 'expired' as InvitationStatus }
              : inv
          )
        );
        toast({
          title: "Convite expirado",
          description: "Este convite já expirou.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false };
      }

      // Accept invitation
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { 
                ...inv, 
                status: 'accepted' as InvitationStatus,
                recipientId: acceptingUser.id,
                acceptedAt: new Date()
              }
            : inv
        )
      );

      // Log activity
      addActivity({
        type: 'accepted',
        invitationId,
        performedBy: acceptingUser.id,
        performedByName: acceptingUser.name,
        targetName: invitation.target.name,
        recipientEmail: invitation.recipientEmail
      });

      toast({
        title: `Bem-vindo(a) a ${invitation.target.name}`,
        description: `Você agora é ${invitation.role} em ${invitation.target.name}.`
      });

      setIsLoading(false);
      return { success: true };

    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite. Tente novamente.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
  }, [invitations, addActivity, toast]);

  // Reject invitation
  const rejectInvitation = useCallback(async (
    invitationId: string,
    rejectingUser: User
  ): Promise<{ success: boolean }> => {
    setIsLoading(true);

    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        setIsLoading(false);
        return { success: false };
      }

      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { 
                ...inv, 
                status: 'rejected' as InvitationStatus,
                rejectedAt: new Date()
              }
            : inv
        )
      );

      // Log activity
      addActivity({
        type: 'rejected',
        invitationId,
        performedBy: rejectingUser.id,
        performedByName: rejectingUser.name,
        targetName: invitation.target.name,
        recipientEmail: invitation.recipientEmail
      });

      toast({
        title: "Convite recusado",
        description: "O convite foi recusado."
      });

      setIsLoading(false);
      return { success: true };

    } catch (error) {
      console.error('Error rejecting invitation:', error);
      setIsLoading(false);
      return { success: false };
    }
  }, [invitations, addActivity, toast]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (
    invitationId: string,
    cancellingUser: User
  ): Promise<{ success: boolean }> => {
    setIsLoading(true);

    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        setIsLoading(false);
        return { success: false };
      }

      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { 
                ...inv, 
                status: 'cancelled' as InvitationStatus,
                cancelledAt: new Date()
              }
            : inv
        )
      );

      // Log activity
      addActivity({
        type: 'cancelled',
        invitationId,
        performedBy: cancellingUser.id,
        performedByName: cancellingUser.name,
        targetName: invitation.target.name,
        recipientEmail: invitation.recipientEmail
      });

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso."
      });

      setIsLoading(false);
      return { success: true };

    } catch (error) {
      console.error('Error cancelling invitation:', error);
      setIsLoading(false);
      return { success: false };
    }
  }, [invitations, addActivity, toast]);

  // Resend invitation
  const resendInvitation = useCallback(async (
    invitationId: string,
    resendingUser: User,
    newMessage?: string
  ): Promise<{ success: boolean }> => {
    setIsLoading(true);

    try {
      if (!checkRateLimit()) {
        setIsLoading(false);
        return { success: false };
      }

      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        setIsLoading(false);
        return { success: false };
      }

      // Update expiration and message
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7); // Default 7 days

      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { 
                ...inv, 
                status: 'pending' as InvitationStatus,
                expiresAt: newExpiresAt,
                message: newMessage || inv.message
              }
            : inv
        )
      );

      // Log activity
      addActivity({
        type: 'resent',
        invitationId,
        performedBy: resendingUser.id,
        performedByName: resendingUser.name,
        targetName: invitation.target.name,
        recipientEmail: invitation.recipientEmail,
        message: newMessage
      });

      toast({
        title: "Convite reenviado",
        description: `Convite reenviado para ${invitation.recipientEmail}.`
      });

      setIsLoading(false);
      return { success: true };

    } catch (error) {
      console.error('Error resending invitation:', error);
      setIsLoading(false);
      return { success: false };
    }
  }, [invitations, checkRateLimit, addActivity, toast]);

  // Get invitations by status
  const getInvitationsByStatus = useCallback((status: InvitationStatus) => {
    return invitations.filter(inv => inv.status === status);
  }, [invitations]);

  // Get invitations for a user (as recipient)
  const getInvitationsForUser = useCallback((userEmail: string) => {
    return invitations.filter(inv => inv.recipientEmail === userEmail);
  }, [invitations]);

  // Get invitations sent by a user
  const getInvitationsBySender = useCallback((senderId: string) => {
    return invitations.filter(inv => inv.senderId === senderId);
  }, [invitations]);

  // Clear all data (for dev panel)
  const clearAllData = useCallback(() => {
    setInvitations([]);
    setActivities([]);
    localStorage.removeItem(STORAGE_KEYS.invitations);
    localStorage.removeItem(STORAGE_KEYS.activities);
    localStorage.removeItem(STORAGE_KEYS.rateLimits);
    
    toast({
      title: "Dados limpos",
      description: "Todos os convites e atividades foram removidos."
    });
  }, [toast]);

  return {
    invitations,
    activities,
    isLoading,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
    resendInvitation,
    getInvitationsByStatus,
    getInvitationsForUser,
    getInvitationsBySender,
    clearAllData
  };
}