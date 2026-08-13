document.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    initNavbar();
    initCounters();
    initActivityFilters();
    initScrollAnimations();
    initModals();
    initParallax();
});

/* ==========================================
   BACKGROUND CANVAS (Futuristic Particles Grid)
   ========================================== */
function initCanvas() {
    if (document.body && document.body.classList.contains('video-only')) return; // skip heavy canvas when video-only
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.floor(width < 768 ? 30 : 65);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }

    const mouse = { x: -9999, y: -9999 };

    // drifting color blobs
    const blobs = [
        { x: width * 0.05, y: height * 0.12, r: 260, dx: 0.02, dy: -0.01 },
        { x: width * 0.92, y: height * 0.22, r: 210, dx: -0.015, dy: 0.01 },
        { x: width * 0.36, y: height * 0.86, r: 160, dx: 0.01, dy: -0.008 }
    ];

    // tiny robotic drones (simple shapes)
    const bots = [];
    for (let i = 0; i < 6; i++) {
        bots.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, s: 10 + Math.random() * 10 });
    }

    function drawBlobs() {
        blobs.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;
            b.dx += (Math.random() - 0.5) * 0.002;
            b.dy += (Math.random() - 0.5) * 0.002;
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            g.addColorStop(0, 'rgba(168,50,70,0.28)');
            g.addColorStop(0.4, 'rgba(95,33,103,0.12)');
            g.addColorStop(1, 'rgba(7,9,19,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawCircuits(offset) {
        const gap = 80;
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = 'rgba(168,50,70,0.12)';
        ctx.lineWidth = 1;
        for (let x = -gap; x < width + gap; x += gap) {
            ctx.beginPath();
            ctx.moveTo((x + offset) % (gap * 2), 0);
            ctx.lineTo((x + offset) % (gap * 2), height);
            ctx.stroke();
        }
        for (let y = -gap; y < height + gap; y += gap) {
            ctx.beginPath();
            ctx.moveTo(0, (y + offset) % (gap * 2));
            ctx.lineTo(width, (y + offset) % (gap * 2));
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBots() {
        bots.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < -40) b.x = width + 40;
            if (b.x > width + 40) b.x = -40;
            if (b.y < -40) b.y = height + 40;
            if (b.y > height + 40) b.y = -40;

            // slight attraction/repel to mouse
            const dx = mouse.x - b.x;
            const dy = mouse.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d < 160) {
                b.vx -= dx / d * 0.002;
                b.vy -= dy / d * 0.002;
            }

            // draw simple drone icon (circle + antenna)
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(Math.atan2(b.vy, b.vx));
            ctx.fillStyle = 'rgba(95,33,103,0.95)';
            ctx.beginPath();
            ctx.ellipse(0, 0, b.s * 1.1, b.s * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(168,50,70,0.9)';
            ctx.beginPath();
            ctx.arc(b.s * 0.35, -b.s * 0.15, b.s * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    let circuitOffset = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // background subtle circuits
        circuitOffset += 0.3;
        drawCircuits(circuitOffset);

        // blob layers (behind particles)
        drawBlobs();

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const midx = (particles[i].x + particles[j].x) / 2;
                    const midy = (particles[i].y + particles[j].y) / 2;
                    const mdistMouse = Math.hypot(midx - mouse.x, midy - mouse.y);
                    const alpha = Math.max(0.02, 0.12 - dist / 800 - mdistMouse / 4000);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(168,50,70,${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach((p) => {
            // simple physics + mouse attraction
            const dxm = mouse.x - p.x;
            const dym = mouse.y - p.y;
            const md = Math.max(80, Math.hypot(dxm, dym));
            // gentle attraction when mouse is near
            if (md < 220) {
                p.vx += (dxm / md) * 0.06;
                p.vy += (dym / md) * 0.06;
            }
            p.vx *= 0.995;
            p.vy *= 0.995;
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -20 || p.x > width + 20) p.x = Math.random() * width;
            if (p.y < -20 || p.y > height + 20) p.y = Math.random() * height;

            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(6, p.size * 6));
            grd.addColorStop(0, 'rgba(168,50,70,0.85)');
            grd.addColorStop(0.2, 'rgba(168,50,70,0.6)');
            grd.addColorStop(1, 'rgba(95,33,103,0.06)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.2, p.size * 2.2), 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        });

        // foreground bots
        drawBots();

        requestAnimationFrame(animate);
    }

    // mouse interaction (only once)
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    animate();
}

/* ==========================================
   NAVBAR INTERACTIONS & HAMBURGER MENU
   ========================================== */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // Sticky navbar effect on scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        

        // Active Section Indicator
        let current = "";
        const sections = document.querySelectorAll("section");
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // Mobile menu toggle
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

/* ==========================================
   ANIMATED STATS COUNTER
   ========================================== */
function initCounters() {
    const counters = document.querySelectorAll(".counter");
    let animated = false;

    window.addEventListener("scroll", () => {
        const aboutSection = document.getElementById("about");
        const sectionPos = aboutSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight / 1.3;

        if (sectionPos < screenPos && !animated) {
            counters.forEach((counter) => {
                const target = +counter.getAttribute("data-target");
                const speed = 200;
                const updateCount = () => {
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target + "+";
                    }
                };
                updateCount();
            });
            animated = true;
        }
    });
}

/* ==========================================
   ACTIVITY CATEGORY FILTER
   ========================================== */
function initActivityFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const activityCards = document.querySelectorAll(".activity-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            activityCards.forEach((card) => {
                if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

/* ==========================================
   LIGHTBOX MODAL
   ========================================== */
function openLightbox(imgSrc) {
    const lightbox = document.getElementById("lightbox");
    const caption = document.getElementById("lightbox-caption");
    lightbox.style.display = "flex";
    caption.innerText = "Viewing Event Photo: " + imgSrc;
}

function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

/* ==========================================
   MODAL HANDLERS FOR ACTIVITY DETAILS
   ========================================== */
function initModals() {
    const triggers = document.querySelectorAll('.modal-trigger');
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-modal');
            openModal(id);
        });
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = 'flex';
}

function closeModal(e) {
    // allow calling from click handlers on close button or overlay
    if (!e) return;
    const modalEl = e.target.closest('.lightbox');
    if (modalEl) modalEl.style.display = 'none';
}

/* ==========================================
   FORM HANDLING
   ========================================== */
function handleFormSubmit(e) {
    e.preventDefault();
    alert("Thank you for reaching out! Your message placeholder action was triggered.");
}

/* ==========================================
   SCROLL REVEAL ANIMATION (Vanilla JS)
   ========================================== */
function initScrollAnimations() {
    const animatedNodes = document.querySelectorAll('.reveal, .zoom-in, .glass-card, .team-card, .activity-card, .platform-card');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
                setTimeout(() => el.classList.add('in-view'), delay * 1000);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    animatedNodes.forEach(el => {
        // add base reveal class if not present
        if (!el.classList.contains('reveal') && !el.classList.contains('zoom-in') && el.classList.contains('glass-card')) {
            el.classList.add('reveal');
        }
        obs.observe(el);
    });
}

/* Hero parallax reacting to mouse movement */
function initParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    let lx = 0, ly = 0;
    window.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        const my = (e.clientY - rect.top) / rect.height - 0.5;
        lx += (mx * 40 - lx) * 0.08;
        ly += (my * 30 - ly) * 0.08;
        document.documentElement.style.setProperty('--mx', lx + 'px');
        document.documentElement.style.setProperty('--my', ly + 'px');
    });
}

/* Page transition overlay and link interception */
;(function() {
    const overlay = document.getElementById('page-overlay');
    if (!overlay) return;
    // ensure overlay is hidden on load
    window.addEventListener('load', () => {
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
    });

    // intercept internal anchor clicks to show overlay briefly
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;

        // Only show the page transition overlay for primary nav links.
        // Ignore CTA buttons, modal triggers, and other anchors.
        if (!a.classList.contains('nav-link')) return;

        // only intercept same-page anchors or internal navigation for nav links
        if (href.startsWith('#') || href.startsWith(window.location.pathname) || href.startsWith('./') || href.startsWith('../')) {
            // allow normal anchor navigation for hashes but play overlay
            e.preventDefault();
            overlay.classList.remove('hidden');
            overlay.classList.add('active');
            setTimeout(() => {
                if (href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', href);
                    // hide overlay after short delay once scrolling completed (shortened)
                    setTimeout(() => { overlay.classList.remove('active'); overlay.classList.add('hidden'); }, 300);
                } else {
                    // for full page navigations, we let browser navigate — overlay will be hidden on the next page load
                    window.location.href = href;
                }
            }, 120);
        }
    });
})();