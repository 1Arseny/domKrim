import './index.css';
import { initHero }   from './js/hero.js';
import { initSubnav } from './js/nav.js';

document.addEventListener('DOMContentLoaded', () => {
  initHero?.();
  initSubnav?.();
});
