
import { ProfileData, QuickAction, SocialLink } from './types';

export const DEFAULT_PROFILE: ProfileData = {
  alias: "marianaxavier",
  name: "Mariana Xavier",
  title: "Estrategista Imobiliária",
  document: {
    label: "CRECI",
    value: "012345456"
  },
  bio: "Especialista em alto padrão com foco em ROI imobiliário. Minha missão é transformar seu investimento em patrimônio sólido.",
  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop",
  backgroundUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1920&auto=format&fit=crop",
  themeColor: "#D4AF37",
  isPremium: false
};

export const BLANK_PROFILE: ProfileData = {
  alias: "",
  name: "",
  title: "",
  document: { label: "", value: "" },
  bio: "",
  avatarUrl: "",
  backgroundUrl: "",
  themeColor: "#00E5FF",
  isPremium: false,
  metaPixelId: "",
  ga4MeasurementId: ""
};

export const PRESET_ICONS = [
  { class: "fa-solid fa-utensils", label: "Cardápio" },
  { class: "fa-solid fa-calendar-check", label: "Agenda" },
  { class: "fa-solid fa-briefcase", label: "Portfólio" },
  { class: "fa-solid fa-bag-shopping", label: "Loja" },
  { class: "fa-solid fa-video", label: "Cursos/Vídeos" },
  { class: "fa-solid fa-file-pdf", label: "Documento PDF" },
  { class: "fa-solid fa-star", label: "Destaque" },
  { class: "fa-solid fa-tag", label: "Ofertas" },
  { class: "fa-solid fa-graduation-cap", label: "Educação" },
  { class: "fa-solid fa-stethoscope", label: "Saúde" },
  { class: "fa-solid fa-gavel", label: "Jurídico" },
  { class: "fa-solid fa-house-chimney", label: "Imóveis" }
];

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { icon: "fa-brands fa-whatsapp", label: "WhatsApp", url: "", type: "whatsapp" },
  { icon: "fa-solid fa-location-dot", label: "Localização", url: "", type: "map" },
  { icon: "fa-solid fa-envelope", label: "E-mail", url: "", type: "email" },
  { icon: "fa-solid fa-globe", label: "Website", url: "", type: "website" }
];

export const DEFAULT_CUSTOM_ACTIONS: QuickAction[] = [
  { icon: "fa-solid fa-star", label: "", url: "", type: "custom" },
  { icon: "fa-solid fa-star", label: "", url: "", type: "custom" }
];

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { icon: "fa-brands fa-instagram", url: "", label: "Instagram" },
  { icon: "fa-brands fa-linkedin-in", url: "", label: "LinkedIn" },
  { icon: "fa-brands fa-x-twitter", url: "", label: "X (Twitter)" },
  { icon: "fa-brands fa-facebook-f", url: "", label: "Facebook" },
  { icon: "fa-brands fa-tiktok", url: "", label: "TikTok" },
  { icon: "fa-brands fa-youtube", url: "", label: "YouTube" }
];
