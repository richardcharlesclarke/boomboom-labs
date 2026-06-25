const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const canvas = document.querySelector("[data-hero-canvas]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const reveals = document.querySelectorAll(".reveal");

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
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  reveals.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 8, 4) * 55}ms`;
    observer.observe(item);
  });
} else {
  reveals.forEach((item) => item.classList.add("is-visible"));
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !prefersReducedMotion) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(42, Math.floor((width * height) / 26000));
    particles = Array.from({ length: count }, (_, index) => ({
      x: (index * 173) % width,
      y: (index * 97) % height,
      radius: 0.8 + ((index * 13) % 18) / 10,
      phase: index * 0.47,
      speed: 0.18 + ((index * 7) % 12) / 100,
    }));
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(width * 0.5, height * 0.34, 0, width * 0.5, height * 0.34, width * 0.72);
    gradient.addColorStop(0, "rgba(120, 112, 101, 0.16)");
    gradient.addColorStop(0.4, "rgba(174, 166, 153, 0.08)");
    gradient.addColorStop(1, "rgba(246, 244, 239, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const seconds = time / 1000;
    context.lineWidth = 1;

    particles.forEach((particle, index) => {
      const x = particle.x + Math.sin(seconds * particle.speed + particle.phase) * 26;
      const y = particle.y + Math.cos(seconds * particle.speed * 0.8 + particle.phase) * 18;

      context.beginPath();
      context.arc(x, y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(17, 16, 15, 0.16)";
      context.fill();

      for (let offset = 1; offset <= 2; offset += 1) {
        const other = particles[(index + offset * 7) % particles.length];
        const otherX = other.x + Math.sin(seconds * other.speed + other.phase) * 26;
        const otherY = other.y + Math.cos(seconds * other.speed * 0.8 + other.phase) * 18;
        const distance = Math.hypot(x - otherX, y - otherY);

        if (distance < 155) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(otherX, otherY);
          context.strokeStyle = `rgba(17, 16, 15, ${0.05 * (1 - distance / 155)})`;
          context.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  animationFrame = requestAnimationFrame(draw);

  window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame), { once: true });
}
