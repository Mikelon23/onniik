import { Header } from './Header.js';
import { Footer } from './Footer.js';

export function Layout(contentHtml, currentPath) {
  return `
    ${Header(currentPath)}
    <main style="flex-grow: 1; display: flex; flex-direction: column;">
      ${contentHtml}
    </main>
    ${Footer()}
  `;
}
