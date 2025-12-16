
export interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  url: string;
  type: 'whatsapp' | 'map' | 'email' | 'website';
}

export interface DocumentInfo {
  label: string;
  value: string;
}

export interface ProfileData {
  alias: string;
  name: string;
  title: string;
  document: DocumentInfo;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  themeColor: string;
  // Novos campos para controle de assinatura
  createdAt?: string; // Data ISO string
  isPremium?: boolean;
}

// Interface auxiliar para gerenciar uploads pendentes no AdminPanel
export interface UploadPending {
  field: 'avatarUrl' | 'backgroundUrl';
  file: File;
  previewUrl: string;
}
