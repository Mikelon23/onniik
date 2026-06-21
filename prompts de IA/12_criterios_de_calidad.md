# Criterios de Calidad: Estándares y Métricas

Para garantizar que Onniik sea un producto con calidad de grado comercial, se definen los siguientes criterios obligatorios:

---

## 1. Rendimiento y Velocidad (Performance KPIs)
- **Tiempo de Carga Inicial (LCP)**: Debe ser menor a 1.5 segundos en conexiones de banda ancha estándar.
- **Interactividad (FID / INP)**: Menor a 100 ms.
- **Optimización de Base de Datos**: Las consultas críticas del Dashboard (cálculos de costo y ahorro total) no deben tardar más de 200 ms en responder en el backend.
- **Puntuación Lighthouse**: Un mínimo de 90/100 en las cuatro categorías principales (Rendimiento, Accesibilidad, Prácticas Recomendadas y SEO).

---

## 2. Calidad y Estilo de Código (Code Standards)
- **TypeScript Estricto**: Habilitar `"strict": true` en el archivo `tsconfig.json`. Queda prohibido el uso de la tipificación `any` a menos que sea estrictamente necesario y esté debidamente comentado.
- **Linter**: Cero advertencias activas en el linter (`npm run lint` debe ejecutarse con éxito).
- **Husky Hooks**: No se permitirá realizar `git commit` si la suite de pruebas unitarias falla o si existen problemas de formato en el código modificado.

---

## 3. Accesibilidad (Web Accessibility)
- **WCAG 2.1 AA Compliance**:
  - Contraste de colores adecuado entre textos y fondos (mínimo ratio de 4.5:1 para texto normal).
  - Navegación completa por teclado para todas las opciones interactivas y botones de control del dashboard.
  - Atributos `aria-label` claros en todos los iconos sin etiqueta de texto.

---

## 4. Adaptabilidad y Compatibilidad
- **Responsive Design**: Visualización perfecta desde pantallas móviles de 360px hasta monitores Ultrawide de 2560px.
- **Cross-Browser**: Soporte completo para las últimas dos versiones estables de Google Chrome, Mozilla Firefox, Apple Safari y Microsoft Edge.
