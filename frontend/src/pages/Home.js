/**
 * Página de inicio de Onniik — Propuesta de valor y CTA
 */
export function Home() {
  return `
    <section class="home-hero">
      <div class="home-hero__badge">
        <span class="home-hero__badge-dot"></span>
        Plataforma en Beta Activa
      </div>
      <h1 class="home-hero__title">
        Congela el gasto en SaaS.<br/>Recupera el control.
      </h1>
      <p class="home-hero__subtitle">
        Onniik detecta software en la sombra, identifica licencias inactivas y
        negocia ahorros automatizados con inteligencia artificial — todo en un solo panel.
      </p>
      <div class="home-hero__cta">
        <a href="/login" class="btn btn-primary btn-lg" data-link id="home-cta-login">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px;flex-shrink:0;">
            <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          Iniciar Sesión
        </a>
        <a href="https://github.com/Mikelon23/onniik" target="_blank" rel="noopener" class="btn btn-ghost btn-lg" id="home-cta-github">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px;flex-shrink:0;">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          Ver en GitHub
        </a>
      </div>
    </section>

    <section class="home-features">
      <div class="home-features__header">
        <h2>Todo lo que necesitas para controlar tus costos de SaaS</h2>
        <p>Onniik unifica la visibilidad, el análisis y la acción en una sola plataforma inteligente.</p>
      </div>
      <div class="home-features__grid">
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Inventario Centralizado</h3>
          <p>Detecta automáticamente todos los SaaS activos de tu organización conectando Google Workspace y Slack.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Agente de IA Proactivo</h3>
          <p>El agente analiza inactividad de licencias y genera borradores de cancelación o negociación de descuentos.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8C12 8 8.5 10 8.5 14C8.5 15.933 10.067 17.5 12 17.5C13.933 17.5 15.5 15.933 15.5 14C15.5 10 12 8 12 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Detección de Shadow IT</h3>
          <p>Identifica herramientas no autorizadas compradas por equipos sin aprobación de IT o finanzas.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19V13M12 19V7M15 19V15M3 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Analíticas de Ahorro</h3>
          <p>Historial completo de las acciones de optimización, proyección de ahorros y ROI mensual en tiempo real.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Seguridad Enterprise</h3>
          <p>Autenticación con cookies HttpOnly, cifrado de tokens OAuth y roles granulares por organización (RBAC).</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 20H7C5.89543 20 5 19.1046 5 18V8L9 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 4V8H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12H15M9 16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Procesamiento de Facturas</h3>
          <p>Sube facturas PDF manualmente o conecta tu buzón de IT. La IA extrae automáticamente monto, proveedor y fecha.</p>
        </div>
      </div>
    </section>

    <section class="home-cta-bottom">
      <div class="home-cta-bottom__content">
        <h2>Listo para empezar?</h2>
        <p>Accede al panel de control y comienza a optimizar el gasto de tu organización hoy.</p>
        <a href="/login" class="btn btn-primary btn-lg" data-link id="home-cta-bottom-login">
          Acceder a Onniik
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;">
            <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  `;
}

/**
 * Inicialización de la página de inicio — sin lógica dinámica especial
 */
export function initHome() {
  // La página de inicio es mayoritariamente estática.
  // Los CTAs usan el sistema de data-link del router para SPA navigation.
}
