import viteLogo from '../assets/vite.svg';

export function Header(currentPath) {
  const isHomeActive = currentPath === '/' ? 'active' : '';
  const isDashboardActive = currentPath === '/dashboard' ? 'active' : '';

  return `
    <header class="main-header">
      <a href="/" class="logo-container" data-link>
        <img src="${viteLogo}" class="logo-img" alt="Onniik Logo" />
        <span>Onniik</span>
      </a>
      <nav class="nav-links">
        <a href="/" class="${isHomeActive}" data-link>Inicio</a>
        <a href="/dashboard" class="${isDashboardActive}" data-link>Dashboard</a>
      </nav>
    </header>
  `;
}
