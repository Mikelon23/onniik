export function Footer() {
  const year = new Date().getFullYear();
  return `
    <footer class="main-footer">
      <p>&copy; ${year} Onniik - Congelador de Costos SaaS. Todos los derechos reservados.</p>
    </footer>
  `;
}
