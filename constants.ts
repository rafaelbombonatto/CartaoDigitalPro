
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

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    icon: "fa-brands fa-whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/5511999999999",
    type: "whatsapp"
  },
  {
    icon: "fa-solid fa-location-dot",
    label: "Escritório",
    url: "https://maps.google.com",
    type: "map"
  },
  {
    icon: "fa-solid fa-envelope",
    label: "E-mail",
    url: "mailto:contato@analisecardpro.com",
    type: "email"
  },
  {
    icon: "fa-solid fa-globe",
    label: "Portfólio",
    url: "https://www.analisecardpro.com",
    type: "website"
  }
];

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { icon: "fa-brands fa-instagram", url: "#", label: "Instagram" },
  { icon: "fa-brands fa-linkedin-in", url: "#", label: "LinkedIn" },
  { icon: "fa-brands fa-facebook-f", url: "#", label: "Facebook" },
  { icon: "fa-brands fa-tiktok", url: "#", label: "TikTok" },
  { icon: "fa-brands fa-youtube", url: "#", label: "YouTube" }
];
