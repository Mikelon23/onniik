import javascriptLogo from '../assets/javascript.svg';
import viteLogo from '../assets/vite.svg';
import heroImg from '../assets/hero.png';

export function Home() {
  return `
    <section id="center">
      <div class="hero">
        <img src="${heroImg}" class="base" width="170" height="179" alt="Hero Base">
        <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
        <img src="${viteLogo}" class="vite" alt="Vite logo" />
      </div>
      <div>
        <h1>Get started</h1>
        <p>Edit <code>src/pages/Home.js</code> and save to test <code>HMR</code></p>
      </div>
      <button id="counter" type="button" class="counter">count is 0</button>
    </section>

    <div class="ticks"></div>

    <section id="next-steps">
      <div id="docs">
        <h2>Documentation</h2>
        <p>Your questions, answered</p>
        <ul>
          <li>
            <a href="https://vite.dev/" target="_blank">
              <img class="logo" src="${viteLogo}" alt="" />
              Explore Vite
            </a>
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
              <img class="button-icon" src="${javascriptLogo}" alt="">
              Learn more
            </a>
          </li>
        </ul>
      </div>
      <div id="social">
        <h2>Connect with us</h2>
        <p>Join the Vite community</p>
        <ul>
          <li><a href="https://github.com/vitejs/vite" target="_blank">GitHub</a></li>
          <li><a href="https://chat.vite.dev/" target="_blank">Discord</a></li>
          <li><a href="https://x.com/vite_js" target="_blank">X.com</a></li>
          <li><a href="https://bsky.app/profile/vite.dev" target="_blank">Bluesky</a></li>
        </ul>
      </div>
    </section>

    <div class="ticks"></div>
    <section id="spacer"></section>
  `;
}

export function initHome() {
  const counterBtn = document.querySelector('#counter');
  if (counterBtn) {
    let count = 0;
    counterBtn.addEventListener('click', () => {
      count++;
      counterBtn.innerHTML = `count is ${count}`;
    });
  }
}
