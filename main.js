import * as THREE from "three";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const topbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");

const updateTopbar = () => {
  if (!topbar || !hero) return;
  const threshold = Math.max(hero.offsetHeight - 90, 140);
  topbar.classList.toggle("is-solid", window.scrollY > threshold);
};

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

/* ---------- Scroll reveal (3D entrance) ---------- */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ---------- Hero 3D parallax ---------- */
const tiltSpace = document.querySelector("[data-tilt-space]");
const depthLayers = tiltSpace
  ? [...tiltSpace.querySelectorAll("[data-depth]")]
  : [];

const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const scrollParallax = { y: 0 };

const onPointerMove = (event) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  pointer.tx = (event.clientX - cx) / cx;
  pointer.ty = (event.clientY - cy) / cy;
};

if (!reducedMotion) {
  window.addEventListener("pointermove", onPointerMove, { passive: true });
}

const animateHeroParallax = () => {
  pointer.x += (pointer.tx - pointer.x) * 0.06;
  pointer.y += (pointer.ty - pointer.y) * 0.06;

  const scrollY = window.scrollY;
  scrollParallax.y = Math.min(scrollY, window.innerHeight) * 0.18;

  if (tiltSpace && !reducedMotion) {
    const stage = tiltSpace.querySelector(".hero__stage");
    if (stage) {
      const rx = pointer.y * -5;
      const ry = pointer.x * 7;
      stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 20;
        const x = pointer.x * depth * -0.35;
        const y = pointer.y * depth * -0.28 + scrollParallax.y * (depth / 80);
        layer.style.transform = `translate3d(${x}px, ${y}px, ${depth}px)`;
      });
    }
  }

  requestAnimationFrame(animateHeroParallax);
};

requestAnimationFrame(animateHeroParallax);

/* ---------- Card / map 3D tilt ---------- */
const tiltCards = document.querySelectorAll("[data-tilt]");

tiltCards.forEach((card) => {
  const inner = card.querySelector(".tilt-3d__inner");
  if (!inner || reducedMotion) return;

  const reset = () => {
    inner.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 16;
    const rotateX = (0.5 - y) * 12;

    inner.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(18px)`;
    inner.style.setProperty("--shine-x", `${x * 100}%`);
    inner.style.setProperty("--shine-y", `${y * 100}%`);
  });

  card.addEventListener("pointerleave", reset);
  card.addEventListener("pointercancel", reset);
});

/* ---------- Three.js ambient luxury scene ---------- */
const canvas = document.getElementById("scene3d");

if (canvas && !reducedMotion) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 7.2;

  const group = new THREE.Group();
  scene.add(group);

  const gold = new THREE.Color("#d4b56a");
  const copper = new THREE.Color("#b8733a");

  const ringMat = new THREE.MeshStandardMaterial({
    color: gold,
    metalness: 0.92,
    roughness: 0.28,
    transparent: true,
    opacity: 0.55,
  });

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.035, 24, 180),
    ringMat
  );
  ringA.rotation.x = Math.PI / 2.6;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.02, 24, 180),
    new THREE.MeshStandardMaterial({
      color: copper,
      metalness: 0.88,
      roughness: 0.34,
      transparent: true,
      opacity: 0.4,
    })
  );
  ringB.rotation.x = Math.PI / 3.2;
  ringB.rotation.y = 0.5;
  group.add(ringB);

  const sphereMat = new THREE.MeshStandardMaterial({
    color: gold,
    metalness: 0.95,
    roughness: 0.2,
    transparent: true,
    opacity: 0.7,
  });

  for (let i = 0; i < 10; i += 1) {
    const size = 0.04 + Math.random() * 0.08;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), sphereMat);
    const angle = (i / 10) * Math.PI * 2;
    const radius = 1.3 + (i % 3) * 0.45;
    orb.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.4) * 0.7,
      Math.sin(angle) * radius * 0.45
    );
    orb.userData = { angle, radius, speed: 0.2 + Math.random() * 0.35 };
    group.add(orb);
  }

  const key = new THREE.DirectionalLight(0xffe4b0, 1.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x3a3228, 0.55));
  const fill = new THREE.PointLight(0xb8733a, 1.1, 20);
  fill.position.set(-3, -1, 2);
  scene.add(fill);

  group.position.set(2.2, 0.4, 0);

  let scenePointerX = 0;
  let scenePointerY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      scenePointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      scenePointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  const renderLoop = () => {
    const t = clock.getElapsedTime();

    group.rotation.y = t * 0.12 + scenePointerX * 0.25;
    group.rotation.x = Math.sin(t * 0.2) * 0.12 + scenePointerY * 0.15;
    ringA.rotation.z = t * 0.35;
    ringB.rotation.z = -t * 0.22;

    group.children.forEach((child) => {
      if (!child.userData?.radius) return;
      const { angle, radius, speed } = child.userData;
      const a = angle + t * speed;
      child.position.x = Math.cos(a) * radius;
      child.position.y = Math.sin(a * 1.35) * 0.75;
      child.position.z = Math.sin(a) * radius * 0.45;
    });

    const fade = Math.max(0.15, 1 - window.scrollY / (window.innerHeight * 1.2));
    canvas.style.opacity = String(0.55 * fade);

    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  };

  renderLoop();
}
