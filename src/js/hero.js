export function initHero() {
  // Показ телефона
  const phoneBtns = document.querySelectorAll('[data-cta="show-phone"]');
  const phoneNumber = "+7 (999) 000-00-00";
  phoneBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.textContent = phoneNumber;
      btn.classList.remove("bg-white/10");
      btn.classList.add("bg-emerald-600", "text-white");
      btn.setAttribute("aria-label", `Позвонить ${phoneNumber}`);
    });
  });

  // Скролл к бронированию
  document.querySelector('[data-cta="book"]')?.addEventListener("click", (e) => {
    const target = document.querySelector("#booking");
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  });

  // Скролл к отзывам (если есть якорь)
  document.querySelectorAll('a[href="#reviews"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#reviews")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}
