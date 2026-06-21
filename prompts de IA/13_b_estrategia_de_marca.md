# Estrategia de Marca e Identidad Visual: Onniik

Este documento define la personalidad de marca, las pautas de tono y voz, y las especificaciones visuales de la interfaz de usuario (colores, tipografía e iconografía) de la plataforma Onniik, asegurando una experiencia de usuario sofisticada y coherente.

---

## 1. Personalidad de la Marca, Tono y Voz

Onniik se posiciona como una herramienta inteligente de control financiero y optimización. Los tres pilares de nuestra personalidad de marca son:
*   **Inteligente y Analítica**: Basada en datos precisos y decisiones de Inteligencia Artificial que generan valor de forma pragmática e inmediata.
*   **Segura y Confiable**: Transmite total transparencia sobre la privacidad de datos corporativos, encriptación y control del usuario (Human-in-the-loop).
*   **Premium y Moderna**: Diseñada para impresionar a fundadores, CFOs y managers de TI a través de una interfaz sofisticada que rivalice con los mejores SaaS modernos del mercado.

### Pautas de Voz:
*   **Tono**: Profesional, sobrio, pragmático y de alta gama. Evita la jerga infantil, los emojis excesivos o el lenguaje redundante.
*   **Estilo de Comunicación**: Conciso y directo al grano (ej. *"Ahorro mensual proyectado: $1,200 USD"* en lugar de *"¡Genial! Hemos encontrado algunas formas divertidas de ahorrarte unos dólares"*).

---

## 2. Paleta de Colores de Alta Gama (Tokens CSS)

Onniik implementa una estética de **Premium Dark Mode** que utiliza una base oscura y profunda contrastada con detalles de **Glassmorphism** y colores de acento semánticos y vibrantes para guiar la atención.

### Definición Cromática (Variables de Color CSS):
```css
:root {
  /* Fondo y Contenedores Base */
  --bg-primary: #080b11;       /* Azul oscuro profundo (el lienzo base) */
  --bg-secondary: #0f1622;     /* Azul grisáceo oscuro (para tarjetas y paneles) */
  --border-color: rgba(255, 255, 255, 0.08); /* Bordes semi-transparentes finos */

  /* Colores de Acento (Semáforo Semántico de Onniik) */
  --accent-cyan: #00f0ff;      /* Cían frío - Ahorros, botones primarios y KPIs */
  --accent-blue: #3b82f6;      /* Azul cobalto - Estado de integraciones OAuth conectadas */
  --accent-orange: #f59e0b;    /* Naranja ámbar - Advertencias y licencias optimizables */
  --accent-red: #ef4444;       /* Coral rojo - Shadow IT, licencias huérfanas o alertas críticas */

  /* Tipografía y Jerarquía de Textos */
  --text-primary: #ffffff;     /* Texto principal brillante */
  --text-secondary: #94a3b8;   /* Texto secundario de alta legibilidad en fondo oscuro */
  --text-muted: #64748b;       /* Subtextos y fechas */

  /* Efectos y Sombras */
  --shadow-glow: 0 0 20px rgba(0, 240, 255, 0.15); /* Glow de cían para resaltar ROI */
  --backdrop-blur: blur(12px); /* Filtro para efecto vidrio esmerilado */
}
```

---

## 3. Sistema Tipográfico

La tipografía de Onniik proyecta modernidad geométrica combinada con una legibilidad excepcional en tablas de datos financieros densas.

### Fuentes Seleccionadas:
1.  **Outfit (Títulos y Headers)**: Una sans-serif geométrica contemporánea con formas circulares limpias, perfecta para logos, títulos y números grandes de KPIs financieros.
2.  **Inter (Cuerpo y Elementos de Interfaz)**: El estándar de oro para interfaces digitales de datos, optimizada para la legibilidad en pantallas oscuras de tamaño pequeño y en tablas.

### Jerarquía Tipográfica de la Interfaz:
*   **KPI Principal (Ahorros / Gasto)**: `font-family: 'Outfit'; font-size: 36px; font-weight: 700; color: var(--accent-cyan); text-shadow: var(--shadow-glow);`
*   **Título de Sección (H1)**: `font-family: 'Outfit'; font-size: 24px; font-weight: 600; color: var(--text-primary);`
*   **Encabezado de Tarjeta (H2)**: `font-family: 'Outfit'; font-size: 18px; font-weight: 600; color: var(--text-primary);`
*   **Cuerpo de Texto / Datos**: `font-family: 'Inter'; font-size: 14px; font-weight: 400; color: var(--text-secondary);`
*   **Micro-copy / Tooltips**: `font-family: 'Inter'; font-size: 12px; font-weight: 400; color: var(--text-muted);`

---

## 4. Iconografía Semántica (Lucide Icons Mapping)

Para el desarrollo del frontend de Onniik, se utilizará exclusivamente la librería **Lucide Icons** por sus trazos lineales, modernos y livianos.

### Mapeo de Iconos por Funciones:

| Icono de Lucide | Contexto de Uso en la Plataforma | Significado Visual |
|---|---|---|
| `TrendingUp` | KPI de Ahorros Proyectados y acumulados históricos. | Dirección positiva de optimización. |
| `ShieldAlert` | Indicador de Shadow IT y de aplicaciones no aprobadas detectadas en Slack. | Riesgo de seguridad o gobernanza. |
| `UserMinus` | Sección de "Reclamación de Asientos" (Seat Reclamation). | Acción de remover o dar de baja una cuenta. |
| `MailCheck` | Estado de un borrador de cancelación redactado por IA y aprobado para envío. | Aprobación humana de correo electrónico. |
| `Plug` | Módulo de Integraciones (Conectores OAuth de Google/Slack). | Conectividad y vinculación técnica. |
| `Bot` | Interfaz de Chat interactivo de IA (Onniik Bot). | Presencia y recomendaciones del agente de IA. |
| `Coins` | KPI de gasto mensual total e historial financiero de pagos de suscripciones. | Centros de costo monetarios. |
| `Settings` | Ajustes de cuenta, facturación y configuraciones generales de la organización. | Configuración técnica del panel. |

---

## 5. Identidad del Agente de IA: Onniik Bot

El bot conversacional y generador de borradores legales posee una identidad visual y de personalidad propia dentro de la aplicación:
*   **Nombre de Visualización**: `Onniik Copilot`
*   **Identidad Gráfica (Avatar)**: Icono `Bot` de Lucide, estilizado en color cían brillante (`--accent-cyan`) y rodeado por un sutil borde redondeado con el efecto de glow (`--shadow-glow`).
*   **Estilo del Mensaje de Bienvenida**:
    > *"Hola Sofía, he analizado las facturas y el directorio de Google Workspace de este mes. He identificado 3 licencias inactivas en Slack y 2 cuentas huérfanas en Jira que nos permitirían ahorrar $320 USD al mes. ¿Quieres que redacte los correos de cancelación por ti?"*
