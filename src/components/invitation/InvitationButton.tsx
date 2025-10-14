import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvitationModal } from './InvitationModal';
import { InvitationTarget, InvitationRole } from '@/types/invitation';
import { User, Team } from '@/data/mockData';
interface InvitationButtonProps {
  target: InvitationTarget;
  currentUser: User;
  currentUserRole?: InvitationRole;
  availableTeams?: Team[];
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}
export function InvitationButton({
  target,
  currentUser,
  currentUserRole = 'admin',
  availableTeams = [],
  variant = 'default',
  size = 'default',
  className,
  children
}: InvitationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user can invite (simplified - in real app would check actual permissions)
  const canInvite = ['owner', 'admin'].includes(currentUserRole);
  if (!canInvite) {
    return null;
  }
  return <>
      

      <InvitationModal open={isModalOpen} onOpenChange={setIsModalOpen} target={target} currentUser={currentUser} currentUserRole={currentUserRole} availableTeams={availableTeams} />
    </>;
}