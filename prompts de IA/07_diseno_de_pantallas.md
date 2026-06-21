# Diseño de Pantallas y Sistema Visual: Onniik

## Identidad Visual y Estilo de Diseño
Onniik utiliza un diseño **Premium Dark Mode** con detalles de **Glassmorphism** (efecto de vidrio esmerilado con bordes semi-transparentes y sombras difusas) inspirado en las interfaces SaaS modernas y sofisticadas.

### Tokens de Color (Variables CSS)
```css
:root {
  /* Paleta Base */
  --bg-primary: #080b11;     /* Azul oscuro profundo */
  --bg-secondary: #0f1622;   /* Azul grisáceo oscuro para tarjetas */
  --border-color: rgba(255, 255, 255, 0.08);
  
  /* Colores de Acento (Semáforo Onniik) */
  --accent-cyan: #00f0ff;    /* Cían frío - Ahorros y KPI primario */
  --accent-blue: #3b82f6;    /* Azul frío - Integraciones conectadas */
  --accent-orange: #f59e0b;  /* Naranja - Optimizable / Advertencia */
  --accent-red: #ef4444;     /* Rojo - Shadow IT / Alerta Crítica */
  
  /* Tipografía y Textos */
  --font-sans: 'Outfit', 'Inter', -apple-system, sans-serif;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  
  /* Efectos */
  --shadow-glow: 0 0 20px rgba(0, 240, 255, 0.15);
  --backdrop-blur: blur(12px);
}
```

---

## Jerarquía de Pantallas del Dashboard

### 1. Layout Principal (App Layout)
- **Barra Lateral Izquierda (Sidebar)**:
  - Logo: `Onniik` (en color cían brillante).
  - Enlaces: Dashboard, Suscripciones, Alertas, Chat de IA, Integraciones, Ajustes.
  - Sección inferior: Interruptor de modo oscuro/claro y tarjeta de perfil de usuario.
- **Cabecera (Header)**:
  - Título dinámico de la página activa.
  - Indicador de estado de sincronización global.
  - Botón de notificaciones (campana interactiva).

### 2. Estructura del Dashboard (Dashboard View)
- **Fila Superior (KPIs)**:
  - Tarjeta 1: *Gasto Mensual*. Texto grande en blanco, subtexto con tendencia.
  - Tarjeta 2: *Ahorros Proyectados*. Resaltado con borde cían y un sutil "glow" (`--shadow-glow`).
  - Tarjeta 3: *Shadow IT Detectado*. Si es mayor a 0, muestra un indicador parpadeante en rojo.
- **Sección Central**:
  - Panel izquierdo (66%): Gráfico de área dinámico con la tendencia de costos.
  - Panel derecho (33%): Resumen de las últimas alertas del Agente de IA.
- **Fila Inferior**:
  - Tabla rápida con las 5 herramientas con mayor inactividad de usuarios.

### 3. Vista de Alertas de Optimización (Alerts View)
- Formato de tarjetas apiladas con diseño de vidrio.
- Cada tarjeta contiene:
  - Logo del SaaS (ej. Slack).
  - Título: *"5 licencias inactivas detectadas en Slack"*.
  - Ahorro potencial: *"$75.00 USD/mes"*.
  - Botones de acción:
    - `[Descartar]` (Secundario, borde fino).
    - `[Optimizar con IA]` (Botón primario, fondo cían, texto oscuro, efecto de elevación al pasar el cursor).

### 4. Interfaz de Chat con Agente de IA (Chat View)
- Layout estilo chat de mensajería moderno.
- Área de mensajes con burbujas de texto diferenciadas:
  - Bot: Fondo oscuro, borde cían, icono de robot.
  - Usuario: Fondo azul de acento, texto blanco.
- Caja de entrada inferior flotante con bordes redondeados y botón de envío rápido.
