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

// Mobile-specific navigation step
const mobileNavigationStep: WalkthroughStep = {
  id: "church-mobile-navigation",
  target: '[data-sidebar="trigger"]',
  page: "/church/dashboard",
  type: "tooltip",
  position: "bottom",
  content: {
    en: "Navigation Menu - Tap here to access all church management features: Dashboard, Items, Members, Invitations, Messages, and Church Profile.",
    es: "Menú de Navegación - Toca aquí para acceder a todas las funciones de gestión de iglesia: Panel, Elementos, Miembros, Invitaciones, Mensajes y Perfil de Iglesia.",
    pt: "Menu de Navegação - Toque aqui para acessar todos os recursos de gerenciamento da igreja: Painel, Itens, Membros, Convites, Mensagens e Perfil da Igreja.",
  },
};

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
      id: "ping-notifications",
      target: "[data-walkthrough='home-icon-nav']",
      page: "/dashboard",
      type: "tooltip",
      position: "center",
      content: {
        en: "Watch for the red outline around the home icon in the top navigation - it indicates when other church members want to connect with you via ping requests!",
        es: "Observa el contorno rojo alrededor del ícono de inicio en la navegación superior: ¡indica cuando otros miembros de la iglesia quieren conectarse contigo a través de solicitudes de ping!",
        pt: "Observe o contorno vermelho ao redor do ícone inicial na navegação superior - indica quando outros membros da igreja querem se conectar com você através de solicitações de ping!",
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
    {
      id: "church-welcome",
      target: "[data-walkthrough='church-dashboard-welcome']",
      page: "/church/dashboard",
      type: "modal",
      content: {
        en: "Welcome to your Church Dashboard! Let's explore the tools available to manage your church community and resources.",
        es: "¡Bienvenido a tu Panel de Iglesia! Exploremos las herramientas disponibles para gestionar tu comunidad y recursos de iglesia.",
        pt: "Bem-vindo ao seu Painel da Igreja! Vamos explorar as ferramentas disponíveis para gerenciar sua comunidade e recursos da igreja.",
      },
    },
    {
      id: "church-nav-dashboard",
      target: "[data-walkthrough='church-nav-dashboard']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Dashboard - Your main overview page showing community impact metrics and recent activity.",
        es: "Panel - Tu página principal de resumen que muestra métricas de impacto comunitario y actividad reciente.",
        pt: "Painel - Sua página principal de visão geral mostrando métricas de impacto comunitário e atividade recente.",
      },
    },
    {
      id: "church-nav-items",
      target: "[data-walkthrough='church-nav-items']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "My Items - Create, manage, and track all resources your church shares with the community.",
        es: "Mis Elementos - Crea, gestiona y rastrea todos los recursos que tu iglesia comparte con la comunidad.",
        pt: "Meus Itens - Crie, gerencie e acompanhe todos os recursos que sua igreja compartilha com a comunidade.",
      },
    },
    {
      id: "church-nav-members",
      target: "[data-walkthrough='church-nav-members']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Members - Verify new members, manage your congregation, and handle membership requests.",
        es: "Miembros - Verifica nuevos miembros, gestiona tu congregación y maneja solicitudes de membresía.",
        pt: "Membros - Verifique novos membros, gerencie sua congregação e trate solicitações de membresia.",
      },
    },
    {
      id: "church-nav-invitations",
      target: "[data-walkthrough='church-nav-invitations']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Invitations - Track outreach efforts and see how your members are inviting others to join.",
        es: "Invitaciones - Rastrea esfuerzos de alcance y ve cómo tus miembros están invitando a otros a unirse.",
        pt: "Convites - Acompanhe esforços de alcance e veja como seus membros estão convidando outros para se juntar.",
      },
    },
    {
      id: "church-nav-messages",
      target: "[data-walkthrough='church-nav-messages']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Daily Messages - Broadcast important updates and announcements to your church community.",
        es: "Mensajes Diarios - Transmite actualizaciones importantes y anuncios a tu comunidad de iglesia.",
        pt: "Mensagens Diárias - Transmita atualizações importantes e anúncios para sua comunidade da igreja.",
      },
    },
    {
      id: "church-nav-profile",
      target: "[data-walkthrough='church-nav-profile']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Church Profile - Manage your church information, contact details, and organizational settings.",
        es: "Perfil de Iglesia - Gestiona la información de tu iglesia, detalles de contacto y configuraciones organizacionales.",
        pt: "Perfil da Igreja - Gerencie informações da sua igreja, detalhes de contato e configurações organizacionais.",
      },
    },
    {
      id: "church-stats-overview",
      target: "[data-walkthrough='church-stats-overview']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "bottom",
      content: {
        en: "These statistics show your church's community impact. Track total items posted, available resources, claimed items, and completed requests.",
        es: "Estas estadísticas muestran el impacto comunitario de tu iglesia. Rastrea elementos totales publicados, recursos disponibles, elementos reclamados y solicitudes completadas.",
        pt: "Essas estatísticas mostram o impacto comunitário da sua igreja. Acompanhe itens totais publicados, recursos disponíveis, itens reivindicados e solicitações concluídas.",
      },
    },
    {
      id: "church-item-status",
      target: "[data-walkthrough='church-item-status-card']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "right",
      content: {
        en: "Monitor the status of all items posted by your church. See what's available, claimed, completed, and pending approval.",
        es: "Monitorea el estado de todos los elementos publicados por tu iglesia. Ve qué está disponible, reclamado, completado y pendiente de aprobación.",
        pt: "Monitore o status de todos os itens postados pela sua igreja. Veja o que está disponível, reivindicado, concluído e pendente de aprovação.",
      },
    },
    {
      id: "church-recent-activity",
      target: "[data-walkthrough='church-recent-activity-card']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "left",
      content: {
        en: "View your most recently posted items and their current status. This helps you stay updated on community activity.",
        es: "Ve tus elementos publicados más recientemente y su estado actual. Esto te ayuda a mantenerte actualizado sobre la actividad comunitaria.",
        pt: "Veja seus itens postados mais recentemente e seu status atual. Isso ajuda você a se manter atualizado sobre a atividade da comunidade.",
      },
    },
    {
      id: "church-quick-actions",
      target: "[data-walkthrough='church-quick-actions-card']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "top",
      content: {
        en: "Quick access to essential church management features: post new items, manage existing ones, send daily messages, and moderate member posts.",
        es: "Acceso rápido a funciones esenciales de gestión de iglesia: publicar nuevos elementos, gestionar existentes, enviar mensajes diarios y moderar publicaciones de miembros.",
        pt: "Acesso rápido a recursos essenciais de gerenciamento da igreja: postar novos itens, gerenciar existentes, enviar mensagens diárias e moderar postagens de membros.",
      },
    },
    {
      id: "church-add-item",
      target: "[data-walkthrough='church-add-item-action']",
      page: "/church/dashboard",
      type: "tooltip",
      position: "center",
      content: {
        en: "Start here to post your first item! Share resources, services, or needs with your church community.",
        es: "¡Comienza aquí para publicar tu primer elemento! Comparte recursos, servicios o necesidades con tu comunidad de iglesia.",
        pt: "Comece aqui para postar seu primeiro item! Compartilhe recursos, serviços ou necessidades com sua comunidade da igreja.",
      },
    },
  ],
  ADMIN: [
    // Admin walkthrough steps will be added later
  ],
};

export function getStepsForRole(role: UserRole): WalkthroughStep[] {
  return walkthroughSteps[role] || [];
}

// New function to get mobile-optimized steps
export function getMobileOptimizedStepsForRole(
  role: UserRole,
  isMobile: boolean = false
): WalkthroughStep[] {
  const steps = getStepsForRole(role);

  if (!isMobile || role !== "CHURCH") {
    return steps;
  }

  // For mobile church dashboard, replace navigation steps with single mobile nav step
  const mobileSteps: WalkthroughStep[] = [];
  let skipNavigationSteps = false;

  for (const step of steps) {
    if (step.id === "church-nav-dashboard") {
      // Replace first navigation step with mobile navigation step
      mobileSteps.push(mobileNavigationStep);
      skipNavigationSteps = true;
    } else if (step.id === "church-nav-profile") {
      // Skip the last navigation step and resume normal steps
      skipNavigationSteps = false;
      continue;
    } else if (skipNavigationSteps && step.id.includes("church-nav-")) {
      // Skip all other navigation steps
      continue;
    } else {
      // Keep all non-navigation steps
      mobileSteps.push(step);
    }
  }

  return mobileSteps;
}

export function getStepById(
  stepId: string,
  role: UserRole
): WalkthroughStep | undefined {
  return getStepsForRole(role).find((step) => step.id === stepId);
}
