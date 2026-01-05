
export interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  url: string;
  type: 'whatsapp' | 'map' | 'email' | 'website' | 'custom';
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
  createdAt?: string;
  isPremium?: boolean;
  // Campos de Marketing e Rastreamento
  metaPixelId?: string;
  ga4MeasurementId?: string;
}

export interface UploadPending {
  field: 'avatarUrl' | 'backgroundUrl';
  file: File;
  previewUrl: string;
}
