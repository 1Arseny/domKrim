export function initHero() {
  // Показ телефона по клику (подставь свой номер)
  const phoneBtns = document.querySelectorAll('[data-cta="show-phone"]');
  const phoneNumber = "+7 (999) 000-00-00";
  phoneBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.textContent = phoneNumber;
      btn.classList.remove("bg-white/10");
      btn.classList.add("bg-emerald-600");
      btn.classList.add("text-white");
      btn.setAttribute("aria-label", `Позвонить ${phoneNumber}`);
    });
  });

  // Плавный скролл к форме бронирования
  const bookLink = document.querySelector('[data-cta="book"]');
  const target = document.querySelector("#booking");
  bookLink?.addEventListener("click", (e) => {
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document
    .querySelectorAll('a[href="#reviews"]')
    .forEach((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#reviews")?.scrollIntoView({ behavior: "smooth" });
      })
    );
}
