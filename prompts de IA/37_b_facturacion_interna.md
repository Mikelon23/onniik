# Especificaciones de Alta Fidelidad: Facturación Interna

Este documento especifica la maquetación HTML, el diseño del simulador de tarjeta de crédito y los estilos CSS avanzados de la sección de facturación interna de Onniik (`/dashboard/billing`), permitiendo al usuario controlar su plan, método de pago y comisiones acumuladas.

---

## 1. Maquetación HTML de la Sección de Facturación

La vista contiene el bloque del plan actual contratado, el widget de método de pago configurado y la tabla de auditoría de cobros realizados por Onniik:

```html
<div class="billing-container">
  <!-- Cabecera de Facturación -->
  <div class="billing-header">
    <h2>Facturación y Suscripción</h2>
    <p class="billing-desc">Administra el plan de tu organización, método de pago y consulta tus facturas internas.</p>
  </div>

  <!-- Fila Superior: Plan Activo y Método de Pago -->
  <div class="billing-top-row">
    <!-- Card del Plan Activo -->
    <div class="plan-card glass-card pricing-featured">
      <div class="plan-info">
        <span class="plan-badge">Plan Activo</span>
        <h3>Onniik Growth</h3>
        <p class="plan-sub">SaaS Premium + 10% Success Fee sobre ahorros reales.</p>
      </div>
      <div class="plan-price-block">
        <div class="plan-price">$49.00 <span class="period">/ mes</span></div>
        <p class="savings-acc">Comisiones acumuladas este mes: <strong>$20.00 USD</strong></p>
      </div>
    </div>

    <!-- Card del Método de Pago (Tarjeta Simulada) -->
    <div class="payment-method-card glass-card">
      <h4>Método de Pago Activo</h4>
      <div class="credit-card-mockup">
        <div class="card-chip"></div>
        <div class="card-number">•••• •••• •••• 4242</div>
        <div class="card-meta">
          <div>
            <span class="card-label">Titular</span>
            <span class="card-value">Miguel Ángel</span>
          </div>
          <div>
            <span class="card-label">Expira</span>
            <span class="card-value">12 / 29</span>
          </div>
        </div>
      </div>
      <button class="btn btn-outline btn-sm btn-update-payment">Actualizar Tarjeta</button>
    </div>
  </div>

  <!-- Historial de Facturas de Onniik -->
  <div class="billing-history glass-card">
    <h3>Historial de Pagos</h3>
    <div class="table-responsive">
      <table class="saas-table">
        <thead>
          <tr>
            <th>ID Factura</th>
            <th>Fecha de Cobro</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ON-INV-2026-003</td>
            <td>01 Jun 2026</td>
            <td>Onniik Growth (Junio) + Success Fee (Mayo)</td>
            <td>$69.00 USD</td>
            <td><span class="badge badge-success">Pagado</span></td>
            <td><button class="btn btn-outline btn-sm">Descargar PDF</button></td>
          </tr>
          <tr>
            <td>ON-INV-2026-002</td>
            <td>01 May 2026</td>
            <td>Onniik Growth (Mayo) + Success Fee (Abril)</td>
            <td>$49.00 USD</td>
            <td><span class="badge badge-success">Pagado</span></td>
            <td><button class="btn btn-outline btn-sm">Descargar PDF</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Estilos avanzados para diseñar el simulador de tarjeta de crédito Glassmorphic y las tarjetas principales:

```css
/* --- Estructura de la Fila Superior --- */
.billing-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.billing-top-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--spacing-lg);
}

@media (max-width: 992px) {
  .billing-top-row {
    grid-template-columns: 1fr;
  }
}

/* --- Plan Card --- */
.plan-card {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
}

.plan-badge {
  background-color: rgba(0, 240, 255, 0.1);
  color: var(--accent-cyan);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: var(--spacing-sm);
}

.plan-card h3 {
  font-family: var(--font-title);
  font-size: 22px;
  margin-bottom: 2px;
}

.plan-sub {
  font-size: 13px;
  color: var(--text-muted);
}

.plan-price-block {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.plan-price {
  font-size: 32px;
  font-weight: 700;
  font-family: var(--font-title);
}

.plan-price .period {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 400;
}

.savings-acc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* --- Simulador de Tarjeta de Crédito (Mockup) --- */
.payment-method-card {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.credit-card-mockup {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.card-chip {
  width: 32px;
  height: 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.card-number {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  margin: var(--spacing-sm) 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  text-transform: uppercase;
}

.card-label {
  display: block;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.card-value {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-update-payment {
  align-self: flex-start;
}
```

---

## 3. Interactividad y Pasarela Segura (Stripe Elements Integration)

*   **Pautas de Foco**: El botón `.btn-update-payment` debe tener una transición de hover suave que aplique un borde cian eléctrico.
*   **Seguridad y Sandboxing**: Al actualizar el método de pago, el modal debe inicializar un iframe de Stripe Elements, previniendo que cualquier dato sensitivo de tarjeta pase directamente por los servidores de Onniik (respetando los lineamientos de cumplimiento de la matriz de riesgos).
