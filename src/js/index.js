import "../index.css";
import { initHero }   from "./hero.js";
import { initSubnav } from "./nav.js";

document.addEventListener("DOMContentLoaded", () => {
  initHero();
  initSubnav();
});
