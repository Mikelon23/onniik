# Sistema de Diseño en CSS Vanilla: Ficha de Estilos

Este documento define la estructura técnica del sistema de diseño visual de Onniik, traduciendo la identidad "Premium Dark Mode" a variables y componentes CSS vanilla para su implementación directa en el desarrollo de la interfaz.

---

## 1. Variables Globales de CSS (`:root`)

El siguiente bloque de código CSS define la paleta de colores, la tipografía y la rejilla de espaciado estándar del proyecto:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap');

:root {
  /* --- Colores Base --- */
  --bg-primary: #0A0F1D;     /* Deep Navy: Fondo general */
  --bg-secondary: #0E1529;   /* Navy Oscuro: Elementos secundarios o barra lateral */
  --bg-card: rgba(22, 28, 45, 0.45); /* Card Grey con transparencia */
  
  /* --- Acentos Semánticos --- */
  --accent-cyan: #00F0FF;    /* Electric Cyan: Botones primarios, KPI destacados */
  --accent-blue: #2F69FF;    /* Connected Blue: Integraciones y alertas activas */
  --accent-amber: #FFB800;   /* Warning Amber: Alertas preventivas */
  --accent-red: #FF3B30;     /* Critical Red: Alertas críticas y peligro */
  
  /* --- Colores de Texto --- */
  --text-primary: #FFFFFF;
  --text-secondary: #E2E8F0;
  --text-muted: #8A94A6;
  
  /* --- Bordes y Efectos --- */
  --border-color: rgba(255, 255, 255, 0.06);
  --border-color-hover: rgba(0, 240, 255, 0.25);
  --shadow-card: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glow-cyan: 0 0 15px rgba(0, 240, 255, 0.3);
  
  /* --- Tipografía --- */
  --font-title: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* --- Escala de Espaciado --- */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* --- Radios de Borde --- */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
}
```

---

## 2. Reseteo Global y Base CSS

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-title);
  color: var(--text-primary);
  font-weight: 600;
}

a {
  color: var(--accent-cyan);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}
```

---

## 3. Clases de Utilidad y Efectos Premium

### A. Glassmorphism Card:
```css
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.glass-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
}
```

### B. Botones Interactivos:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-title);
  font-weight: 500;
  font-size: 14px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Botón Primario: Cian eléctrico */
.btn-primary {
  background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);
  color: var(--bg-primary);
}

.btn-primary:hover {
  box-shadow: var(--glow-cyan);
  transform: scale(1.02);
}

/* Botón Secundario / Outline */
.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--text-primary);
}

/* Botón Crítico / Peligro */
.btn-danger {
  background: var(--accent-red);
  color: var(--text-primary);
}

.btn-danger:hover {
  opacity: 0.9;
  box-shadow: 0 0 10px rgba(255, 59, 48, 0.4);
}
```

### C. Efectos de Texto y Gradientes:
```css
.text-gradient {
  background: linear-gradient(90deg, #FFFFFF 0%, var(--accent-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-blur-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}
```
*   **Nota de Implementación**: El efecto `.bg-blur-glow` debe usarse en posiciones absolutas fijas en las esquinas de los fondos principales (`/dashboard` y `/copilot`) para simular la atmósfera de profundidad visual característica del estilo de marca.
