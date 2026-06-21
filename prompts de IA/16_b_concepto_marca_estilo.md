# Documento Conceptual de Marca y Estilo Visual

Este documento formaliza las directrices creativas y los componentes de diseño de Onniik, traduciendo la personalidad premium de la marca en clases de CSS concretas y reglas de composición de interfaz de usuario.

---

## 1. Concepto Creativo: "El Congelador de Costos" (The Cost Freezer)

La propuesta visual de Onniik se inspira en el concepto de **cristalización y enfriamiento de costos**. La acumulación incontrolada de SaaS se visualiza como un flujo caliente que Onniik "congela" y solidifica mediante datos limpios y procesos automatizados.
*   **Atmósfera Visual**: Fondos oscuros de noche polar (`--bg-primary`), elementos semánticos de interacción translúcidos como cristales de hielo (`Glassmorphism`), y acentos cianes luminosos (`--accent-cyan`) que simulan el brillo de la luz reflejada en el hielo para destacar el dinero ahorrado (ROI).

---

## 2. Directrices de Glassmorphism y Capas de UI

Para lograr una apariencia premium de alta gama, Onniik no utiliza tarjetas grises planas y sólidas. En su lugar, se implementan paneles translúcidos que simulan el vidrio esmerilado.

### Reglas de Implementación en CSS:
```css
/* Tarjeta de Vidrio Esmerilado (Glass Card) */
.glass-panel {
  background: rgba(15, 22, 34, 0.70); /* Fondo translúcido oscuro */
  backdrop-filter: blur(12px);         /* Desenfoque del fondo subyacente */
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08); /* Borde fino y luminoso */
  border-radius: 12px;                 /* Esquinas suavizadas */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); /* Sombra difusa de profundidad */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Efecto de Foco/Hover sobre Tarjeta */
.glass-panel:hover {
  border-color: rgba(0, 240, 255, 0.25); /* Iluminación del borde en cían */
  box-shadow: 0 8px 32px 0 rgba(0, 240, 255, 0.05); /* Glow sutil de fondo */
}
```

---

## 3. Especificación de Componentes del Sistema de Diseño

### A. Botones (Buttons)
Los botones deben tener transiciones suaves (`transition: all 0.2s ease-in-out`) y comportamientos reactivos al cursor.

```css
/* Botón Primario (Llamada a la Acción Principal) */
.btn-primary {
  background: var(--accent-cyan);
  color: #080b11; /* Texto oscuro para alto contraste */
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}
.btn-primary:hover {
  background: #00d6e6; /* Cían un poco más oscuro en hover */
  box-shadow: var(--shadow-glow); /* Glow intensificado */
}
.btn-primary:active {
  transform: scale(0.98); /* Micro-interacción de click */
}

/* Botón Secundario (Acciones de Segunda Jerarquía) */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 20px;
  backdrop-filter: blur(4px);
}
.btn-secondary:hover {
  border-color: var(--accent-cyan);
  background: rgba(0, 240, 255, 0.05);
}

/* Botón de Peligro (Cancelación / Desconexión) */
.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-red);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 10px 20px;
}
.btn-danger:hover {
  background: var(--accent-red);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}
```

### B. Campos de Entrada (Inputs)
Los inputs deben fundirse con el fondo oscuro y destacar únicamente al entrar en foco (Focus state).

```css
.input-field {
  background: rgba(8, 11, 17, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  border-radius: 6px;
  padding: 12px 16px;
  transition: border-color 0.2s ease;
}
.input-field:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.15);
}
```

### C. Tablas Financieras (Financial Tables)
Las tablas deben ser minimalistas, sin bordes verticales toscos, y facilitar la lectura horizontal.

```css
.financial-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
}
.financial-table th {
  text-align: left;
  padding: 14px 16px;
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
}
.financial-table td {
  padding: 16px;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
}
.financial-table tr {
  transition: background-color 0.2s ease;
}
.financial-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02); /* Sutil resaltado en hover */
}
```

---

## 4. Gradientes y Efectos de Iluminación de Alta Gama

Para elementos muy puntuales y de alto impacto, como el texto del número de ahorro total acumulado o las tarjetas destacadas, se implementan degradados lineales metálicos.

### Variables CSS de Gradientes:
```css
:root {
  /* Gradiente para textos y KPIs (Cían a Azul Cobalto) */
  --gradient-cyan-blue: linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%);
  
  /* Gradiente para bordes o decoraciones */
  --gradient-border-glow: linear-gradient(90deg, rgba(0, 240, 255, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%);
}

/* Aplicación de Texto Gradiente */
.text-gradient {
  background: var(--gradient-cyan-blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
*   **Restricción de Uso**: Estos efectos deben emplearse con moderación. Si se sobreutilizan los degradados y glows, el dashboard perderá elegancia y saturará visualmente al usuario.
