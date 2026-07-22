const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const topbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");

const updateTopbar = () => {
  if (!topbar || !hero) return;
  const threshold = Math.max(hero.offsetHeight - 80, 120);
  topbar.classList.toggle("is-solid", window.scrollY > threshold);
};

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
