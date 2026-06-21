# Especificaciones de Alta Fidelidad: Landing Page Pública

Este documento especifica la maquetación HTML y las propiedades CSS avanzadas para construir la Landing Page pública de Onniik, estructurando la propuesta de valor de ahorro automatizado de SaaS, la tabla de tarifas y el contacto comercial.

---

## 1. Maquetación HTML de la Landing Page

La landing page se divide en la sección Hero, cuadrícula de funcionalidades principales, tabla de precios comparativa y el formulario de contacto para demostraciones personalizadas:

```html
<div class="landing-container">
  <!-- Navegación Pública -->
  <nav class="public-nav">
    <div class="logo">ONNIIK</div>
    <div class="nav-links">
      <a href="#features">Funciones</a>
      <a href="#pricing">Precios</a>
      <a href="/login" class="btn btn-outline btn-sm">Iniciar Sesión</a>
    </div>
  </nav>

  <!-- Sección Hero -->
  <section class="hero-section">
    <div class="bg-blur-glow" style="width: 600px; height: 600px; top: 10%; left: 50%; transform: translateX(-50%);"></div>
    
    <div class="hero-content">
      <h1 class="hero-title">El Congelador de Costos <br><span class="text-gradient">para tus Suscripciones SaaS</span></h1>
      <p class="hero-subtitle">Audita tus licencias en piloto automático, elimina aplicaciones fantasma (Shadow IT) y recupera asientos inactivos de Figma y Jira. Pagas solo el 10% del ahorro real comprobado.</p>
      <div class="hero-actions">
        <a href="/signup" class="btn btn-primary btn-lg btn-glow">Comenzar Gratis (SSO)</a>
        <a href="#contact" class="btn btn-outline btn-lg">Solicitar Demo</a>
      </div>
    </div>
  </section>

  <!-- Grid de Características -->
  <section id="features" class="features-section">
    <h2>Construido para el CFO Moderno</h2>
    <div class="features-grid">
      <div class="feature-card glass-card">
        <div class="feat-icon">[⚡]</div>
        <h3>Auditoría Asíncrona</h3>
        <p>Procesamiento de facturas y extracción de costos mediante OCR e IA sin configuraciones complejas.</p>
      </div>
      <div class="feature-card glass-card">
        <div class="feat-icon">[🔌]</div>
        <h3>Detección de Shadow IT</h3>
        <p>Sincronización segura con Google Workspace y Slack para identificar software no autorizado por el equipo.</p>
      </div>
    </div>
  </section>

  <!-- Tabla de Precios -->
  <section id="pricing" class="pricing-section">
    <h2>Tarifas Transparentes</h2>
    <div class="pricing-grid">
      <!-- Plan Free -->
      <div class="pricing-card glass-card">
        <h3>Plan Gratuito</h3>
        <div class="price">$0 <span class="period">/ mes</span></div>
        <p class="price-desc">Ideal para pequeñas empresas que inician su auditoría de costos.</p>
        <ul class="price-features">
          <li>Auditoría de hasta 5 SaaS</li>
          <li>1 usuario administrador</li>
          <li>Acceso al Onboarding Asistido</li>
        </ul>
        <a href="/signup" class="btn btn-outline">Comenzar Ahora</a>
      </div>

      <!-- Plan Híbrido Success Fee -->
      <div class="pricing-card glass-card pricing-featured">
        <div class="featured-badge">Más popular</div>
        <h3>Plan Growth (SaaS + Success Fee)</h3>
        <div class="price">$49 <span class="period">/ mes</span></div>
        <p class="price-desc">Para organizaciones en crecimiento. Pagas una suscripción fija + 10% del ahorro real que te generemos.</p>
        <ul class="price-features">
          <li>SaaS ilimitados</li>
          <li>Copilot ilimitado (Reclamaciones)</li>
          <li>Auditoría automatizada de Shadow IT</li>
          <li><strong>Garantía de Ahorro:</strong> Si no ahorras, te bonificamos la mensualidad fija.</li>
        </ul>
        <a href="/signup" class="btn btn-primary btn-glow">Activar Ahorro Inteligente</a>
      </div>
    </div>
  </section>

  <!-- Formulario de Contacto -->
  <section id="contact" class="contact-section">
    <div class="contact-box glass-card">
      <h2>Agenda una Demo con nuestro equipo</h2>
      <p>Entérate de cómo Onniik puede ayudarte a recortar hasta un 30% en costos de software subutilizados.</p>
      <form class="contact-form">
        <div class="form-group">
          <input type="text" class="form-input" placeholder="Nombre completo" required>
        </div>
        <div class="form-group">
          <input type="email" class="form-input" placeholder="Correo electrónico corporativo" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg">Enviar Solicitud</button>
      </form>
    </div>
  </section>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Estilos avanzados para la landing page, con efectos de brillo y estructura responsiva:

```css
/* --- Navegación Pública --- */
.public-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.logo {
  font-family: var(--font-title);
  color: var(--accent-cyan);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-links a {
  color: var(--text-muted);
  font-family: var(--font-body);
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--text-primary);
}

/* --- Hero Section --- */
.hero-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 100px var(--spacing-xl);
  overflow: hidden;
  min-height: 70vh;
}

.hero-content {
  max-width: 800px;
  z-index: 10;
}

.hero-title {
  font-size: 52px;
  line-height: 1.15;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* --- Tarjetas de Precios (Pricing) --- */
.pricing-section {
  padding: 80px var(--spacing-xl);
  text-align: center;
}

.pricing-section h2 {
  font-size: 32px;
  margin-bottom: var(--spacing-xl);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  max-width: 900px;
  margin: 0 auto;
  text-align: left;
}

.pricing-card {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.pricing-featured {
  border-color: var(--accent-cyan);
  box-shadow: 0 8px 30px rgba(0, 240, 255, 0.05);
}

.featured-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background-color: var(--accent-cyan);
  color: var(--bg-primary);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
}

.price {
  font-family: var(--font-title);
  font-size: 44px;
  font-weight: 700;
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
}

.price .period {
  font-size: 16px;
  color: var(--text-muted);
  font-weight: 400;
}

.price-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.price-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
}

.price-features li::before {
  content: '✓';
  color: var(--accent-cyan);
  margin-right: var(--spacing-sm);
  font-weight: bold;
}

/* --- Contacto --- */
.contact-section {
  padding: 80px var(--spacing-xl);
  display: flex;
  justify-content: center;
}

.contact-box {
  max-width: 600px;
  width: 100%;
  padding: var(--spacing-xl);
  text-align: center;
}

.contact-form {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
```
*   **Diseño Adaptable (Responsive)**: En resoluciones móviles inferiores a 768px, el grid de precios `.pricing-grid` y las acciones del hero `.hero-actions` colapsan automáticamente en una sola columna vertical (`grid-template-columns: 1fr;` y `flex-direction: column;`).
*   **Pautas de Foco**: Los campos del formulario de contacto y los enlaces de navegación deben contar con estilos de foco visible mediante un borde cian eléctrico.
