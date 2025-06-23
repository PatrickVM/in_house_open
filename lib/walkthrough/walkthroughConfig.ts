import { UserRole } from "@/auth";

export interface WalkthroughStep {
  id: string;
  target: string; // CSS selector for element to highlight
  page: string; // route where step applies
  type: "tooltip" | "modal" | "overlay";
  content: {
    en: string;
    es: string;
    pt: string;
  };
  isNew?: boolean;
  theme?: "light" | "dark" | "auto";
  position?: "top" | "bottom" | "left" | "right" | "center";
  offset?: { x: number; y: number };
}

export const WALKTHROUGH_VERSION = "walkthrough_v1";

export const walkthroughSteps: Record<UserRole, WalkthroughStep[]> = {
  USER: [
    {
      id: "welcome",
      target: "[data-walkthrough='dashboard-welcome']",
      page: "/dashboard",
      type: "modal",
      content: {
        en: "Welcome to InHouse! Let's take a quick tour to get you started with the platform.",
        es: "¡Bienvenido a InHouse! Hagamos un recorrido rápido para comenzar con la plataforma.",
        pt: "Bem-vindo ao InHouse! Vamos fazer um tour rápido para começar com a plataforma.",
      },
    },
    {
      id: "getting-started",
      target: "[data-walkthrough='getting-started-card']",
      page: "/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "This is your getting started checklist. Complete these steps to unlock all platform features.",
        es: "Esta es tu lista de tareas para comenzar. Completa estos pasos para desbloquear todas las funciones de la plataforma.",
        pt: "Esta é sua lista de tarefas para começar. Complete esses passos para desbloquear todos os recursos da plataforma.",
      },
    },
    {
      id: "profile-completion",
      target: "[data-walkthrough='profile-card']",
      page: "/dashboard",
      type: "tooltip",
      position: "bottom",
      content: {
        en: "Keep track of your profile completion here. A complete profile helps your church community connect with you.",
        es: "Mantén un seguimiento de la finalización de tu perfil aquí. Un perfil completo ayuda a tu comunidad de iglesia a conectarse contigo.",
        pt: "Acompanhe aqui a conclusão do seu perfil. Um perfil completo ajuda sua comunidade da igreja a se conectar com você.",
      },
    },
    {
      id: "church-community",
      target: "[data-walkthrough='church-community-card']",
      page: "/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "This shows your church membership status. Join a church to access community resources and connect with others.",
        es: "Esto muestra el estado de tu membresía en la iglesia. Únete a una iglesia para acceder a recursos comunitarios y conectarte con otros.",
        pt: "Isso mostra o status da sua membresia na igreja. Junte-se a uma igreja para acessar recursos da comunidade e se conectar com outros.",
      },
    },
    {
      id: "quick-actions",
      target: "[data-walkthrough='quick-actions-card']",
      page: "/dashboard",
      type: "tooltip",
      position: "bottom",
      content: {
        en: "Use these quick actions to navigate to important features like the community directory and sharing messages.",
        es: "Usa estas acciones rápidas para navegar a funciones importantes como el directorio comunitario y compartir mensajes.",
        pt: "Use essas ações rápidas para navegar para recursos importantes como o diretório da comunidade e compartilhar mensagens.",
      },
    },
    {
      id: "directory-navigation",
      target: "[data-walkthrough='directory-button']",
      page: "/dashboard",
      type: "tooltip",
      position: "center",
      content: {
        en: "Click here to browse the community directory and discover skills and services from other members.",
        es: "Haz clic aquí para navegar por el directorio comunitario y descubrir habilidades y servicios de otros miembros.",
        pt: "Clique aqui para navegar pelo diretório da comunidade e descobrir habilidades e serviços de outros membros.",
      },
    },
  ],
  CHURCH: [
    // Church walkthrough steps will be added later
  ],
  ADMIN: [
    // Admin walkthrough steps will be added later
  ],
};

export function getStepsForRole(role: UserRole): WalkthroughStep[] {
  return walkthroughSteps[role] || [];
}

export function getStepById(
  stepId: string,
  role: UserRole
): WalkthroughStep | undefined {
  return getStepsForRole(role).find((step) => step.id === stepId);
}
