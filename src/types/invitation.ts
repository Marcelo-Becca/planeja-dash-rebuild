// Invitation system types

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

export type InvitationRole = 'owner' | 'admin' | 'member' | 'observer';

export interface InvitationTarget {
  type: 'organization' | 'project' | 'team';
  id: string;
  name: string;
}

export interface Invitation {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientId?: string; // Set when recipient accepts and has/creates account
  target: InvitationTarget;
  role: InvitationRole;
  teams: string[]; // Array of team IDs to associate with
  message?: string;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  link?: string; // Shareable link token
}

export interface InvitationFormData {
  recipientEmail: string;
  recipientId?: string; // From circle selection
  role: InvitationRole;
  teams: string[];
  message?: string;
  expirationDays: number;
  generateLink: boolean;
  sendNotification: boolean;
}

export interface CircleContact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
  company?: string;
}

export interface InvitationActivity {
  id: string;
  type: 'sent' | 'accepted' | 'rejected' | 'resent' | 'cancelled' | 'expired';
  invitationId: string;
  performedBy: string;
  performedByName: string;
  message?: string;
  timestamp: Date;
  targetName: string;
  recipientEmail: string;
}

export const ROLE_DESCRIPTIONS: Record<InvitationRole, string> = {
  owner: 'Controle total - pode gerenciar tudo',
  admin: 'Administrador - pode convidar e gerenciar membros',
  member: 'Membro - pode participar e colaborar',
  observer: 'Observador - apenas visualização'
};

export const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 dia' },
  { value: 3, label: '3 dias' },
  { value: 7, label: '1 semana' },
  { value: 14, label: '2 semanas' },
  { value: 30, label: '1 mês' }
];