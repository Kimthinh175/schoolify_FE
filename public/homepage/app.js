/* ==========================================================================
   SCHOOLIFY — ORIGAMI EXAM GLIDER & CONSTELLATION NIGHT-SKY (app.js)
   1. Academic Night-Sky Preloader (0 -> 100% + Paper-Plane Spark Line)
   2. Interactive "Chòm Sao Điểm 10" Constellation & Wingtip Contrail Canvas
   3. Morphing Header + Slide-Over Drawer + 9⚡ / 💎 Wallet HUD (1x/day rule)
   4. Full Origami Glider Choreography:
      - Hero Glider 3D Banking & Upward Takeoff Surge
      - Act II: Giant CAD Origami Exam Glider Horizontal Wipe (Right -> Left)
      - Act III: 1 -> 9 (1-3-5 Squadron) Origami Gliders + Kinetic Headline
      - Act IV: Vertical Top-to-Bottom Glider Flight Path & Stage Unlock
      - Act V: Night Observatory Parallax & Giant Thin Count-Up Metrics
   5. Interactive K-12 Catalog Filter + Live 9⚡ Daily Simulator
   ========================================================================== */

(() => {
  'use strict';

  document.documentElement.classList.add('js-ready');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Adaptive Hardware Tiering: Detect low-end CPUs, memory, or mobile connections
  const isLowEndDevice = (() => {
    if (typeof window === 'undefined') return false;
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const isSlowConn = navigator.connection && (navigator.connection.saveData || /2g|3g/.test(navigator.connection.effectiveType));
    return cores <= 4 || mem <= 4 || isMobile || isSlowConn;
  })();

  if (isLowEndDevice) {
    document.documentElement.classList.add('is-low-end');
  }

  // Lifecycle state & cleanup registry
  let isHomepageActive = false;
  let activeCanvasRaf = null;
  const activeCleanups = [];

  function addCleanup(fn) {
    if (typeof fn === 'function') activeCleanups.push(fn);
  }

  function destroyHomepage() {
    if (!isHomepageActive && !(typeof window !== 'undefined' && window.__schoolifyHomepageRunning)) return;
    isHomepageActive = false;
    if (typeof window !== 'undefined') {
      window.__schoolifyHomepageRunning = false;
    }

    if (activeCanvasRaf) {
      cancelAnimationFrame(activeCanvasRaf);
      activeCanvasRaf = null;
    }

    if (lenisInstance) {
      try {
        lenisInstance.destroy();
      } catch (err) {}
      lenisInstance = null;
    }

    if (typeof window !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      try {
        window.ScrollTrigger.getAll().forEach((st) => st.kill());
      } catch (err) {}
    }

    while (activeCleanups.length > 0) {
      const fn = activeCleanups.pop();
      try {
        fn();
      } catch (err) {}
    }
  }

  if (typeof window !== 'undefined') {
    window.__destroySchoolifyHomepage = destroyHomepage;
  }

  // =========================================================================
  // 1. CAD BLUEPRINT ORIGAMI PRELOADER & RUNWAY TAKEOFF
  // =========================================================================
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const loaderNum = document.getElementById('loaderNum');
    const loaderBar = document.getElementById('loaderBar');
    const loaderStatus = document.getElementById('loaderStatus');
    const loaderFacets = document.getElementById('loaderFacets');
    const drawPaths = preloader ? preloader.querySelectorAll('.loader-draw-path') : [];

    if (!preloader) {
      document.body.classList.remove('is-loading');
      return;
    }

    const hasSeen =
      (typeof window !== 'undefined' && Boolean(window.__schoolifyPreloaderShown)) ||
      (function () {
        try {
          return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('schoolify_preloader_seen') === '1';
        } catch (e) {
          return false;
        }
      })();

    if (hasSeen) {
      document.body.classList.remove('is-loading');
      preloader.classList.add('is-done');
      preloader.style.display = 'none';
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.add('preloader-cached');
      }
      return;
    }
    if (typeof window !== 'undefined') {
      window.__schoolifyPreloaderShown = true;
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('schoolify_preloader_seen', '1');
      }
    } catch (e) {}

    let finished = false;
    let lastStatusPhase = -1;

    const STATUS_MESSAGES = [
      'Đang khởi tạo ma trận Toán & Tin 2025...',
      'Đồng bộ 3 dạng trắc nghiệm & Gia Sư AI 24/7...',
      'Nạp 9 Tia sáng mỗi ngày — Kiểm tra đường băng...',
      'Sẵn sàng cất cánh — Chạm đỉnh điểm 10!'
    ];

    const finishLoader = () => {
      if (finished) return;
      finished = true;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('schoolify_preloader_seen', '1');
        }
      } catch (e) {}
      if (loaderNum) loaderNum.textContent = '100';
      if (loaderBar) loaderBar.style.width = '100%';
      if (loaderStatus) loaderStatus.textContent = STATUS_MESSAGES[3];
      if (loaderFacets) loaderFacets.style.opacity = '1';
      drawPaths.forEach((p) => {
        p.style.strokeDashoffset = '0';
      });

      preloader.classList.add('is-launching');

      setTimeout(() => {
        preloader.classList.add('is-done');
        preloader.style.display = 'none';
        document.body.classList.remove('is-loading');
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.classList.add('preloader-cached');
        }
      }, 210);
    };

    const failsafeTimer = setTimeout(finishLoader, 2400);

    if (prefersReducedMotion) {
      clearTimeout(failsafeTimer);
      finishLoader();
      return;
    }

    const duration = 1320;
    const start = performance.now();

    function step(now) {
      if (finished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const pct = Math.round(eased * 100);

      if (loaderNum) loaderNum.textContent = String(pct);
      if (loaderBar) loaderBar.style.width = `${pct}%`;

      // Self-drawing CAD Origami creases + gradual paper facet materialization
      const dashOffset = Math.max(0, 100 - eased * 108);
      drawPaths.forEach((p) => {
        p.style.strokeDashoffset = dashOffset.toFixed(2);
      });

      if (loaderFacets) {
        const facetAlpha = Math.max(0.06, Math.min(0.98, (eased - 0.35) / 0.62));
        loaderFacets.style.opacity = facetAlpha.toFixed(3);
      }

      // Update live telemetry status without unnecessary DOM writes
      const phase = pct < 35 ? 0 : pct < 72 ? 1 : pct < 98 ? 2 : 3;
      if (phase !== lastStatusPhase && loaderStatus) {
        lastStatusPhase = phase;
        loaderStatus.textContent = STATUS_MESSAGES[phase];
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(failsafeTimer);
        finishLoader();
      }
    }

    requestAnimationFrame(step);
  }

  // =========================================================================
  // 2. INTERACTIVE "CHÒM SAO ĐIỂM 10" NIGHT-SKY & WINGTIP CONTRAILS CANVAS
  // =========================================================================
  function initConstellationSkyCanvas() {
    const canvas = document.getElementById('skyCanvas');
    const heroSection = document.getElementById('hero');
    const vesselBody = document.getElementById('heroVesselBody');
    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isHeroVisible = true;
    let rafId = null;

    let gliderCx = 0;
    let gliderNoseY = 0;
    let gliderTailY = 0;
    let wingHalf = 72;

    const pointer = { x: -9999, y: -9999, active: false, fade: 0 };
    const GLYPHS = ['10★', '∫ f(x)', 'O(n log n)', 'Python', 'C++', 'SQL', 'Δ', 'log₂ n', 'Casio', 'Đúng/Sai', '9.8+', 'lim'];

    const constellationStars = [];
    const stardustTrail = [];
    const shootingStars = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection.clientWidth || window.innerWidth;
      height = heroSection.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pre-calculate and cache glider coordinates on resize (NO getBoundingClientRect in RAF!)
      gliderCx = width * 0.5;
      gliderNoseY = height * 0.48;
      gliderTailY = height * 0.84;
      wingHalf = Math.min(width * 0.22, 72);

      if (vesselBody) {
        const heroRect = heroSection.getBoundingClientRect();
        const bodyRect = vesselBody.getBoundingClientRect();
        if (bodyRect.width > 0) {
          gliderCx = bodyRect.left - heroRect.left + bodyRect.width * 0.5;
          gliderNoseY = bodyRect.top - heroRect.top + 8;
          gliderTailY = bodyRect.bottom - heroRect.top - 18;
          wingHalf = bodyRect.width * 0.48;
        }
      }

      constellationStars.length = 0;
      // Cap particle density to keep frame rendering < 16ms
      const count = isLowEndDevice ? 16 : width < 768 ? 22 : Math.min(46, Math.max(26, Math.floor((width * height) / 32000)));
      for (let i = 0; i < count; i++) {
        const hasGlyph = !isLowEndDevice && (i % 3 === 0);
        constellationStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 8,
          vy: 6 + Math.random() * 14,
          r: hasGlyph ? 2.0 : 1.1 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
          glyph: hasGlyph ? GLYPHS[i % GLYPHS.length] : null,
          isGold: i % 5 === 0
        });
      }
    }

    function spawnStardust(noseX, tailY, wingSpanHalf) {
      if (isLowEndDevice) return;
      const mode = Math.random();
      let sx = noseX;
      let sy = tailY;
      let vx = (Math.random() - 0.5) * 12;

      if (mode < 0.34) {
        sx = noseX - wingSpanHalf * 0.92 + (Math.random() - 0.5) * 5;
        sy = tailY + 12;
        vx = -5 - Math.random() * 8;
      } else if (mode < 0.68) {
        sx = noseX + wingSpanHalf * 0.92 + (Math.random() - 0.5) * 5;
        sy = tailY + 12;
        vx = 5 + Math.random() * 8;
      } else {
        sx = noseX + (Math.random() - 0.5) * 20;
        sy = tailY + Math.random() * 16;
      }

      const isSpark = Math.random() < 0.28;
      stardustTrail.push({
        x: sx,
        y: sy,
        vx,
        vy: 70 + Math.random() * 85,
        r: isSpark ? 2.2 : 1.1 + Math.random() * 2.0,
        life: 0,
        maxLife: 0.85 + Math.random() * 1.0,
        color: isSpark ? '251, 191, 36' : '0, 212, 255'
      });
    }

    function spawnShootingStar(originX, originY) {
      if (isLowEndDevice) return;
      const startX = originX ?? Math.random() * width * 0.8 + width * 0.1;
      const startY = originY ?? Math.random() * height * 0.35 + 40;
      const angle = Math.PI * 0.72 + (Math.random() - 0.5) * 0.25;
      const speed = 520 + Math.random() * 220;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.55,
        life: 0,
        maxLife: 0.65
      });
    }

    // e.offsetX/offsetY are relative to the event *target* (a child element such as the
    // headline or glider), not to the hero/canvas, which made the effect drift away from the
    // cursor. Always derive canvas-space coordinates from the hero's bounding rect instead.
    const toCanvasPoint = (e) => {
      const r = heroSection.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onPointerMove = (e) => {
      const p = toCanvasPoint(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onClick = (e) => {
      if (prefersReducedMotion) return;
      const p = toCanvasPoint(e);
      spawnShootingStar(p.x, p.y);
    };

    heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true });
    heroSection.addEventListener('click', onClick, { passive: true });

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Scroll-Pause Optimization: Completely free CPU & GPU during user scrolling
    let isUserScrolling = false;
    let scrollPauseTimer = null;

    const onScrollPause = () => {
      isUserScrolling = true;
      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        isUserScrolling = false;
        if (isHeroVisible && !rafId && !prefersReducedMotion) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(render);
          activeCanvasRaf = rafId;
        }
      }, 150);
    };

    window.addEventListener('scroll', onScrollPause, { passive: true });
    addCleanup(() => {
      window.removeEventListener('scroll', onScrollPause);
      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
    });

    let lastTime = performance.now();
    let nextAutoMeteor = lastTime + 3600;

    function render(now) {
      if (!isHeroVisible || isUserScrolling) {
        rafId = null;
        activeCanvasRaf = null;
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const targetFade = pointer.active ? 1 : 0;
      pointer.fade += (targetFade - pointer.fade) * (1 - Math.exp(-(pointer.active ? 10 : 4.5) * dt));
      if (pointer.fade < 0.01 && !pointer.active) pointer.fade = 0;

      ctx.clearRect(0, 0, width, height);

      // 1) Update & draw Constellation Stars + Academic Glyphs
      for (let i = 0; i < constellationStars.length; i++) {
        const s = constellationStars[i];
        if (!prefersReducedMotion) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.y > height + 24) {
            s.y = -20;
            s.x = Math.random() * width;
          }
          if (s.x < -20) s.x = width + 20;
          if (s.x > width + 20) s.x = -20;
        }

        const twinkle = 0.45 + 0.55 * Math.sin(now * 0.0028 + s.phase);
        const distCursor = pointer.fade > 0.02
          ? Math.hypot(s.x - pointer.x, s.y - pointer.y)
          : 9999;
        const nearCursor = distCursor < 170;

        const baseAlpha = 0.28 + twinkle * 0.48;
        const alpha = nearCursor ? baseAlpha + (0.98 - baseAlpha) * pointer.fade : baseAlpha;
        ctx.fillStyle = s.isGold
          ? `rgba(251, 191, 36, ${alpha.toFixed(3)})`
          : nearCursor && pointer.fade > 0.25
            ? `rgba(0, 212, 255, ${alpha.toFixed(3)})`
            : `rgba(226, 232, 240, ${alpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, nearCursor ? s.r * (1 + 0.4 * pointer.fade) : s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.glyph && (nearCursor || twinkle > 0.62)) {
          ctx.font = `${nearCursor && pointer.fade > 0.3 ? 600 : 500} 11px Inter, sans-serif`;
          ctx.fillStyle = nearCursor && pointer.fade > 0.3
            ? `rgba(0, 212, 255, ${(0.42 + 0.54 * pointer.fade).toFixed(3)})`
            : s.isGold
              ? 'rgba(251, 191, 36, 0.55)'
              : 'rgba(148, 163, 184, 0.42)';
          ctx.fillText(s.glyph, s.x + 6, s.y - 5);
        }
      }

      // 2) Draw Constellation Mesh Lines with early distance-squared bailout
      const maxDist = 110;
      const maxDistSq = maxDist * maxDist;
      ctx.lineWidth = 1;
      for (let i = 0; i < constellationStars.length; i++) {
        const a = constellationStars[i];
        const distA = pointer.fade > 0.02 ? Math.hypot(a.x - pointer.x, a.y - pointer.y) : 9999;

        // Connect star to cursor when hovering (fades out smoothly on pointerleave)
        if (distA < 160 && pointer.fade > 0.02) {
          const lineAlpha = (1 - distA / 160) * 0.5 * pointer.fade;
          ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();

          // Link energized stars near center to glider nose
          const dxNose = a.x - gliderCx;
          const dyNose = a.y - gliderNoseY;
          const dNoseSq = dxNose * dxNose + dyNose * dyNose;
          if (dNoseSq < 220 * 220) {
            const distNose = Math.sqrt(dNoseSq);
            ctx.strokeStyle = `rgba(251, 191, 36, ${((1 - distNose / 220) * 0.38 * pointer.fade).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(gliderCx, gliderNoseY);
            ctx.stroke();
          }
        }

        // Connect nearby stars into subtle academic constellations (O(N^2) early exit)
        for (let j = i + 1; j < constellationStars.length; j++) {
          const b = constellationStars[j];
          const dx = a.x - b.x;
          if (dx > maxDist || dx < -maxDist) continue;
          const dy = a.y - b.y;
          if (dy > maxDist || dy < -maxDist) continue;
          const dSq = dx * dx + dy * dy;
          if (dSq < maxDistSq) {
            const d = Math.sqrt(dSq);
            const boost = distA < 160 ? 0.12 + 0.3 * pointer.fade : 0.12;
            const segAlpha = (1 - d / maxDist) * boost;
            ctx.strokeStyle =
              distA < 160 && pointer.fade > 0.25
                ? `rgba(0, 212, 255, ${segAlpha.toFixed(3)})`
                : `rgba(148, 163, 184, ${segAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw glowing cursor star node when hovering
      if (pointer.fade > 0.02) {
        ctx.fillStyle = `rgba(0, 212, 255, ${(0.95 * pointer.fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 3.2 * pointer.fade, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3) Dual Wingtip Luminous Contrail Ribbons Behind Origami Glider
      const sway = prefersReducedMotion ? 0 : Math.sin(now * 0.003) * 5;
      const drawWingContrail = (startX, endSpread) => {
        const grad = ctx.createLinearGradient(startX, gliderTailY, startX + endSpread, height);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.62)');
        grad.addColorStop(0.5, 'rgba(0, 184, 221, 0.22)');
        grad.addColorStop(1, 'rgba(0, 184, 221, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, gliderTailY);
        ctx.quadraticCurveTo(
          startX + endSpread * 0.45,
          gliderTailY + 85,
          startX + endSpread + sway,
          height + 24
        );
        ctx.stroke();
      };

      drawWingContrail(gliderCx - wingHalf * 0.92, -36);
      drawWingContrail(gliderCx + wingHalf * 0.92, 36);

      // 4) Spawn & render streaming Stardust Wake (capped to 35 items)
      if (!prefersReducedMotion && stardustTrail.length < 35 && Math.random() < 0.6) {
        spawnStardust(gliderCx, gliderTailY, wingHalf);
      }

      for (let i = stardustTrail.length - 1; i >= 0; i--) {
        const p = stardustTrail[i];
        p.life += dt;
        if (p.life >= p.maxLife || p.y > height + 24) {
          stardustTrail.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const fade = (1 - p.life / p.maxLife) * 0.65;
        ctx.fillStyle = `rgba(${p.color}, ${fade.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5) Occasional Shooting Star across the Academic Night Sky
      if (!prefersReducedMotion && now > nextAutoMeteor) {
        spawnShootingStar();
        nextAutoMeteor = now + 4500 + Math.random() * 3500;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i];
        m.life += dt;
        if (m.life >= m.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const alpha = 1 - m.life / m.maxLife;
        const tailX = m.x - m.vx * 0.11;
        const tailY = m.y - m.vy * 0.11;
        const mGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        mGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha.toFixed(3)})`);
        mGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.strokeStyle = mGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      if (!prefersReducedMotion && isHeroVisible) {
        rafId = requestAnimationFrame(render);
        activeCanvasRaf = rafId;
      }
    }

    let heroObserver = null;
    if ('IntersectionObserver' in window) {
      heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !rafId && !prefersReducedMotion) {
              lastTime = performance.now();
              rafId = requestAnimationFrame(render);
              activeCanvasRaf = rafId;
            } else if (!isHeroVisible && rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
              activeCanvasRaf = null;
            }
          });
        },
        { threshold: 0.01 }
      );
      heroObserver.observe(heroSection);
    }

    addCleanup(() => {
      if (heroObserver) heroObserver.disconnect();
      heroSection.removeEventListener('pointermove', onPointerMove);
      heroSection.removeEventListener('pointerleave', onPointerLeave);
      heroSection.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        activeCanvasRaf = null;
      }
    });

    render(performance.now());
  }

  // =========================================================================
  // 3. SMOOTH SCROLL (LENIS) + MORPHING HEADER + DRAWER + WALLET HUD
  // =========================================================================
  let lenisInstance = null;

  function initSmoothScrollAndNav() {
    const siteHeader = document.getElementById('siteHeader');
    const menuDrawer = document.getElementById('menuDrawer');
    const menuOpenBtn = document.getElementById('menuOpenBtn');
    const menuCloseBtn = document.getElementById('menuCloseBtn');
    const menuBackdrop = document.getElementById('menuBackdrop');

    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0) && window.innerWidth < 768;
    if (typeof window.Lenis !== 'undefined' && !prefersReducedMotion && !isTouchDevice) {
      lenisInstance = new window.Lenis({
        duration: 1.12,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });

      if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', window.ScrollTrigger.update);
        const tickerFn = (time) => {
          if (lenisInstance) lenisInstance.raf(time * 1000);
        };
        window.gsap.ticker.add(tickerFn);
        window.gsap.ticker.lagSmoothing(0);
        addCleanup(() => {
          if (typeof window.gsap !== 'undefined' && window.gsap.ticker) {
            window.gsap.ticker.remove(tickerFn);
          }
        });
      } else {
        let smoothRafId = null;
        const raf = (time) => {
          if (lenisInstance) {
            lenisInstance.raf(time);
            smoothRafId = requestAnimationFrame(raf);
          }
        };
        smoothRafId = requestAnimationFrame(raf);
        addCleanup(() => {
          if (smoothRafId) cancelAnimationFrame(smoothRafId);
        });
      }

      addCleanup(() => {
        if (lenisInstance) {
          try {
            lenisInstance.destroy();
          } catch (e) {}
          lenisInstance = null;
        }
      });
    }

    const updateHeaderState = () => {
      if (!siteHeader) return;
      const threshold = Math.max(240, window.innerHeight * 0.72);
      siteHeader.classList.toggle('is-scrolled', window.scrollY > threshold);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState, { passive: true });
    addCleanup(() => {
      window.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', updateHeaderState);
    });

    const setDrawer = (open) => {
      if (!menuDrawer) return;
      menuDrawer.classList.toggle('is-open', open);
      menuDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    };

    if (menuOpenBtn) menuOpenBtn.addEventListener('click', () => setDrawer(true));
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', () => setDrawer(false));
    if (menuBackdrop) menuBackdrop.addEventListener('click', () => setDrawer(false));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setDrawer(false);
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();
        setDrawer(false);

        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: 0 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  let toastTimer = null;
  function showAppToast(message) {
    const toastEl = document.getElementById('appToast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 3600);
  }

  function initAuthAndWallet() {
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const hudWallet = document.getElementById('hudWallet');
    const hudTrigger = document.getElementById('hudTrigger');
    const hudPopover = document.getElementById('hudPopover');
    const memberNameLabel = document.getElementById('memberNameLabel');
    const logoutSimBtn = document.getElementById('logoutSimBtn');
    const dailyCheckinBtn = document.getElementById('dailyCheckinBtn');
    const checkinSubtext = document.getElementById('checkinSubtext');
    const checkinNotice = document.getElementById('checkinNotice');

    const headerRayCount = document.getElementById('headerRayCount');
    const headerGemCount = document.getElementById('headerGemCount');
    const popRayCount = document.getElementById('popRayCount');
    const popGemCount = document.getElementById('popGemCount');

    const authModal = document.getElementById('authModal');
    const authModalBackdrop = document.getElementById('authModalBackdrop');
    const authModalClose = document.getElementById('authModalClose');
    const authStepInit = document.getElementById('authStepInit');
    const authStepOtp = document.getElementById('authStepOtp');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const phoneLoginForm = document.getElementById('phoneLoginForm');
    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');
    const otpPhoneDisplay = document.getElementById('otpPhoneDisplay');
    const otpBackBtn = document.getElementById('otpBackBtn');
    const otpBoxesWrap = document.getElementById('otpBoxes');
    const otpInputs = otpBoxesWrap ? Array.from(otpBoxesWrap.querySelectorAll('input')) : [];
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const menuDrawer = document.getElementById('menuDrawer');

    let isLoggedIn = false;
    let memberTitle = 'Học viên Schoolify';
    let rays = 9;
    let gems = 20;
    let claimedToday = true;

    const syncMemberUI = () => {
      if (headerLoginBtn) headerLoginBtn.hidden = isLoggedIn;
      if (hudWallet) hudWallet.hidden = !isLoggedIn;
      if (memberNameLabel) memberNameLabel.textContent = memberTitle;

      if (headerRayCount) headerRayCount.textContent = String(rays);
      if (headerGemCount) headerGemCount.textContent = String(gems);
      if (popRayCount) popRayCount.textContent = String(rays);
      if (popGemCount) popGemCount.textContent = String(gems);

      if (checkinSubtext) {
        checkinSubtext.textContent = claimedToday
          ? 'Đã nhận 9 Tia sáng hôm nay (tự động cấp mới lúc 00:00).'
          : 'Mỗi ngày đăng nhập nhận cố định 9 Tia sáng (reset 00:00).';
      }
      if (dailyCheckinBtn) {
        dailyCheckinBtn.textContent = claimedToday ? 'Đã nhận hôm nay ✓' : 'Điểm danh +9';
        dailyCheckinBtn.classList.toggle('is-claimed', claimedToday);
      }
    };

    const setAuthModal = (open) => {
      if (!authModal) return;
      if (open && menuDrawer) {
        menuDrawer.classList.remove('is-open');
        menuDrawer.setAttribute('aria-hidden', 'true');
      }
      authModal.classList.toggle('is-open', open);
      authModal.setAttribute('aria-hidden', open ? 'false' : 'true');

      if (open) {
        if (authStepInit) authStepInit.hidden = false;
        if (authStepOtp) authStepOtp.hidden = true;
        if (phoneError) phoneError.hidden = true;
      }
    };

    const completeLogin = (displayLabel, methodText) => {
      isLoggedIn = true;
      memberTitle = displayLabel;
      rays = 9;
      gems = 20;
      claimedToday = true;
      if (checkinNotice) checkinNotice.hidden = true;
      syncMemberUI();
      setAuthModal(false);
      showAppToast(
        `${methodText} thành công! Chào mừng ${displayLabel} — bạn nhận được 9 Tia sáng hôm nay & 20 Ngọc Tri Thức khởi đầu.`
      );
    };

    // Open Login Modal from any [data-open-login] trigger
    document.querySelectorAll('[data-open-login]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) {
          if (menuDrawer) {
            menuDrawer.classList.remove('is-open');
            menuDrawer.setAttribute('aria-hidden', 'true');
          }
          if (hudPopover && hudTrigger) {
            hudPopover.classList.add('is-open');
            hudTrigger.setAttribute('aria-expanded', 'true');
          }
          showAppToast(`Bạn đang đăng nhập (${memberTitle}) — sẵn sàng vào luyện đề Toán & Tin!`);
          return;
        }
        setAuthModal(true);
      });
    });

    if (authModalClose) authModalClose.addEventListener('click', () => setAuthModal(false));
    if (authModalBackdrop) authModalBackdrop.addEventListener('click', () => setAuthModal(false));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setAuthModal(false);
    });

    // Option 1: 1-Click Google Login
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => {
        completeLogin('Học viên (Google)', 'Đăng nhập Google');
      });
    }

    // Option 2: Phone Number -> Send 6-Digit OTP
    if (phoneLoginForm && phoneInput) {
      phoneLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const digits = phoneInput.value.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 11) {
          if (phoneError) {
            phoneError.hidden = false;
            phoneError.textContent = 'Vui lòng nhập số điện thoại hợp lệ (9–10 chữ số).';
          }
          phoneInput.focus();
          return;
        }
        if (phoneError) phoneError.hidden = true;

        const cleanPhone = digits.startsWith('0') ? digits : `0${digits}`;
        if (otpPhoneDisplay) otpPhoneDisplay.textContent = cleanPhone;
        if (authStepInit) authStepInit.hidden = true;
        if (authStepOtp) authStepOtp.hidden = false;

        otpInputs.forEach((inp) => {
          inp.value = '';
        });
        if (otpInputs[0]) otpInputs[0].focus();
      });
    }

    if (otpBackBtn) {
      otpBackBtn.addEventListener('click', () => {
        if (authStepOtp) authStepOtp.hidden = true;
        if (authStepInit) authStepInit.hidden = false;
        if (phoneInput) phoneInput.focus();
      });
    }

    // 6-Box OTP Keyboard & Paste UX
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val.slice(-1);
        if (e.target.value && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          otpInputs[idx - 1].focus();
        } else if (e.key === 'Enter' && verifyOtpBtn) {
          verifyOtpBtn.click();
        }
      });

      input.addEventListener('paste', (e) => {
        const pasted = (e.clipboardData || window.clipboardData)
          .getData('text')
          .replace(/\D/g, '')
          .slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        pasted.split('').forEach((ch, i) => {
          if (otpInputs[i]) otpInputs[i].value = ch;
        });
        const focusIdx = Math.min(pasted.length, otpInputs.length - 1);
        if (otpInputs[focusIdx]) otpInputs[focusIdx].focus();
      });
    });

    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        const code = otpInputs.map((i) => i.value).join('');
        if (code.length < 6) {
          const firstEmpty = otpInputs.find((i) => !i.value) || otpInputs[0];
          if (firstEmpty) firstEmpty.focus();
          showAppToast('Vui lòng nhập đủ 6 chữ số mã xác thực OTP.');
          return;
        }
        const shownPhone = otpPhoneDisplay ? otpPhoneDisplay.textContent : 'SĐT';
        const masked =
          shownPhone.length >= 7
            ? `${shownPhone.slice(0, 4)}***${shownPhone.slice(-3)}`
            : shownPhone;
        completeLogin(`Học viên (${masked})`, 'Xác thực OTP');
      });
    }

    // Member Wallet Popover Controls
    const showNotice = (msg, isWarn = false) => {
      if (!checkinNotice) return;
      checkinNotice.hidden = false;
      checkinNotice.textContent = msg;
      checkinNotice.classList.toggle('is-warn', isWarn);
    };

    if (hudTrigger && hudPopover) {
      hudTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !hudPopover.classList.contains('is-open');
        hudPopover.classList.toggle('is-open', willOpen);
        hudTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (hudWallet && !hudWallet.contains(e.target)) {
          hudPopover.classList.remove('is-open');
          hudTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (dailyCheckinBtn) {
      dailyCheckinBtn.addEventListener('click', () => {
        if (!claimedToday) {
          claimedToday = true;
          rays = 9;
          syncMemberUI();
          showNotice('Đã cấp cố định 9 Tia sáng hôm nay vào ví học viên!', false);
        } else {
          showNotice('Bạn đã nhận đủ 9 Tia sáng hôm nay. Hạn mức reset vào 00:00 ngày mai!', true);
        }
      });
    }

    if (logoutSimBtn) {
      logoutSimBtn.addEventListener('click', () => {
        isLoggedIn = false;
        if (hudPopover) hudPopover.classList.remove('is-open');
        if (hudTrigger) hudTrigger.setAttribute('aria-expanded', 'false');
        syncMemberUI();
        showAppToast('Đã đăng xuất về giao diện Khách xem trang chủ.');
      });
    }

    syncMemberUI();
  }

  // =========================================================================
  // 4. ORIGAMI EXAM GLIDER SCROLL CHOREOGRAPHY (GSAP + NATIVE FALLBACK)
  // =========================================================================
  function initOrigamiChoreography() {
    const heroSection = document.getElementById('hero');
    const heroGliderRig = document.getElementById('heroShipRig');

    let pointerX = 0;
    let pointerY = 0;
    let bankDeg = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetBankDeg = 0;
    let isPointerInside = false;
    let scrollSurgeY = 0;
    let scrollScale = 1;

    const applyHeroGliderTransform = () => {
      if (!heroGliderRig) return;
      heroGliderRig.style.transform = `translate3d(${pointerX.toFixed(2)}px, ${(scrollSurgeY + pointerY).toFixed(2)}px, 0) rotate(${bankDeg.toFixed(2)}deg) scale(${scrollScale.toFixed(3)})`;
    };

    if (heroSection && heroGliderRig && !prefersReducedMotion && !isLowEndDevice) {
      let gliderLerpRaf = 0;
      let lastLerpTime = 0;
      let heroRect = null;

      const updateHeroRect = () => {
        if (heroSection) heroRect = heroSection.getBoundingClientRect();
      };
      window.addEventListener('resize', updateHeroRect, { passive: true });
      addCleanup(() => window.removeEventListener('resize', updateHeroRect));

      const stepHeroGliderLerp = (now) => {
        const dt = lastLerpTime ? Math.min(0.05, Math.max(0.001, (now - lastLerpTime) / 1000)) : 0.016;
        lastLerpTime = now;

        // Khi đang di chuột: bám mượt (speed 9.5); khi mất dấu chuột (vào chatbox/ra ngoài): lướt êm về tâm (speed 4.2)
        const speed = isPointerInside ? 9.5 : 4.2;
        const alpha = 1 - Math.exp(-speed * dt);

        pointerX += (targetPointerX - pointerX) * alpha;
        pointerY += (targetPointerY - pointerY) * alpha;
        bankDeg += (targetBankDeg - bankDeg) * alpha;

        const remX = Math.abs(targetPointerX - pointerX);
        const remY = Math.abs(targetPointerY - pointerY);
        const remB = Math.abs(targetBankDeg - bankDeg);

        if (remX < 0.04 && remY < 0.04 && remB < 0.02) {
          pointerX = targetPointerX;
          pointerY = targetPointerY;
          bankDeg = targetBankDeg;
          applyHeroGliderTransform();
          gliderLerpRaf = 0;
          lastLerpTime = 0;
          return;
        }

        applyHeroGliderTransform();
        gliderLerpRaf = requestAnimationFrame(stepHeroGliderLerp);
      };

      const ensureGliderLerpRunning = () => {
        if (!gliderLerpRaf) {
          lastLerpTime = performance.now();
          gliderLerpRaf = requestAnimationFrame(stepHeroGliderLerp);
        }
      };

      const onHeroPointerEnter = () => {
        isPointerInside = true;
        updateHeroRect();
      };

      const onHeroPointerMove = (e) => {
        isPointerInside = true;
        if (!heroRect) updateHeroRect();
        const r = heroRect || { left: 0, top: 0, width: window.innerWidth, height: 600 };
        const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / (r.width || 1) - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / (r.height || 1) - 0.5));
        targetPointerX = nx * 24;
        targetPointerY = ny * 12;
        targetBankDeg = nx * 5.5;
        ensureGliderLerpRunning();
      };

      const onHeroPointerLeave = () => {
        isPointerInside = false;
        targetPointerX = 0;
        targetPointerY = 0;
        targetBankDeg = 0;
        ensureGliderLerpRunning();
      };

      heroSection.addEventListener('pointerenter', onHeroPointerEnter, { passive: true });
      heroSection.addEventListener('pointermove', onHeroPointerMove, { passive: true });
      heroSection.addEventListener('pointerleave', onHeroPointerLeave, { passive: true });
      window.addEventListener('blur', onHeroPointerLeave, { passive: true });

      addCleanup(() => {
        if (gliderLerpRaf) cancelAnimationFrame(gliderLerpRaf);
        heroSection.removeEventListener('pointerenter', onHeroPointerEnter);
        heroSection.removeEventListener('pointermove', onHeroPointerMove);
        heroSection.removeEventListener('pointerleave', onHeroPointerLeave);
        window.removeEventListener('blur', onHeroPointerLeave);
      });
    }

    const hasGSAP =
      typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (!hasGSAP) {
      document.documentElement.classList.add('no-gsap');
      initNativeScrollFallback((surge, sc) => {
        scrollSurgeY = surge;
        scrollScale = sc;
        applyHeroGliderTransform();
      });
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // -----------------------------------------------------------------------
    // ACT I: Origami Glider Takeoff Surge (Soars Upward on Scroll!)
    // -----------------------------------------------------------------------
    if (heroSection && heroGliderRig && !prefersReducedMotion) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollSurgeY = -self.progress * 245;
          scrollScale = 1 + self.progress * 0.08;
          applyHeroGliderTransform();
        }
      });
    }

    // -----------------------------------------------------------------------
    // ACT II & III (V6): Continuous Aerodynamic Voyage (CargoKite Continuum)
    // Giant CAD Origami Glider sweeps Right -> Left & seamlessly tows 9 Gliders
    // -----------------------------------------------------------------------
    // Helper: Measure layout Y relative to container (ignores CSS transforms on words)
    const getWordLayoutTop = (el, rootEl) => {
      let top = 0;
      let cur = el;
      while (cur && cur !== rootEl && cur instanceof HTMLElement) {
        top += cur.offsetTop || 0;
        cur = cur.offsetParent;
      }
      return top;
    };

    // Helper: Group word spans into visual lines by layout Y
    const groupWordsByVisualLines = (wordEls, rootEl) => {
      const lines = [];
      let currentLine = [];
      let currentTop = null;
      wordEls.forEach((wEl) => {
        const top = getWordLayoutTop(wEl, rootEl);
        if (currentTop === null || Math.abs(top - currentTop) <= 16) {
          currentLine.push(wEl);
          if (currentTop === null) currentTop = top;
        } else {
          if (currentLine.length) lines.push(currentLine);
          currentLine = [wEl];
          currentTop = top;
        }
      });
      if (currentLine.length) lines.push(currentLine);
      return lines;
    };

    // Helper: Fast word-by-word sweep per line (~36ms/word) + 0.8s (800ms) delay before next line
    const createLineSteppedController = (
      wordEls,
      rootEl,
      baseClass,
      wordStepMs = 36,
      lineDelayMs = 800
    ) => {
      const state = {
        wordEls,
        rootEl,
        baseClass,
        wordStepMs,
        lineDelayMs,
        lines: [],
        timers: [],
        isTriggered: false
      };

      const clearTimers = () => {
        state.timers.forEach((tid) => clearTimeout(tid));
        state.timers = [];
      };

      const rebuildLines = () => {
        state.lines = groupWordsByVisualLines(state.wordEls, state.rootEl);
      };

      const resetImmediate = () => {
        clearTimers();
        state.isTriggered = false;
        state.wordEls.forEach((wEl) => {
          wEl.className = `${baseClass} is-dim`;
        });
      };

      const playForward = () => {
        if (state.isTriggered) return;
        state.isTriggered = true;
        clearTimers();
        rebuildLines();

        state.wordEls.forEach((wEl) => {
          wEl.className = `${baseClass} is-dim`;
        });

        let lineStartMs = 0;
        const settleMs = 130;

        state.lines.forEach((lineWords) => {
          lineWords.forEach((wEl, wIdx) => {
            const triggerAt = lineStartMs + wIdx * state.wordStepMs;
            const tActive = setTimeout(() => {
              if (!state.isTriggered) return;
              wEl.className = `${baseClass} is-active-word`;
            }, triggerAt);
            const tLit = setTimeout(() => {
              if (!state.isTriggered) return;
              wEl.className = `${baseClass} is-lit`;
            }, triggerAt + settleMs);
            state.timers.push(tActive, tLit);
          });

          // Last word on this line finishes settling at:
          const lineFinishMs =
            lineStartMs + Math.max(0, lineWords.length - 1) * state.wordStepMs + settleMs;
          // Hold 0.8s (800ms) after the line finishes before starting the next line
          lineStartMs = lineFinishMs + state.lineDelayMs;
        });
      };

      const playReverse = () => {
        if (!state.isTriggered) return;
        state.isTriggered = false;
        clearTimers();
        rebuildLines();

        const reversedLines = state.lines.slice().reverse();
        let revStartMs = 0;
        reversedLines.forEach((lineWords) => {
          const revWords = lineWords.slice().reverse();
          revWords.forEach((wEl, wIdx) => {
            const tid = setTimeout(() => {
              if (state.isTriggered) return;
              wEl.className = `${baseClass} is-dim`;
            }, revStartMs + wIdx * 16);
            state.timers.push(tid);
          });
          revStartMs += revWords.length * 16 + 50;
        });
      };

      rebuildLines();
      return { state, rebuildLines, resetImmediate, playForward, playReverse };
    };

    // Helper: Assign CSS transition-delay per visual line (fast word sweep + 0.8s inter-line pause)
    const applyLineSteppedCssDelays = (
      rootEl,
      wordSelector,
      wordStepMs = 36,
      lineDelayMs = 800
    ) => {
      if (!rootEl) return;
      const wordEls = Array.from(rootEl.querySelectorAll(wordSelector));
      if (!wordEls.length) return;
      const lines = groupWordsByVisualLines(wordEls, rootEl);
      let lineStartMs = 0;
      const settleMs = 150;
      lines.forEach((lineWords) => {
        lineWords.forEach((wEl, wIdx) => {
          wEl.style.transitionDelay = `${lineStartMs + wIdx * wordStepMs}ms`;
        });
        lineStartMs += Math.max(0, lineWords.length - 1) * wordStepMs + settleMs + lineDelayMs;
      });
    };

    const resetLineSteppedCssDelays = (rootEl, wordSelector) => {
      if (!rootEl) return;
      rootEl.querySelectorAll(wordSelector).forEach((wEl) => {
        wEl.style.transitionDelay = '0ms';
      });
    };

    const flightSection = document.getElementById('chuyen-dich');
    const flightPin = document.getElementById('paradigmPin');
    const horizGlider = document.getElementById('horizShip');
    const beforeLayer = document.getElementById('textBeforeLayer');
    const afterLayer = document.getElementById('textAfterLayer');
    const swarmConvoy = document.getElementById('swarmConvoy');
    const swarmUnits = gsap.utils.toArray('.swarm-unit');

    if (flightSection && flightPin && horizGlider && swarmConvoy && swarmUnits.length) {
      // Dynamically wrap words inside #swarmConvoy .swarm-headline for kinetic word animation
      const swarmHeadline = swarmConvoy ? swarmConvoy.querySelector('.swarm-headline') : null;
      if (swarmHeadline && !swarmHeadline.dataset.wordsWrapped) {
        swarmHeadline.dataset.wordsWrapped = '1';
        const wrapNodeWords = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue || '';
            if (!text.trim()) return;
            const frag = document.createDocumentFragment();
            const parts = text.split(/(\s+)/);
            parts.forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(' '));
              } else {
                const span = document.createElement('span');
                span.className = 'swarm-word is-dim';
                span.textContent = part;
                frag.appendChild(span);
              }
            });
            node.parentNode.replaceChild(frag, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(wrapNodeWords);
          }
        };
        wrapNodeWords(swarmHeadline);
      }

      const cdWords = afterLayer ? Array.from(afterLayer.querySelectorAll('.cd-word')) : [];
      const swarmWords = swarmHeadline ? Array.from(swarmHeadline.querySelectorAll('.swarm-word')) : [];

      const cdWordCtrl = createLineSteppedController(cdWords, afterLayer, 'cd-word', 36, 800);
      const swarmWordCtrl = createLineSteppedController(
        swarmWords,
        swarmHeadline,
        'swarm-word',
        36,
        800
      );
      cdWordCtrl.resetImmediate();
      swarmWordCtrl.resetImmediate();

      window.addEventListener(
        'resize',
        () => {
          cdWordCtrl.rebuildLines();
          swarmWordCtrl.rebuildLines();
        },
        { passive: true }
      );

      const syncWipeMask = (p) => {
        const vw = window.innerWidth || 1;
        const shipW = horizGlider.offsetWidth || Math.min(1740, Math.max(980, vw * 1.18));

        if (p <= 0.001) {
          if (beforeLayer) beforeLayer.style.clipPath = 'inset(0 0% 0 0)';
          if (afterLayer) afterLayer.style.clipPath = 'inset(0 0 0 100%)';
        } else if (p >= 0.30) {
          if (beforeLayer) beforeLayer.style.clipPath = 'inset(0 100% 0 0)';
          if (afterLayer) afterLayer.style.clipPath = 'inset(0 0 0 0%)';
        } else {
          // Pure mathematical wing tracking synced 1:1 with horizGlider's tween (0.00 -> 0.30)
          const pPlane = Math.max(0, Math.min(1, p / 0.30));
          const startX = vw * 0.96;
          const endX = -(shipW + vw * 0.16);
          const curX = startX + (endX - startX) * pPlane;

          // Leading fuselage erases old text; wide trailing wings reveal new text.
          const eraseX = curX + shipW * 0.36;
          const revealX = curX + shipW * 0.72;

          const keepLeftPct = Math.max(0, Math.min(100, (eraseX / vw) * 100));
          const eraseRightPct = 100 - keepLeftPct;
          const revealLeftPct = Math.max(0, Math.min(100, (revealX / vw) * 100));

          if (beforeLayer) {
            beforeLayer.style.clipPath = `inset(0 ${eraseRightPct.toFixed(2)}% 0 0)`;
          }
          if (afterLayer) {
            afterLayer.style.clipPath = `inset(0 0 0 ${revealLeftPct.toFixed(2)}%)`;
          }
        }

        // Line-Stepped Fast Word Highlight + 0.8s Inter-Line Delay on #textAfterLayer
        if (cdWords.length) {
          if (p >= 0.15) {
            cdWordCtrl.playForward();
          } else if (p < 0.10) {
            cdWordCtrl.playReverse();
          }
        }

        // Line-Stepped Fast Word Reveal + 0.8s Inter-Line Delay on #swarmConvoy .swarm-headline
        if (swarmWords.length) {
          if (p >= 0.56) {
            swarmWordCtrl.playForward();
          } else if (p < 0.50) {
            swarmWordCtrl.playReverse();
          }
        }

        if (!prefersReducedMotion) {
          const floatY = Math.sin(p * Math.PI * 4) * 5;
          horizGlider.style.marginTop = `${floatY.toFixed(1)}px`;
        }
      };

      const getInitialConvoyX = () => window.innerWidth * 1.02;
      const getReadStartConvoyX = () =>
        Math.max(18, Math.round((window.innerWidth - (swarmConvoy ? swarmConvoy.offsetWidth : 1200)) * 0.54));
      const getSlotSpacingY = () => {
        const sample = swarmUnits[0];
        const unitH = sample ? sample.offsetHeight : 68;
        const gap = Math.min(16, Math.max(8, window.innerHeight * 0.014));
        return unitH + gap;
      };

      syncWipeMask(0);

      // Master continuous timeline (normalized 0.00 -> 1.00):
      const tlFlight = gsap.timeline({
        onUpdate: () => {
          syncWipeMask(tlFlight.progress());
        },
        scrollTrigger: {
          trigger: flightSection,
          pin: flightPin,
          start: 'top top',
          end: '+=285%',
          scrub: 0.18,
          invalidateOnRefresh: true
        }
      });

      // Phase 1: Giant Glider sweeps across briskly (0.00 to 0.30)
      tlFlight.fromTo(
        horizGlider,
        { x: () => window.innerWidth * 0.96 },
        {
          x: () => -(horizGlider.offsetWidth + window.innerWidth * 0.16),
          duration: 0.30,
          ease: 'none',
          immediateRender: true
        },
        0
      );

      // Phase 2: Revealed Paradigm text highlights line-by-line (0.15 -> 0.48) and transitions out (0.50 -> 0.58)
      if (afterLayer) {
        tlFlight.fromTo(
          afterLayer,
          { opacity: 1, x: 0 },
          {
            opacity: 0,
            x: () => -window.innerWidth * 0.06,
            duration: 0.08,
            ease: 'power2.inOut',
            immediateRender: false
          },
          0.50
        );
      }

      // Phase 3A: 9 Origami Gliders enter from right edge to centered reading stage (0.50 to 0.58)
      tlFlight.fromTo(
        swarmConvoy,
        { x: getInitialConvoyX },
        {
          x: getReadStartConvoyX,
          duration: 0.08,
          ease: 'power2.out',
          immediateRender: true
        },
        0.50
      );

      // Phase 3B: Gentle drift while lines animate fast word-by-word + 0.8s inter-line delay (0.58 to 0.98)
      tlFlight.to(
        swarmConvoy,
        {
          x: () => {
            const totalW = swarmConvoy ? swarmConvoy.offsetWidth : 1200;
            if (totalW <= window.innerWidth * 0.94) {
              return Math.max(12, Math.round((window.innerWidth - totalW) * 0.36));
            }
            return -(totalW - window.innerWidth * 0.92);
          },
          duration: 0.40,
          ease: 'none'
        },
        0.58
      );

      // Escort Deployment: 1 lead glider unfolds into 9 delta-formation gliders (0.50 to 0.60)
      tlFlight.fromTo(
        swarmUnits,
        {
          y: (i, el) => -Number(el.getAttribute('data-slot') || 0) * getSlotSpacingY(),
          rotation: (i, el) => Number(el.getAttribute('data-slot') || 0) * -6,
          scale: (i, el) => (Number(el.getAttribute('data-slot') || 0) === 0 ? 1 : 0.75),
          opacity: (i) => (i === 0 ? 1 : 0.2)
        },
        {
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 0.10,
          stagger: 0.008,
          ease: 'power2.out',
          immediateRender: true
        },
        0.50
      );
    }

    // -----------------------------------------------------------------------
    // ACT IV: Vertical Top-to-Bottom Origami Glider Dive & Live Pillar FX
    // -----------------------------------------------------------------------
    const voyageArena = document.getElementById('voyageArena');
    const verticalCraft = document.getElementById('verticalCraft');
    const voyageWake = document.getElementById('voyageWake');
    const voyageItems = gsap.utils.toArray('.v-item');

    // Animate #cong-nghe section header words on scroll down & reverse on scroll up
    const voyageHead = document.querySelector('#cong-nghe .editorial-head');
    if (voyageHead) {
      const h2 = voyageHead.querySelector('h2');
      if (h2 && !h2.dataset.wordsWrapped) {
        h2.dataset.wordsWrapped = '1';
        const rawText = h2.textContent.trim();
        const words = rawText.split(/\s+/);
        h2.innerHTML = words
          .map((w) => `<span class="voyage-head-word">${w}</span>`)
          .join(' ');
        applyLineSteppedCssDelays(h2, '.voyage-head-word', 36, 800);
      }
      ScrollTrigger.create({
        trigger: voyageHead,
        start: 'top 84%',
        end: 'bottom 15%',
        onEnter: () => {
          if (h2) applyLineSteppedCssDelays(h2, '.voyage-head-word', 36, 800);
          voyageHead.classList.add('is-head-unlocked');
        },
        onEnterBack: () => {
          if (h2) applyLineSteppedCssDelays(h2, '.voyage-head-word', 36, 800);
          voyageHead.classList.add('is-head-unlocked');
        },
        onLeaveBack: () => {
          if (h2) resetLineSteppedCssDelays(h2, '.voyage-head-word');
          voyageHead.classList.remove('is-head-unlocked');
        }
      });
    }

    // Helper: Forward Typewriter effect
    const runTypewriter = (el, fullText, durationMs = 750, delayMs = 0) => {
      if (!el || !fullText) return;
      if (el._twTimer) clearInterval(el._twTimer);
      if (el._twDelay) clearTimeout(el._twDelay);
      el.textContent = '';
      el.classList.add('is-typing');
      const totalChars = fullText.length;
      const stepMs = Math.max(14, Math.floor(durationMs / Math.max(1, totalChars)));
      el._twDelay = setTimeout(() => {
        let idx = 0;
        el._twTimer = setInterval(() => {
          idx += 1;
          el.textContent = fullText.slice(0, idx);
          if (idx >= totalChars) {
            clearInterval(el._twTimer);
            el._twTimer = null;
            el.classList.remove('is-typing');
          }
        }, stepMs);
      }, delayMs);
    };

    // Helper: Reverse Typewriter (backspace) when scrolling up
    const runReverseTypewriter = (el, durationMs = 280) => {
      if (!el) return;
      if (el._twTimer) clearInterval(el._twTimer);
      if (el._twDelay) clearTimeout(el._twDelay);
      const curText = el.textContent || '';
      if (!curText.length) {
        el.classList.remove('is-typing');
        return;
      }
      el.classList.add('is-typing');
      const stepMs = Math.max(10, Math.floor(durationMs / Math.max(1, curText.length)));
      let idx = curText.length;
      el._twTimer = setInterval(() => {
        idx = Math.max(0, idx - 2);
        el.textContent = curText.slice(0, idx);
        if (idx <= 0) {
          clearInterval(el._twTimer);
          el._twTimer = null;
          el.classList.remove('is-typing');
        }
      }, stepMs);
    };

    // Preserve original fullText on all pillar titles/snippets before hiding
    voyageItems.forEach((item) => {
      const h3 = item.querySelector('.v-card__body h3');
      if (h3 && !h3.dataset.fullText) h3.dataset.fullText = h3.textContent.trim();
      item.querySelectorAll('.v-snippet code').forEach((c) => {
        if (!c.dataset.fullText) c.dataset.fullText = c.textContent.trim();
      });
      item.querySelectorAll('.v-aistep p').forEach((pEl) => {
        if (!pEl.dataset.fullText) pEl.dataset.fullText = pEl.textContent.trim();
      });
    });

    // Forward animation when scrolling DOWN and reaching a pillar (chỉ chạy đúng 1 lần mỗi lượt mở khóa)
    const animateVoyagePillar = (item, idx) => {
      if (!item || prefersReducedMotion) return;
      if (item._isPillarUnlocked) return;
      item._isPillarUnlocked = true;

      if (item._revTimers) {
        item._revTimers.forEach((t) => clearTimeout(t));
        item._revTimers = [];
      }
      item._fwdTimers = item._fwdTimers || [];
      item._fwdTimers.forEach((t) => clearTimeout(t));
      item._fwdTimers = [];

      item.classList.remove('is-reversing');
      item.classList.add('is-unlocked', 'is-live-animating');

      // Typewriter on card h3 title
      const h3 = item.querySelector('.v-card__body h3');
      if (h3) {
        if (!h3.dataset.fullText) h3.dataset.fullText = h3.textContent.trim();
        runTypewriter(h3, h3.dataset.fullText, 640, 40);
      }

      // Sequential pop-in on .v-gtag pills
      const tags = item.querySelectorAll('.v-gtag');
      tags.forEach((tag, tIdx) => {
        tag.style.transition = 'none';
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px) scale(0.92)';
        const tid = setTimeout(() => {
          tag.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
          tag.style.opacity = '1';
          tag.style.transform = 'translateY(0) scale(1)';
        }, 220 + tIdx * 140);
        item._fwdTimers.push(tid);
      });

      if (idx === 0) {
        // Pillar 01: Progress bars (.v-mbar) animate from 0% -> target% (40%, 30%, 20%, 10%)
        const mbars = item.querySelectorAll('.v-mbar');
        const targets = [
          { pct: 40, scale: 0.88 },
          { pct: 30, scale: 0.68 },
          { pct: 20, scale: 0.48 },
          { pct: 10, scale: 0.28 }
        ];
        mbars.forEach((mbar, bIdx) => {
          const fill = mbar.querySelector('.v-mbar__track i');
          const numEl = mbar.querySelector('.v-mbar__label strong');
          const cfg = targets[bIdx] || { pct: 25, scale: 0.5 };
          if (fill) {
            fill.style.transition = 'none';
            fill.style.transform = 'scaleX(0)';
          }
          if (numEl) numEl.textContent = '0%';

          const tid = setTimeout(() => {
            const startT = performance.now();
            const dur = 1050;
            if (fill) {
              fill.style.transition = `transform ${dur}ms cubic-bezier(0.22, 1, 0.36, 1)`;
              fill.style.transform = `scaleX(${cfg.scale})`;
            }
            const tickPct = (tNow) => {
              if (!item._isPillarUnlocked) return;
              const p = Math.min(1, (tNow - startT) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              if (numEl) numEl.textContent = `${Math.round(cfg.pct * eased)}%`;
              if (p < 1) requestAnimationFrame(tickPct);
            };
            requestAnimationFrame(tickPct);
          }, 90 + bIdx * 120);
          item._fwdTimers.push(tid);
        });
      } else if (idx === 1) {
        // Pillar 02: Typewriter on Math & Python code snippets + pop-in format pills
        const codes = item.querySelectorAll('.v-snippet code');
        codes.forEach((codeEl, cIdx) => {
          if (!codeEl.dataset.fullText) codeEl.dataset.fullText = codeEl.textContent.trim();
          runTypewriter(codeEl, codeEl.dataset.fullText, 820, 60 + cIdx * 180);
        });
        const fpills = item.querySelectorAll('.v-fpill');
        fpills.forEach((fp, fIdx) => {
          fp.style.transition = 'none';
          fp.style.opacity = '0';
          fp.style.transform = 'translateY(8px) scale(0.92)';
          const tid = setTimeout(() => {
            fp.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
            fp.style.opacity = '1';
            fp.style.transform = 'translateY(0) scale(1)';
          }, 260 + fIdx * 160);
          item._fwdTimers.push(tid);
        });
      } else if (idx === 2) {
        // Pillar 03: Sequential Casio keypresses + Typewriter on AI solution steps
        const kbds = item.querySelectorAll('.v-casio-row kbd');
        kbds.forEach((kbd, kIdx) => {
          kbd.classList.remove('is-key-pressed');
          const tid = setTimeout(() => {
            kbd.classList.add('is-key-pressed');
            setTimeout(() => kbd.classList.remove('is-key-pressed'), 340);
          }, 100 + kIdx * 190);
          item._fwdTimers.push(tid);
        });
        const steps = item.querySelectorAll('.v-aistep p');
        steps.forEach((pEl, sIdx) => {
          if (!pEl.dataset.fullText) pEl.dataset.fullText = pEl.textContent.trim();
          runTypewriter(pEl, pEl.dataset.fullText, 780, 180 + sIdx * 320);
        });
      } else if (idx === 3) {
        // Pillar 04: Podium bars grow from scaleY(0) -> scaleY(1) & Gem count-up
        const gemPill = item.querySelector('.v-gem-pill');
        if (gemPill) {
          const startG = performance.now();
          const tickGem = (tNow) => {
            if (!item._isPillarUnlocked) return;
            const p = Math.min(1, (tNow - startG) / 980);
            gemPill.textContent = `◆ +${Math.round(15 * p)} Ngọc`;
            if (p < 1) requestAnimationFrame(tickGem);
          };
          requestAnimationFrame(tickGem);
        }
        const bars = item.querySelectorAll('.v-podium__bar');
        bars.forEach((bar, bIdx) => {
          bar.style.transition = 'none';
          bar.style.transform = 'scaleY(0)';
          const tid = setTimeout(() => {
            bar.style.transition = 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)';
            bar.style.transform = 'scaleY(1)';
          }, 100 + bIdx * 130);
          item._fwdTimers.push(tid);
        });
      }
    };

    // Reverse animation when scrolling UP above a pillar ("lướt lên thì animation ngược cho mất nội dung")
    const reverseVoyagePillar = (item, idx) => {
      if (!item || !item._isPillarUnlocked) return;
      item._isPillarUnlocked = false;

      if (item._fwdTimers) {
        item._fwdTimers.forEach((t) => clearTimeout(t));
        item._fwdTimers = [];
      }
      item._revTimers = item._revTimers || [];
      item._revTimers.forEach((t) => clearTimeout(t));
      item._revTimers = [];

      const card = item.querySelector('.v-card');
      if (card) {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      }

      // Reverse typewriter on h3 and internal snippets
      const h3 = item.querySelector('.v-card__body h3');
      if (h3) runReverseTypewriter(h3, 240);

      // Reverse pop-out on .v-gtag pills (from last to first)
      const tags = Array.from(item.querySelectorAll('.v-gtag')).reverse();
      tags.forEach((tag, tIdx) => {
        const tid = setTimeout(() => {
          tag.style.transition = 'opacity 0.24s ease, transform 0.24s ease';
          tag.style.opacity = '0';
          tag.style.transform = 'translateY(10px) scale(0.92)';
        }, tIdx * 45);
        item._revTimers.push(tid);
      });

      if (idx === 0) {
        item.querySelectorAll('.v-mbar').forEach((mbar) => {
          const fill = mbar.querySelector('.v-mbar__track i');
          const numEl = mbar.querySelector('.v-mbar__label strong');
          if (fill) {
            fill.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
            fill.style.transform = 'scaleX(0)';
          }
          if (numEl) numEl.textContent = '0%';
        });
      } else if (idx === 1) {
        item.querySelectorAll('.v-snippet code').forEach((c) => runReverseTypewriter(c, 220));
        item.querySelectorAll('.v-fpill').forEach((fp) => {
          fp.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          fp.style.opacity = '0';
          fp.style.transform = 'translateY(8px) scale(0.92)';
        });
      } else if (idx === 2) {
        item.querySelectorAll('.v-aistep p').forEach((pEl) => runReverseTypewriter(pEl, 220));
      } else if (idx === 3) {
        item.querySelectorAll('.v-podium__bar').forEach((bar) => {
          bar.style.transition = 'transform 0.32s ease';
          bar.style.transform = 'scaleY(0)';
        });
        const gemPill = item.querySelector('.v-gem-pill');
        if (gemPill) gemPill.textContent = '◆ +0 Ngọc';
      }

      item.classList.add('is-reversing');
      item.classList.remove('is-unlocked', 'is-live-animating');
    };

    window.__triggerVoyagePillar = animateVoyagePillar;
    window.__reverseVoyagePillar = reverseVoyagePillar;

    if (voyageArena && verticalCraft) {
      let arenaH = 800;
      let craftH = 200;
      let maxTravel = 600;

      const updateVoyageMetrics = () => {
        if (!voyageArena || !verticalCraft) return;
        arenaH = voyageArena.offsetHeight || 800;
        craftH = verticalCraft.offsetHeight || 200;
        maxTravel = Math.max(0, arenaH - craftH);
      };
      updateVoyageMetrics();
      window.addEventListener('resize', updateVoyageMetrics, { passive: true });
      addCleanup(() => window.removeEventListener('resize', updateVoyageMetrics));

      verticalCraft.style.top = '0px';

      ScrollTrigger.create({
        trigger: voyageArena,
        start: 'top 56%',
        end: 'bottom 46%',
        scrub: 0.18,
        onUpdate: (self) => {
          const p = self.progress;
          const currentY = p * maxTravel;
          const bankAngle = prefersReducedMotion ? 0 : Math.sin(p * Math.PI * 5) * 3.4;

          verticalCraft.style.transform = `translate3d(-50%, ${currentY.toFixed(1)}px, 0) rotate(${bankAngle.toFixed(2)}deg)`;

          const wakeTipY = currentY + craftH * 0.55;
          if (voyageWake) {
            voyageWake.style.height = `${Math.min(arenaH, wakeTipY).toFixed(1)}px`;
          }

          voyageItems.forEach((item, idx) => {
            const waypointY = item.offsetTop + 46;
            const wasUnlocked = Boolean(item._isPillarUnlocked);
            // Hysteresis 18px để tránh nhấp nháy kích hoạt 2 lần tại biên
            const nowUnlocked = wasUnlocked
              ? p > 0.005 && wakeTipY >= waypointY - 18
              : p > 0.01 && wakeTipY >= waypointY;
            if (nowUnlocked !== wasUnlocked) {
              if (nowUnlocked) {
                animateVoyagePillar(item, idx);
              } else {
                reverseVoyagePillar(item, idx);
              }
            }
          });
        }
      });
    }

    // -----------------------------------------------------------------------
    // ACT V: Night Observatory Parallax + 3 Circular Dials Reversible Animation
    // -----------------------------------------------------------------------
    const impactSection = document.getElementById('tac-dong');
    const impactImg = document.getElementById('impactParallaxImg');
    const isoGliderRig = document.getElementById('isoGliderRig');
    const isoWingmanHigh = document.getElementById('isoWingmanHigh');
    const isoWingmanLow = document.getElementById('isoWingmanLow');

    if (impactSection) {
      const impactH2 = impactSection.querySelector('.impact-head h2');
      if (impactH2 && !impactH2.dataset.wordsWrapped) {
        impactH2.dataset.wordsWrapped = '1';
        const words = impactH2.textContent.trim().split(/\s+/);
        impactH2.innerHTML = words
          .map((w) => `<span class="impact-head-word">${w}</span>`)
          .join(' ');
        applyLineSteppedCssDelays(impactH2, '.impact-head-word', 36, 800);
      }

      const impactDials = Array.from(impactSection.querySelectorAll('.impact-dial'));
      const arcTargets = [520, 580, 490];
      impactDials.forEach((dial, dIdx) => {
        dial.style.transitionDelay = `${dIdx * 130}ms`;
        const titleEl = dial.querySelector('.impact-dial__title');
        if (titleEl && !titleEl.dataset.fullText) {
          titleEl.dataset.fullText = titleEl.textContent.trim();
        }
      });

      const animateImpactSection = () => {
        if (impactSection._isImpactUnlocked) return;
        impactSection._isImpactUnlocked = true;
        if (impactH2) applyLineSteppedCssDelays(impactH2, '.impact-head-word', 36, 800);
        impactSection.classList.add('is-impact-unlocked');

        impactDials.forEach((dial, dIdx) => {
          const arc = dial.querySelector('.dial-progress');
          const countEl = dial.querySelector('.count-up[data-target]');
          const titleEl = dial.querySelector('.impact-dial__title');
          const tagEl = dial.querySelector('.impact-dial__tag');
          const targetNum = countEl ? Number(countEl.getAttribute('data-target') || 0) : 0;
          const targetArc = arcTargets[dIdx] || 520;

          if (arc) {
            arc.style.transition = 'none';
            arc.style.strokeDasharray = '0 700';
          }
          if (countEl) countEl.textContent = '0';
          if (tagEl) {
            tagEl.style.opacity = '0';
            tagEl.style.transform = 'translateY(10px) scale(0.9)';
          }

          setTimeout(() => {
            if (!impactSection._isImpactUnlocked) return;
            const dur = 1100;
            const startT = performance.now();
            if (arc) {
              arc.style.transition = `stroke-dasharray ${dur}ms cubic-bezier(0.22, 1, 0.36, 1)`;
              arc.style.strokeDasharray = `${targetArc} 700`;
            }
            if (titleEl && titleEl.dataset.fullText) {
              runTypewriter(titleEl, titleEl.dataset.fullText, 580, 40);
            }
            if (tagEl) {
              setTimeout(() => {
                if (!impactSection._isImpactUnlocked) return;
                tagEl.style.opacity = '1';
                tagEl.style.transform = 'translateY(0) scale(1)';
              }, 320);
            }
            if (countEl) {
              const tickVal = (tNow) => {
                if (!impactSection._isImpactUnlocked) return;
                const p = Math.min(1, (tNow - startT) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                countEl.textContent = String(Math.round(targetNum * eased));
                if (p < 1) requestAnimationFrame(tickVal);
              };
              requestAnimationFrame(tickVal);
            }
          }, 120 + dIdx * 150);
        });
      };

      const reverseImpactSection = () => {
        if (!impactSection._isImpactUnlocked) return;
        impactSection._isImpactUnlocked = false;
        if (impactH2) resetLineSteppedCssDelays(impactH2, '.impact-head-word');
        impactSection.classList.remove('is-impact-unlocked');

        impactDials.forEach((dial) => {
          const arc = dial.querySelector('.dial-progress');
          const countEl = dial.querySelector('.count-up[data-target]');
          const titleEl = dial.querySelector('.impact-dial__title');
          const tagEl = dial.querySelector('.impact-dial__tag');
          if (arc) {
            arc.style.transition = 'stroke-dasharray 0.35s ease';
            arc.style.strokeDasharray = '0 700';
          }
          if (countEl) countEl.textContent = '0';
          if (titleEl) runReverseTypewriter(titleEl, 200);
          if (tagEl) {
            tagEl.style.opacity = '0';
            tagEl.style.transform = 'translateY(10px) scale(0.9)';
          }
        });
      };

      window.__triggerImpactSection = animateImpactSection;
      window.__reverseImpactSection = reverseImpactSection;

      ScrollTrigger.create({
        trigger: impactSection,
        start: 'top 68%',
        end: 'bottom 20%',
        onEnter: animateImpactSection,
        onEnterBack: animateImpactSection,
        onLeaveBack: reverseImpactSection
      });
    }

    if (impactSection && impactImg && !prefersReducedMotion) {
      gsap.fromTo(
        impactImg,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: impactSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    if (impactSection && isoGliderRig && !prefersReducedMotion) {
      gsap.fromTo(
        isoGliderRig,
        {
          xPercent: 42,
          yPercent: 18,
          scale: 0.92
        },
        {
          xPercent: -38,
          yPercent: 38,
          scale: 1.02,
          ease: 'none',
          scrollTrigger: {
            trigger: impactSection,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 0.5
          }
        }
      );
    }

    if (impactSection && isoWingmanHigh && !prefersReducedMotion) {
      gsap.fromTo(
        isoWingmanHigh,
        {
          x: 220,
          y: 110
        },
        {
          x: -140,
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: impactSection,
            start: 'top 92%',
            end: 'bottom 8%',
            scrub: 0.48
          }
        }
      );
    }

    if (impactSection && isoWingmanLow && !prefersReducedMotion) {
      gsap.fromTo(
        isoWingmanLow,
        {
          x: 140,
          y: 90
        },
        {
          x: -80,
          y: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: impactSection,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 0.72
          }
        }
      );
    }
  }

  function initNativeScrollFallback(onHeroSurge) {
    const heroSection = document.getElementById('hero');
    const wipeSection = document.getElementById('chuyen-dich');
    const horizGlider = document.getElementById('horizShip');
    const beforeLayer = document.getElementById('textBeforeLayer');
    const afterLayer = document.getElementById('textAfterLayer');
    const swarmSection = document.getElementById('doi-hinh');
    const swarmConvoy = document.getElementById('swarmConvoy');
    const voyageArena = document.getElementById('voyageArena');
    const verticalCraft = document.getElementById('verticalCraft');
    const voyageWake = document.getElementById('voyageWake');
    const voyageItems = Array.from(document.querySelectorAll('.v-item'));
    const impactSection = document.getElementById('tac-dong');
    const isoGliderRig = document.getElementById('isoGliderRig');
    const isoWingmanHigh = document.getElementById('isoWingmanHigh');
    const isoWingmanLow = document.getElementById('isoWingmanLow');

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;

      if (heroSection && onHeroSurge) {
        const r = heroSection.getBoundingClientRect();
        const p = clamp01(-r.top / Math.max(1, r.height));
        onHeroSurge(-p * 235, 1 + p * 0.08);
      }

      if (wipeSection && horizGlider) {
        const r = wipeSection.getBoundingClientRect();
        const scrollable = Math.max(1, r.height - vh);
        const p = clamp01(-r.top / scrollable);

        // Continuous Phase 1: Big Glider Sweep (p: 0 to 0.38)
        const pBig = clamp01(p / 0.38);
        const shipW = horizGlider.offsetWidth || Math.min(1740, Math.max(980, vw * 1.18));
        const startX = vw * 0.96;
        const endX = -(shipW + vw * 0.16);
        const curX = startX + (endX - startX) * pBig;
        horizGlider.style.transform = `translate3d(${curX.toFixed(1)}px, 0, 0)`;

        const eraseX = curX + shipW * 0.36;
        const revealX = curX + shipW * 0.72;
        const eraseRightPct = 100 - clamp01(eraseX / vw) * 100;
        const revealLeftPct = clamp01(revealX / vw) * 100;

        if (beforeLayer) {
          beforeLayer.style.clipPath = `inset(0 ${eraseRightPct.toFixed(2)}% 0 0)`;
        }
        if (afterLayer) {
          afterLayer.style.clipPath = `inset(0 0 0 ${revealLeftPct.toFixed(2)}%)`;
          if (p > 0.64) {
            const pFade = clamp01((p - 0.64) / 0.14);
            afterLayer.style.opacity = `${(1 - pFade).toFixed(2)}`;
            afterLayer.style.transform = `translate3d(${(-pFade * 60).toFixed(1)}px, 0, 0)`;
          } else {
            afterLayer.style.opacity = '1';
            afterLayer.style.transform = 'translate3d(0, 0, 0)';
          }
        }

        // Continuous Phase 2: Trailing 9-Glider Convoy (p: 0.56 to 1.00)
        if (swarmConvoy) {
          const pSwarm = clamp01((p - 0.56) / 0.44);
          const startSwarmX = vw * 1.05;
          const endSwarmX = -Math.max(vw * 0.38, swarmConvoy.scrollWidth - vw * 0.86);
          const curSwarmX = startSwarmX + (endSwarmX - startSwarmX) * pSwarm;
          swarmConvoy.style.transform = `translate3d(${curSwarmX.toFixed(1)}px, 0, 0)`;
        }
      }

      if (voyageArena && verticalCraft) {
        const r = voyageArena.getBoundingClientRect();
        const p = clamp01((vh * 0.62 - r.top) / Math.max(1, r.height));
        const maxY = Math.max(0, voyageArena.offsetHeight - verticalCraft.offsetHeight);
        const curY = p * maxY;
        verticalCraft.style.top = `${curY.toFixed(1)}px`;
        if (voyageWake) voyageWake.style.height = `${(curY + 90).toFixed(1)}px`;

        const noseY = verticalCraft.getBoundingClientRect().top + 120;
        voyageItems.forEach((item) => {
          item.classList.toggle('is-unlocked', noseY >= item.getBoundingClientRect().top + 40);
        });
      }

      if (impactSection && isoGliderRig) {
        const r = impactSection.getBoundingClientRect();
        const p = clamp01((vh * 0.85 - r.top) / Math.max(1, r.height + vh * 0.7));
        const xp = 46 + (-42 - 46) * p;
        const yp = -26 + (26 - (-26)) * p;
        const sc = 0.94 + (1.06 - 0.94) * p;
        isoGliderRig.style.transform = `translate(${xp.toFixed(1)}%, ${yp.toFixed(1)}%) scale(${sc.toFixed(3)})`;

        if (isoWingmanHigh) {
          const hx = vw * 0.45 + (-vw * 0.5 - vw * 0.45) * p;
          const hy = 150 + (-130 - 150) * p;
          isoWingmanHigh.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
        }
        if (isoWingmanLow) {
          const lx = vw * 0.26 + (-vw * 0.32 - vw * 0.26) * p;
          const ly = 100 + (-80 - 100) * p;
          isoWingmanLow.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // =========================================================================
  // 5. REVEALS, COUNT-UP METRICS, K-12 TABS, SIMULATOR & MAGNETICS
  // =========================================================================
  function initRevealsAndCounters() {
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      const revealObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14 }
      );
      reveals.forEach((el) => revealObs.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('is-visible'));
    }

    const counters = document.querySelectorAll('.count-up[data-target]:not(#tac-dong .count-up)');
    if ('IntersectionObserver' in window && counters.length) {
      const countObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            obs.unobserve(el);

            const target = Number(el.getAttribute('data-target') || 0);
            if (prefersReducedMotion) {
              el.textContent = String(target);
              return;
            }

            const dur = 1200;
            const t0 = performance.now();
            const tick = (now) => {
              const p = Math.min(1, (now - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = String(Math.round(eased * target));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.35 }
      );
      counters.forEach((c) => countObs.observe(c));
    }
  }

  function initGradeCatalogTabs() {
    const tabs = document.querySelectorAll('.grade-tab[data-grade]');
    const grid = document.getElementById('catalogCardsGrid');
    const exTitle1 = document.getElementById('exTitle1');
    const exMeta1 = document.getElementById('exMeta1');
    const exTitle2 = document.getElementById('exTitle2');
    const exMeta2 = document.getElementById('exMeta2');
    const exTitle3 = document.getElementById('exTitle3');
    const exMeta3 = document.getElementById('exMeta3');

    if (!tabs.length) return;

    const catalogData = {
      lop12: [
        {
          title: 'Toán 12: Khảo sát hàm số',
          meta: '30 câu • 45 phút • Nắm chắc nền tảng'
        },
        {
          title: 'Tin học 12: Thuật toán & CSDL',
          meta: '40 câu • 50 phút • Thực chiến Python & SQL'
        },
        {
          title: 'Toán & Tin 12: Vận dụng cao',
          meta: '45 câu • 90 phút • Phân loại ĐGNL & HSG'
        }
      ],
      lop11: [
        {
          title: 'Toán 11: Lượng giác & Dãy số',
          meta: '30 câu • 45 phút • Trọng tâm học kỳ'
        },
        {
          title: 'Tin học 11: Mảng & CSDL quan hệ',
          meta: '36 câu • 50 phút • Cú pháp & Thiết kế bảng'
        },
        {
          title: 'Toán 11: Đạo hàm & Không gian',
          meta: '40 câu • 75 phút • Tư duy & Casio nhanh'
        }
      ],
      lop10: [
        {
          title: 'Toán 10: Mệnh đề & Hàm số',
          meta: '30 câu • 45 phút • Nền tảng lớp 10'
        },
        {
          title: 'Tin học 10: Lập trình Python',
          meta: '35 câu • 45 phút • Đọc luồng mã lệnh'
        },
        {
          title: 'Toán & Tin 10: Oxy & Thuật toán',
          meta: '40 câu • 60 phút • Bồi dưỡng HSG'
        }
      ]
    };

    let animTimer = null;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-grade');
        const list = catalogData[key];
        if (!list || tab.classList.contains('is-active')) return;

        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));

        if (grid && !prefersReducedMotion) {
          grid.classList.remove('is-switching');
          void grid.offsetWidth;
          grid.classList.add('is-switching');
          clearTimeout(animTimer);
          animTimer = setTimeout(() => grid.classList.remove('is-switching'), 580);
        }

        if (exTitle1) exTitle1.textContent = list[0].title;
        if (exMeta1) exMeta1.textContent = list[0].meta;

        if (exTitle2) exTitle2.textContent = list[1].title;
        if (exMeta2) exMeta2.textContent = list[1].meta;

        if (exTitle3) exTitle3.textContent = list[2].title;
        if (exMeta3) exMeta3.textContent = list[2].meta;
      });
    });
  }

  function initChampionshipPodium() {
    const tabs = document.querySelectorAll('#champTabs .champ-tab[data-board]');
    const podium = document.getElementById('champPodium');
    if (!tabs.length || !podium) return;

    const BOARDS = {
      all: [
        {
          avatar: 'MK',
          name: 'Nguyễn Minh Khôi',
          school: '12A1 • THPT Chuyên KHTN',
          streak: '14 đề',
          score: '9.85 / 10đ',
          scale: 0.985,
          gems: '+240 Ngọc'
        },
        {
          avatar: 'KL',
          name: 'Trần Khánh Linh',
          school: '12T1 • THPT Lê Quý Đôn',
          streak: '12 đề',
          score: '9.60 / 10đ',
          scale: 0.96,
          gems: '+195 Ngọc'
        },
        {
          avatar: 'HN',
          name: 'Lê Hoàng Nam',
          school: '11Tin • THPT Phan Châu Trinh',
          streak: '11 đề',
          score: '9.50 / 10đ',
          scale: 0.95,
          gems: '+170 Ngọc'
        }
      ],
      math: [
        {
          avatar: 'MK',
          name: 'Nguyễn Minh Khôi',
          school: '12A1 • Chuyên Toán KHTN',
          streak: '10 đề VDC',
          score: '9.90 / 10đ',
          scale: 0.99,
          gems: '+180 Ngọc'
        },
        {
          avatar: 'BA',
          name: 'Phạm Bảo Anh',
          school: '12A2 • THPT Chu Văn An',
          streak: '9 đề Toán',
          score: '9.65 / 10đ',
          scale: 0.965,
          gems: '+155 Ngọc'
        },
        {
          avatar: 'ĐP',
          name: 'Vũ Đức Phúc',
          school: '11T2 • THPT Kim Liên',
          streak: '8 đề Toán',
          score: '9.45 / 10đ',
          scale: 0.945,
          gems: '+130 Ngọc'
        }
      ],
      cs: [
        {
          avatar: 'KL',
          name: 'Trần Khánh Linh',
          school: '12T1 • Đội tuyển Tin LQĐ',
          streak: '11 đề Tin',
          score: '9.80 / 10đ',
          scale: 0.98,
          gems: '+175 Ngọc'
        },
        {
          avatar: 'HN',
          name: 'Lê Hoàng Nam',
          school: '11Tin • THPT Phan Châu Trinh',
          streak: '10 đề Tin',
          score: '9.60 / 10đ',
          scale: 0.96,
          gems: '+150 Ngọc'
        },
        {
          avatar: 'QM',
          name: 'Đặng Quang Minh',
          school: '12CTin • THPT Gia Định',
          streak: '9 đề Tin',
          score: '9.40 / 10đ',
          scale: 0.94,
          gems: '+125 Ngọc'
        }
      ]
    };

    let timer = null;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-board');
        const rows = BOARDS[key];
        if (!rows || tab.classList.contains('is-active')) return;

        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));

        if (!prefersReducedMotion) {
          podium.classList.remove('is-switching');
          void podium.offsetWidth;
          podium.classList.add('is-switching');
          clearTimeout(timer);
          timer = setTimeout(() => podium.classList.remove('is-switching'), 520);
        }

        [1, 2, 3].forEach((rankIdx) => {
          const d = rows[rankIdx - 1];
          const av = document.getElementById(`chAvatar${rankIdx}`);
          const nm = document.getElementById(`chName${rankIdx}`);
          const sc = document.getElementById(`chSchool${rankIdx}`);
          const st = document.getElementById(`chStreak${rankIdx}`);
          const val = document.getElementById(`chScore${rankIdx}`);
          const bar = document.getElementById(`chBar${rankIdx}`);
          const gm = document.getElementById(`chGems${rankIdx}`);

          if (av) av.textContent = d.avatar;
          if (nm) nm.textContent = d.name;
          if (sc) sc.textContent = d.school;
          if (st) st.textContent = d.streak;
          if (val) val.textContent = d.score;
          if (gm) gm.textContent = d.gems;
          if (bar) {
            bar.style.setProperty('--p-scale', '0.25');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                bar.style.setProperty('--p-scale', String(d.scale));
              });
            });
          }
        });
      });
    });
  }

  function initSubpageRoutePreview() {
    const isStaticStandalone =
      window.location.protocol === 'file:' ||
      window.location.pathname.includes('layout-homepage');

    document.querySelectorAll('a[data-route-preview]').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (!isStaticStandalone) return;
        e.preventDefault();
        const label = link.getAttribute('data-route-preview') || 'Trang con';
        const href = link.getAttribute('href') || '/';
        const menuDrawer = document.getElementById('menuDrawer');
        if (menuDrawer) {
          menuDrawer.classList.remove('is-open');
          menuDrawer.setAttribute('aria-hidden', 'true');
        }
        showAppToast(
          `Đang xem bản thiết kế Trang chủ độc lập — Khi chạy trên Next.js sẽ chuyển tới: ${label} (${href}).`
        );
      });
    });
  }

  function initThemeMode() {
    const STORAGE_KEY = 'schoolify_homepage_theme';
    const drawerThemeLabel = document.getElementById('drawerThemeLabel');
    const footerThemeLabel = document.getElementById('footerThemeLabel');

    let currentTheme = 'light';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        currentTheme = saved;
      }
    } catch (_) {
      // Ignore storage access errors in private mode
    }

    const applyTheme = (theme, announce = false) => {
      currentTheme = theme;
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      if (drawerThemeLabel) {
        drawerThemeLabel.textContent =
          theme === 'dark'
            ? 'Chuyển sang Chế độ Sáng ban ngày'
            : 'Chuyển sang Chế độ Tối ban đêm';
      }
      if (footerThemeLabel) {
        footerThemeLabel.textContent =
          theme === 'dark' ? 'Giao diện: Tối (Đổi sang Sáng)' : 'Giao diện: Sáng (Đổi sang Tối)';
      }

      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (_) {
        // Ignore storage write errors
      }

      if (announce) {
        showAppToast(
          theme === 'dark'
            ? 'Đã bật Chế độ Tối dịu mắt — tối ưu cho khung giờ cày đề Toán & Tin ban đêm.'
            : 'Đã chuyển về Chế độ Sáng tiêu chuẩn.'
        );
      }
    };

    // Automatically inherit Next.js / next-themes theme
    if (document.documentElement.classList.contains('dark')) {
      currentTheme = 'dark';
    }

    applyTheme(currentTheme, false);

    // Keep data-theme in sync if user toggles theme in Navbar
    const themeObserver = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'dark' : 'light', false);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    addCleanup(() => themeObserver.disconnect());

    document.querySelectorAll('[data-toggle-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
      });
    });
  }

  function initInteractiveMiniDemo() {
    const demoSection = document.getElementById('dung-thu');
    const demoRowsEl = document.getElementById('demoRows');
    const demoStemEl = document.getElementById('demoStem');
    const demoCodeEl = document.getElementById('demoCodeBlock');
    const demoTabs = document.querySelectorAll('.demo-tab[data-demo-subj]');
    const demoSubmitBtn = document.getElementById('demoSubmitBtn');
    const demoQuickFillBtn = document.getElementById('demoQuickFillBtn');
    const demoResetBtn = document.getElementById('demoResetBtn');
    const demoCardMain = document.getElementById('demoCardMain');
    const demoAiScanning = document.getElementById('demoAiScanning');
    const scanStep1 = document.getElementById('scanStep1');
    const scanStep2 = document.getElementById('scanStep2');
    const scanStep3 = document.getElementById('scanStep3');

    const demoScorePill = document.getElementById('demoScorePill');
    const demoAiIdle = document.getElementById('demoAiIdle');
    const demoAiResult = document.getElementById('demoAiResult');
    const demoScoreValue = document.getElementById('demoScoreValue');
    const demoGemBonus = document.getElementById('demoGemBonus');
    const demoExplainList = document.getElementById('demoExplainList');
    const demoTipBox = document.getElementById('demoTipBox');

    if (!demoRowsEl || !demoSubmitBtn) return;

    const QUESTIONS = {
      math: {
        stemHtml:
          'Cho hàm số <strong>f(x) = x³ − 3x + 2</strong> trên ℝ. Chọn <strong>Đúng / Sai</strong>:',
        code: null,
        items: [
          {
            key: 'a',
            text: 'Đạo hàm f\'(x) = 3x² − 3.',
            ans: true,
            explain: 'Đúng — (x³ − 3x + 2)\' = 3x² − 3.',
            remedy: 'Áp dụng công thức (xⁿ)\' = n·xⁿ⁻¹: (x³)\' = 3x², (−3x)\' = −3 ⇒ Chọn Đúng.'
          },
          {
            key: 'b',
            text: 'Đồng biến trên (−1; 1).',
            ans: false,
            explain: 'Sai — f\'(x) < 0 trên (−1; 1) ⇒ Nghịch biến.',
            remedy: 'Con bị bẫy dấu tại Ý b! Trên (−1; 1), thử x = 0 vào f\'(x) = 3x² − 3 được −3 < 0 ⇒ Hàm nghịch biến (Bấm Casio d/dx tại x = 0 kiểm tra trong 2s).'
          },
          {
            key: 'c',
            text: 'Cực đại y = 4 tại x = −1.',
            ans: true,
            explain: 'Đúng — f(−1) = 4 là cực đại.',
            remedy: 'f\'(x) đổi dấu từ (+) sang (−) qua x = −1 nên x = −1 là điểm cực đại, thay vào được y = (−1)³ − 3(−1) + 2 = 4 ⇒ Chọn Đúng.'
          },
          {
            key: 'd',
            text: 'Tích phân từ 0→1 của f\'(x)dx = 0.',
            ans: false,
            explain: 'Sai — f(1) − f(0) = 0 − 2 = −2.',
            remedy: 'Theo Newton–Leibniz: ∫₀¹ f\'(x)dx = f(1) − f(0) = 0 − 2 = −2 ≠ 0 ⇒ Chọn Sai.'
          }
        ],
        tipHtml:
          '<strong>🌟 Gia Sư AI khen ngợi:</strong> Con làm đúng tuyệt đối 4/4 ý! Nhớ dùng phím <strong>d/dx</strong> trên Casio để luôn kiểm tra dấu đạo hàm trong 2 giây nhé.'
      },
      cs: {
        stemHtml:
          'Đoạn mã <strong>Python</strong> dưới đây. Chọn <strong>Đúng / Sai</strong>:',
        code: `def tinh_tong(arr):\n    s = 0\n    for x in arr:\n        if x % 2 == 0:\n            s += x\n    return s\n\nprint(tinh_tong([2, 5, 8, 3, 6]))`,
        items: [
          {
            key: 'a',
            text: 'Hàm tính tổng các số chẵn trong mảng.',
            ans: true,
            explain: 'Đúng — x % 2 == 0 lọc số chẵn.',
            remedy: 'Phép toán x % 2 == 0 kiểm tra chia hết cho 2 (số chẵn) rồi mới cộng vào s ⇒ Chọn Đúng.'
          },
          {
            key: 'b',
            text: 'Kết quả in ra màn hình là 24.',
            ans: false,
            explain: 'Sai — Chỉ cộng số chẵn: 2 + 8 + 6 = 16.',
            remedy: 'Con nhầm tại Ý b! 24 là tổng cả mảng, nhưng nhánh if x % 2 == 0 đã bỏ qua hai số lẻ 5 và 3, nên chỉ cộng 2 + 8 + 6 = 16 ⇒ Chọn Sai.'
          },
          {
            key: 'c',
            text: 'Độ phức tạp thời gian là O(n).',
            ans: true,
            explain: 'Đúng — Duyệt 1 vòng lặp qua n phần tử.',
            remedy: 'Vòng lặp for x in arr duyệt qua từng phần tử đúng 1 lần ⇒ Độ phức tạp tuyến tính O(n) ⇒ Chọn Đúng.'
          },
          {
            key: 'd',
            text: 'Mảng toàn số lẻ [1, 3, 5] gây lỗi.',
            ans: false,
            explain: 'Sai — Trả về s = 0 an toàn.',
            remedy: 'Biến s được khởi tạo s = 0 ngay đầu hàm nên không bao giờ lỗi UnboundLocalError ⇒ Chọn Sai.'
          }
        ],
        tipHtml:
          '<strong>🌟 Gia Sư AI khen ngợi:</strong> Tuyệt vời 4/4 ý! Khi đọc code Python, con luôn dõi theo điều kiện lọc <code>if</code> và giá trị khởi tạo <code>s = 0</code> nhé.'
      }
    };

    const SCALE_POINTS = [0, 0.1, 0.25, 0.5, 1.0];
    let activeSubj = 'math';
    let userChoices = [null, null, null, null];
    let isGraded = false;
    let hasUserInteracted = false;
    let simTimers = [];

    const clearSimTimers = () => {
      simTimers.forEach((t) => clearTimeout(t));
      simTimers = [];
    };

    const renderQuestion = (pulseIdx = -1) => {
      const q = QUESTIONS[activeSubj];
      if (!q) return;

      if (demoStemEl) demoStemEl.innerHTML = q.stemHtml;
      if (demoCodeEl) {
        if (q.code) {
          demoCodeEl.hidden = false;
          demoCodeEl.textContent = q.code;
        } else {
          demoCodeEl.hidden = true;
        }
      }

      demoRowsEl.innerHTML = '';
      q.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'demo-row';
        if (isGraded) {
          row.classList.add(userChoices[idx] === item.ans ? 'is-correct' : 'is-wrong');
        }
        if (idx === pulseIdx) {
          row.classList.add('is-sim-active');
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'demo-row__text';
        textDiv.innerHTML = `<strong>${item.key})</strong> ${item.text}`;

        const pills = document.createElement('div');
        pills.className = 'tf-pills';

        const btnTrue = document.createElement('button');
        btnTrue.type = 'button';
        btnTrue.className = `tf-btn${userChoices[idx] === true ? ' is-selected' : ''}${idx === pulseIdx && userChoices[idx] === true ? ' is-sim-clicking' : ''}`;
        btnTrue.textContent = 'Đúng';
        btnTrue.addEventListener('click', () => {
          hasUserInteracted = true;
          clearSimTimers();
          userChoices[idx] = true;
          isGraded = false;
          resetAiPanelOnly();
          renderQuestion();
        });

        const btnFalse = document.createElement('button');
        btnFalse.type = 'button';
        btnFalse.className = `tf-btn${userChoices[idx] === false ? ' is-selected' : ''}${idx === pulseIdx && userChoices[idx] === false ? ' is-sim-clicking' : ''}`;
        btnFalse.textContent = 'Sai';
        btnFalse.addEventListener('click', () => {
          hasUserInteracted = true;
          clearSimTimers();
          userChoices[idx] = false;
          isGraded = false;
          resetAiPanelOnly();
          renderQuestion();
        });

        pills.appendChild(btnTrue);
        pills.appendChild(btnFalse);
        row.appendChild(textDiv);
        row.appendChild(pills);
        demoRowsEl.appendChild(row);
      });
    };

    const resetAiPanelOnly = () => {
      if (demoAiIdle) demoAiIdle.hidden = false;
      if (demoAiScanning) demoAiScanning.hidden = true;
      if (demoAiResult) demoAiResult.hidden = true;
      if (demoResetBtn) demoResetBtn.hidden = true;
      if (demoQuickFillBtn) demoQuickFillBtn.hidden = false;
      if (demoCardMain) demoCardMain.classList.remove('is-scanning');
      if (demoSubmitBtn) {
        demoSubmitBtn.disabled = false;
        demoSubmitBtn.innerHTML = 'Chấm điểm &amp; Hỏi Gia Sư AI ⚡';
      }
      if (demoScorePill) {
        demoScorePill.textContent = 'Chờ nộp bài';
        demoScorePill.classList.remove('is-done');
      }
      [scanStep1, scanStep2, scanStep3].forEach((step) => {
        if (step) {
          step.className = 'ai-scan-step';
        }
      });
      isScanningInProgress = false;
    };

    let isScanningInProgress = false;

    const finalizeGrading = (q, rightCount, score) => {
      isGraded = true;
      renderQuestion();

      if (demoAiScanning) demoAiScanning.hidden = true;
      if (demoAiResult) demoAiResult.hidden = false;
      if (demoResetBtn) demoResetBtn.hidden = false;
      if (demoQuickFillBtn) demoQuickFillBtn.hidden = true;

      if (demoScorePill) {
        demoScorePill.textContent = rightCount === 4 ? 'Đúng 4/4 ý ★' : `Đúng ${rightCount}/4 • Gợi ý sửa ${4 - rightCount} câu sai`;
        demoScorePill.classList.add('is-done');
      }

      // Animate score count-up
      if (demoScoreValue) {
        const targetScore = score;
        let startVal = 0;
        const duration = 380;
        const startTime = performance.now();
        const updateCount = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const curVal = startVal + (targetScore - startVal) * progress;
          demoScoreValue.textContent = `${curVal.toFixed(2)} / 1.00 điểm`;
          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            demoScoreValue.textContent = `${targetScore.toFixed(2)} / 1.00 điểm`;
          }
        };
        requestAnimationFrame(updateCount);
      }

      if (demoGemBonus) {
        demoGemBonus.textContent =
          rightCount === 4 ? '+2 Ngọc Tri Thức (Tuyệt đối!)' : `Cần sửa ${4 - rightCount} mệnh đề sai`;
        demoGemBonus.classList.remove('has-bounce');
        void demoGemBonus.offsetWidth;
        demoGemBonus.classList.add('has-bounce');
      }

      const wrongItems = [];
      if (demoExplainList) {
        demoExplainList.innerHTML = q.items
          .map((item, idx) => {
            const ok = userChoices[idx] === item.ans;
            if (!ok) wrongItems.push({ item, idx });
            const mark = ok ? '✓ Đúng' : `✕ Sai (Chọn ${userChoices[idx] ? 'Đúng' : 'Sai'})`;
            return `<div class="demo-explain-item ${ok ? 'is-ok' : 'is-wrong-item'}"><strong>Ý ${item.key} (${mark}):</strong> ${item.explain}</div>`;
          })
          .join('');
      }

      if (demoTipBox) {
        if (wrongItems.length > 0) {
          const wrongKeys = wrongItems.map((w) => `Ý ${w.item.key}`).join(', ');
          const remedyText = wrongItems.map((w) => w.item.remedy).join(' ');
          demoTipBox.innerHTML = `
            <div class="ai-remedy-box">
              <div class="ai-remedy-head">
                <span class="ai-remedy-badge">💡 GIA SƯ AI GỢI Ý SỬA SAI (${wrongKeys.toUpperCase()})</span>
              </div>
              <p class="ai-remedy-text" id="demoRemedyText"></p>
              <button type="button" class="demo-remedy-fix-btn" id="demoAutoFixBtn">
                ✨ Sửa lại ${wrongKeys} theo gợi ý AI → Nâng lên 1.00đ
              </button>
            </div>
          `;
          const remedyEl = document.getElementById('demoRemedyText');
          if (remedyEl) {
            let charIdx = 0;
            const totalLen = remedyText.length;
            const tw = setInterval(() => {
              charIdx += 3;
              remedyEl.textContent = remedyText.slice(0, charIdx);
              if (charIdx >= totalLen) clearInterval(tw);
            }, 18);
          }
          const fixBtn = document.getElementById('demoAutoFixBtn');
          if (fixBtn) {
            fixBtn.addEventListener('click', () => {
              hasUserInteracted = true;
              userChoices = q.items.map((it) => it.ans);
              finalizeGrading(q, 4, 1.0);
            });
          }
        } else {
          demoTipBox.innerHTML = q.tipHtml;
        }
      }

      if (demoSubmitBtn) {
        demoSubmitBtn.disabled = false;
        demoSubmitBtn.innerHTML = 'Chấm điểm &amp; Hỏi Gia Sư AI ⚡';
      }
      if (demoCardMain) demoCardMain.classList.remove('is-scanning');
      isScanningInProgress = false;
    };

    const gradeCurrentQuestion = (opts = {}) => {
      if (isScanningInProgress) return;
      const q = QUESTIONS[activeSubj];
      if (!q) return;

      if (userChoices.some((v) => v === null)) {
        showAppToast('Bạn hãy chọn Đúng hoặc Sai cho đủ cả 4 ý a, b, c, d nhé!');
        return;
      }

      let rightCount = 0;
      q.items.forEach((item, idx) => {
        if (userChoices[idx] === item.ans) rightCount += 1;
      });
      const score = SCALE_POINTS[rightCount];

      if (prefersReducedMotion) {
        finalizeGrading(q, rightCount, score);
        return;
      }

      const fast = Boolean(opts && opts.fastSim);
      const t1 = fast ? 140 : 240;
      const t2 = fast ? 280 : 480;
      const t3 = fast ? 410 : 680;
      const tDone = fast ? 470 : 750;

      // Trigger Cybernetic AI Scan Sequence
      isScanningInProgress = true;
      if (demoSubmitBtn) {
        demoSubmitBtn.disabled = true;
        demoSubmitBtn.innerHTML = '<span class="ai-pulse-dot" style="display:inline-block;margin-right:6px"></span> Gia Sư AI đang phân tích câu sai...';
      }
      if (demoCardMain) {
        demoCardMain.classList.remove('is-scanning');
        void demoCardMain.offsetWidth;
        demoCardMain.classList.add('is-scanning');
      }
      if (demoAiIdle) demoAiIdle.hidden = true;
      if (demoAiResult) demoAiResult.hidden = true;
      if (demoAiScanning) demoAiScanning.hidden = false;

      if (scanStep1) scanStep1.className = 'ai-scan-step is-active';
      if (scanStep2) scanStep2.className = 'ai-scan-step';
      if (scanStep3) scanStep3.className = 'ai-scan-step';

      simTimers.push(
        setTimeout(() => {
          if (scanStep1) scanStep1.className = 'ai-scan-step is-done';
          if (scanStep2) scanStep2.className = 'ai-scan-step is-active';
        }, t1),
        setTimeout(() => {
          if (scanStep2) scanStep2.className = 'ai-scan-step is-done';
          if (scanStep3) scanStep3.className = 'ai-scan-step is-active';
        }, t2),
        setTimeout(() => {
          if (scanStep3) scanStep3.className = 'ai-scan-step is-done';
        }, t3),
        setTimeout(() => {
          finalizeGrading(q, rightCount, score);
        }, tDone)
      );
    };

    // Auto-simulation: giả lập học sinh chọn đáp án (sai ở ý b) -> AI chấm và gợi ý sửa sai 1:1
    let hasAutoSimulated = false;
    const runAutoDemoSimulation = (force = false) => {
      if (!force && (hasAutoSimulated || hasUserInteracted)) return;
      hasAutoSimulated = true;
      clearSimTimers();

      const q = QUESTIONS[activeSubj];
      if (!q) return;

      isGraded = false;
      userChoices = [null, null, null, null];
      resetAiPanelOnly();
      renderQuestion();

      if (demoScorePill) {
        demoScorePill.textContent = '🤖 Đang giả lập học sinh làm bài...';
      }

      // Học sinh chọn: a=Đúng (Đúng), b=Đúng (SAI!), c=Đúng (Đúng), d=Sai (Đúng)
      const simPicks = [q.items[0].ans, !q.items[1].ans, q.items[2].ans, q.items[3].ans];

      simPicks.forEach((choiceVal, idx) => {
        simTimers.push(
          setTimeout(() => {
            if (hasUserInteracted && !force) return;
            userChoices[idx] = choiceVal;
            renderQuestion(idx);
          }, 150 + idx * 230)
        );
      });

      simTimers.push(
        setTimeout(() => {
          if (hasUserInteracted && !force) return;
          gradeCurrentQuestion({ fastSim: true });
        }, 1140)
      );
    };

    window.__triggerDemoSimulation = runAutoDemoSimulation;

    if (demoSection && 'IntersectionObserver' in window) {
      const demoObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAutoSimulated && !hasUserInteracted) {
              runAutoDemoSimulation(false);
            }
          });
        },
        { threshold: 0.35 }
      );
      demoObs.observe(demoSection);
      addCleanup(() => demoObs.disconnect());
    }

    demoTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const subj = tab.getAttribute('data-demo-subj');
        if (!subj || !QUESTIONS[subj]) return;
        hasUserInteracted = true;
        clearSimTimers();
        activeSubj = subj;
        userChoices = [null, null, null, null];
        isGraded = false;
        demoTabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        resetAiPanelOnly();
        renderQuestion();
      });
    });

    demoSubmitBtn.addEventListener('click', () => {
      hasUserInteracted = true;
      clearSimTimers();
      gradeCurrentQuestion();
    });

    if (demoQuickFillBtn) {
      demoQuickFillBtn.addEventListener('click', () => {
        hasUserInteracted = true;
        clearSimTimers();
        const q = QUESTIONS[activeSubj];
        if (!q) return;
        // Điền nhanh có 1 câu sai (ý b) để trải nghiệm Gia Sư AI gợi ý sửa sai
        userChoices = [q.items[0].ans, !q.items[1].ans, q.items[2].ans, q.items[3].ans];
        gradeCurrentQuestion({ fastSim: true });
      });
    }

    if (demoResetBtn) {
      demoResetBtn.addEventListener('click', () => {
        hasUserInteracted = true;
        clearSimTimers();
        userChoices = [null, null, null, null];
        isGraded = false;
        resetAiPanelOnly();
        renderQuestion();
      });
    }

    renderQuestion();
  }

  function initFaqAccordion() {
    const items = document.querySelectorAll('#faqAccordion .faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((other) => {
          const otherBtn = other.querySelector('.faq-trigger');
          const openState = other === item ? willOpen : false;
          other.classList.toggle('is-open', openState);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', openState ? 'true' : 'false');
        });
      });
    });
  }

  function initScrollProgressBar() {
    const progressWrap = document.getElementById('scrollProgressWrap');
    const progressFill = document.getElementById('scrollProgressFill');
    if (!progressWrap || !progressFill) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;
      const pct = docHeight > 0 ? Math.max(0, Math.min(100, (scrollTop / docHeight) * 100)) : 0;

      progressFill.style.width = `${pct.toFixed(2)}%`;
      progressWrap.classList.toggle('is-active', scrollTop > 12);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
  }

  function initContactSection() {
    const contactForm = document.getElementById('contactForm');
    const contactName = document.getElementById('contactName');
    const contactMethod = document.getElementById('contactMethod');
    const contactMessage = document.getElementById('contactMessage');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const topicChips = document.querySelectorAll('#contactTopics .topic-chip');

    if (!contactForm) return;

    let selectedTopic = 'Hỗ trợ OTP / Tài khoản';
    const placeholders = {
      'Hỗ trợ OTP / Tài khoản':
        'Mô tả số điện thoại hoặc email bạn dùng đăng nhập và vấn đề đang gặp phải...',
      'Báo lỗi câu Toán – Tin':
        'Nhập tên đề / khối lớp và câu hỏi Toán hoặc đoạn code Tin học bạn muốn báo kiểm tra...',
      'Tư vấn Gói thành viên':
        'Bạn cần tư vấn thêm về Gói Bứt Phá (50k), Thủ Khoa VIP (100k) hay thanh toán VietQR?'
    };

    topicChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        selectedTopic = chip.getAttribute('data-topic') || 'Hỗ trợ chung';
        topicChips.forEach((c) => c.classList.toggle('is-active', c === chip));
        if (contactMessage && placeholders[selectedTopic]) {
          contactMessage.placeholder = placeholders[selectedTopic];
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = contactName ? contactName.value.trim() : '';
      const methodVal = contactMethod ? contactMethod.value.trim() : '';
      const msgVal = contactMessage ? contactMessage.value.trim() : '';

      if (!nameVal || !methodVal || !msgVal) {
        showAppToast('Vui lòng điền đầy đủ Họ tên, SĐT/Email và Nội dung cần hỗ trợ.');
        return;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.textContent = 'Đã gửi tin nhắn thành công ✓';
        setTimeout(() => {
          contactSubmitBtn.textContent = 'Gửi tin nhắn tới Schoolify →';
        }, 3200);
      }

      contactForm.reset();
      showAppToast(
        `Cảm ơn ${nameVal}! Yêu cầu "${selectedTopic}" đã được ghi nhận — Schoolify sẽ phản hồi qua ${methodVal} sớm nhất.`
      );
    });
  }

  function initBackToTop() {
    const backBtn = document.getElementById('backToTopBtn');
    if (!backBtn || !backBtn.parentNode) return;

    // ---- Dock: nhóm các nút nổi, neo ngay phía TRÊN robot chat ----
    const dock = document.createElement('div');
    dock.className = 'scroll-dock';
    dock.id = 'scrollDock';
    backBtn.parentNode.insertBefore(dock, backBtn);
    dock.appendChild(backBtn);

    const autoBtn = document.createElement('button');
    autoBtn.type = 'button';
    autoBtn.className = 'auto-scroll-btn';
    autoBtn.id = 'autoScrollBtn';
    autoBtn.setAttribute('aria-pressed', 'false');
    autoBtn.setAttribute('aria-label', 'Bật chế độ tự lướt xuống từng phần');
    autoBtn.title = 'Tự lướt xuống từng phần';
    autoBtn.innerHTML =
      '<svg class="auto-scroll-btn__icon auto-scroll-btn__icon--play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>' +
      '<svg class="auto-scroll-btn__icon auto-scroll-btn__icon--pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>';
    dock.appendChild(autoBtn);

    const checkChatState = () => {
      const chatOpen = document.querySelector('[data-chat-open]');
      dock.classList.toggle('is-chat-open', Boolean(chatOpen));
      if (chatOpen && autoActive) stopAuto(false, true);
    };

    const onScroll = () => {
      backBtn.classList.toggle('is-visible', window.scrollY > 560);
    };

    let autoActive = false;
    let autoRaf = 0;
    let autoFinishTimer = 0;

    const getScrollY = () => window.scrollY || document.documentElement.scrollTop || 0;

    const buildTourMap = () => {
      const y = getScrollY();
      const vh = window.innerHeight || 900;

      // 1. Tọa độ section #chuyen-dich (Pinned Origami Glider Wipe & 9-Plane Squadron)
      let cdTop = vh;
      let pinDist = vh * 2.5;
      const chuyenDich = document.getElementById('chuyen-dich');
      if (chuyenDich) {
        const cdRect = chuyenDich.getBoundingClientRect();
        cdTop = Math.max(0, cdRect.top + y);
        pinDist =
          chuyenDich.offsetHeight > vh
            ? chuyenDich.offsetHeight - vh
            : vh * 2.5;
      }
      const cdEnd = cdTop + pinDist;

      // 2. Điểm dừng cuối cùng: căn giữa .closing-cta__box trên màn hình (KHÔNG cuộn xuống Footer)
      let ctaTargetY = Math.max(0, document.documentElement.scrollHeight - vh * 1.5);
      const closingCta = document.querySelector('section.closing-cta');
      if (closingCta) {
        const box = closingCta.querySelector('.closing-cta__box') || closingCta;
        const r = box.getBoundingClientRect();
        ctaTargetY = Math.max(
          0,
          Math.round(r.top + y - Math.max(0, (vh - r.height) / 2))
        );
      }

      // 3. Các điểm dừng tạm (Dwell Stops): 4 trụ cột công nghệ (2s), #tac-dong 3 đĩa tròn (2.2s) & Phòng thí nghiệm Gia Sư AI (2.7s)
      const dwellStops = [];
      const pillarEls = document.querySelectorAll('#voyageArena .v-item');
      pillarEls.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const stopY = Math.round(r.top + y - Math.max(70, (vh - Math.min(r.height, vh * 0.78)) * 0.48));
        if (stopY > cdEnd + 40 && stopY < ctaTargetY - 200) {
          dwellStops.push({
            targetY: stopY,
            dwellMs: 2000,
            visited: false,
            onArrive: () => {
              if (typeof window.__triggerVoyagePillar === 'function') {
                window.__triggerVoyagePillar(el, idx);
              }
            }
          });
        }
      });

      const impactEl = document.getElementById('tac-dong');
      if (impactEl) {
        const r = impactEl.getBoundingClientRect();
        const stopY = Math.round(r.top + y + Math.max(0, (r.height - vh) * 0.35));
        if (stopY > cdEnd + 80 && stopY < ctaTargetY - 200) {
          dwellStops.push({
            targetY: stopY,
            dwellMs: 2200,
            visited: false,
            onArrive: () => {
              if (typeof window.__triggerImpactSection === 'function') {
                window.__triggerImpactSection();
              }
            }
          });
        }
      }

      const demoEl = document.getElementById('demoCardMain');
      if (demoEl) {
        const r = demoEl.getBoundingClientRect();
        const stopY = Math.round(r.top + y - Math.max(80, (vh - Math.min(r.height, vh * 0.8)) * 0.45));
        if (stopY > cdEnd + 100 && stopY < ctaTargetY - 200) {
          dwellStops.push({
            targetY: stopY,
            dwellMs: 2700,
            visited: false,
            onArrive: () => {
              if (typeof window.__triggerDemoSimulation === 'function') {
                window.__triggerDemoSimulation(true);
              }
            }
          });
        }
      }

      // 4. Các điểm tiêu cự nội dung còn lại để tự động giảm tốc nhẹ
      const focalSelectors = [
        '#kho-de #catalogCardsGrid',
        '#bang-vang',
        '#goi-dang-ky',
        '#hoi-dap #faqAccordion',
        '#lien-he .contact-layout'
      ];

      const focalPoints = [];
      focalSelectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const centerScrollY = r.top + y - Math.max(60, (vh - Math.min(r.height, vh * 0.78)) * 0.45);
        if (centerScrollY > cdEnd + 80 && centerScrollY < ctaTargetY - 240) {
          focalPoints.push({
            targetY: centerScrollY,
            radius: 200,
            minSpeed: 155
          });
        }
      });

      return { cdTop, pinDist, cdEnd, ctaTargetY, dwellStops, focalPoints };
    };

    const setAutoUi = (on) => {
      autoBtn.classList.toggle('is-active', on);
      autoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      autoBtn.setAttribute(
        'aria-label',
        on ? 'Dừng tự lướt' : 'Bật chế độ tự lướt xuống từng phần'
      );
      autoBtn.title = on ? 'Dừng tự lướt' : 'Tự lướt xuống từng phần';
    };

    function stopAuto(finished, silent) {
      if (!autoActive) return;
      autoActive = false;
      cancelAnimationFrame(autoRaf);
      clearTimeout(autoFinishTimer);
      autoRaf = 0;
      autoFinishTimer = 0;
      setAutoUi(false);

      if (lenisInstance) {
        try {
          if (typeof lenisInstance.start === 'function') lenisInstance.start();
          lenisInstance.scrollTo(getScrollY(), { immediate: true, force: true });
        } catch (e) {}
      }

      checkChatState();
      if (!silent) {
        showAppToast(finished ? 'Đã lướt tới cuối trang.' : 'Đã dừng tự lướt.');
      }
    }

    const startAuto = () => {
      if (autoActive) return;

      if (lenisInstance && typeof lenisInstance.stop === 'function') {
        try {
          lenisInstance.stop();
        } catch (e) {}
      }

      let tour = buildTourMap();
      let curY = getScrollY();

      if (curY >= tour.ctaTargetY - 45) {
        curY = 0;
        window.scrollTo(0, 0);
        if (window.ScrollTrigger) window.ScrollTrigger.update();
        tour = buildTourMap();
      } else {
        // Đánh dấu những điểm dwell đã đi qua trước vị trí hiện tại
        tour.dwellStops.forEach((ds) => {
          if (ds.targetY < curY - 20) ds.visited = true;
        });
      }

      autoActive = true;
      setAutoUi(true);
      showAppToast('Tự lướt đã bật — chạm hoặc cuộn để dừng.');

      let currentSpeed = 190;
      let lastNow = performance.now();
      let pauseUntil = 0;

      const tick = (now) => {
        if (!autoActive) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
        lastNow = now;

        // Đang trong thời gian dừng 2s tại mỗi Trụ cột công nghệ hoặc Phòng thí nghiệm AI
        if (now < pauseUntil) {
          currentSpeed = 0;
          autoRaf = requestAnimationFrame(tick);
          return;
        }

        const rem = tour.ctaTargetY - curY;
        if (rem <= 1.2) {
          window.scrollTo(0, tour.ctaTargetY);
          if (window.ScrollTrigger) window.ScrollTrigger.update();
          autoFinishTimer = setTimeout(() => {
            if (autoActive) stopAuto(true);
          }, 900);
          return;
        }

        // Kiểm tra điểm dừng 2s tiếp theo (4 trụ cột công nghệ & #dung-thu)
        let nextDwell = null;
        for (let i = 0; i < tour.dwellStops.length; i++) {
          if (!tour.dwellStops[i].visited) {
            nextDwell = tour.dwellStops[i];
            break;
          }
        }

        let targetSpeed = 520;

        if (nextDwell && nextDwell.targetY - curY <= 220) {
          const distToStop = nextDwell.targetY - curY;
          if (distToStop <= 3.5) {
            // Chạm đúng điểm dừng: khóa vị trí, kích hoạt animation thanh tiến trình / gõ chữ và dừng 2s
            curY = nextDwell.targetY;
            nextDwell.visited = true;
            currentSpeed = 0;
            pauseUntil = now + nextDwell.dwellMs;
            window.scrollTo(0, curY);
            if (window.ScrollTrigger) window.ScrollTrigger.update();
            if (typeof nextDwell.onArrive === 'function') nextDwell.onArrive();
            autoRaf = requestAnimationFrame(tick);
            return;
          }
          // Giảm tốc êm ái khi tiến vào điểm dừng 2s
          targetSpeed = Math.max(42, distToStop * 2.1);
        } else if (rem < 420) {
          targetSpeed = Math.max(38, rem * 1.28);
        } else if (curY >= tour.cdTop - 30 && curY <= tour.cdEnd) {
          // Điều tốc chuyên biệt trong section #chuyen-dich (Chữ chạy nhanh theo dòng + nghỉ 0.8s giữa mỗi dòng)
          const pCD = Math.max(0, Math.min(1, (curY - tour.cdTop) / Math.max(1, tour.pinDist)));
          if (pCD < 0.04) {
            targetSpeed = 440;
          } else if (pCD < 0.16) {
            // Đoạn máy bay TO bắt đầu quét ngang mở chữ mới
            targetSpeed = 720;
          } else if (pCD < 0.50) {
            // Đoạn đọc 3 dòng #textAfterLayer (mỗi dòng chạy nhanh + delay 0.8s)
            targetSpeed = Math.max(180, Math.round((0.34 * tour.pinDist) / 2.85));
          } else if (pCD < 0.57) {
            // Đội hình 9 máy bay nhỏ bay từ mép phải vào vị trí đọc
            targetSpeed = 380;
          } else if (pCD < 0.97) {
            // Đoạn đọc 3 dòng #swarmConvoy (mỗi dòng chạy nhanh ~0.22s + delay 0.8s giữa các dòng = ~2.6s + giữ đọc)
            targetSpeed = Math.max(150, Math.round((0.40 * tour.pinDist) / 3.35));
          } else {
            targetSpeed = 360;
          }
        } else {
          for (let i = 0; i < tour.focalPoints.length; i++) {
            const fp = tour.focalPoints[i];
            const dist = Math.abs(curY - fp.targetY);
            if (dist < fp.radius) {
              const blend = 0.5 * (1 - Math.cos(Math.PI * (dist / fp.radius)));
              const s = fp.minSpeed + (targetSpeed - fp.minSpeed) * blend;
              if (s < targetSpeed) targetSpeed = s;
            }
          }
        }

        currentSpeed += (targetSpeed - currentSpeed) * (1 - Math.exp(-9.0 * dt));
        curY = Math.min(tour.ctaTargetY, curY + currentSpeed * dt);

        window.scrollTo(0, curY);
        if (window.ScrollTrigger) window.ScrollTrigger.update();

        autoRaf = requestAnimationFrame(tick);
      };

      autoRaf = requestAnimationFrame(tick);
    };

    autoBtn.addEventListener('click', () => {
      if (autoActive) stopAuto(false);
      else startAuto();
    });

    const onUserInput = (e) => {
      if (!autoActive) return;
      if (e && e.target && e.target.nodeType === 1 && dock.contains(e.target)) return;
      stopAuto(false);
    };
    const onKeyInput = (e) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
        onUserInput(e);
      }
    };

    backBtn.addEventListener('click', () => {
      stopAuto(false, true);
      if (lenisInstance) {
        lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('pointerdown', onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyInput);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkChatState, { passive: true });
    const dockTimer = setInterval(() => {
      if (!autoActive) checkChatState();
    }, 500);

    onScroll();
    checkChatState();

    addCleanup(() => {
      stopAuto(false, true);
      clearInterval(dockTimer);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('pointerdown', onUserInput);
      window.removeEventListener('keydown', onKeyInput);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkChatState);
      if (dock.parentNode) dock.parentNode.removeChild(dock);
    });
  }

  function initImpactIsoInteractions() {
    const impactSky = document.getElementById('tac-dong');
    const ctaSquare = impactSky ? impactSky.querySelector('.bento-cta-square, .impact-portal-pill') : null;
    const stats = impactSky ? impactSky.querySelectorAll('.impact-stat, .impact-dial') : [];
    const isoStage = document.getElementById('isoStage');
    const isoSvg = impactSky ? impactSky.querySelector('.iso-glider-svg') : null;
    const expressRunner = document.getElementById('isoExpressRunner');
    if (!impactSky) return;

    // Hovering ANY stat card or the CTA square triggers the plane's afterburners!
    const triggerElements = [...stats, ctaSquare].filter(Boolean);
    triggerElements.forEach((el) => {
      el.addEventListener('pointerenter', () => impactSky.classList.add('is-boosted'));
      el.addEventListener('pointerleave', () => impactSky.classList.remove('is-boosted'));
    });

    let boostTimer = null;
    if (isoStage) {
      isoStage.addEventListener('click', () => {
        impactSky.classList.add('is-boosted');
        if (expressRunner && !prefersReducedMotion) {
          expressRunner.style.animation = 'none';
          void expressRunner.offsetWidth;
          expressRunner.style.animation = '';
        }
        clearTimeout(boostTimer);
        boostTimer = setTimeout(() => {
          impactSky.classList.remove('is-boosted');
        }, 1600);
      });
    }

    if (prefersReducedMotion || !isoSvg) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    isoSvg.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

    let rafPending = false;
    let mx = 0;
    let my = 0;
    let impactRect = null;

    const updateImpactRect = () => {
      if (impactSky) impactRect = impactSky.getBoundingClientRect();
    };
    window.addEventListener('resize', updateImpactRect, { passive: true });
    addCleanup(() => window.removeEventListener('resize', updateImpactRect));

    impactSky.addEventListener('pointerenter', updateImpactRect, { passive: true });

    impactSky.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (rafPending) return;
        rafPending = true;

        requestAnimationFrame(() => {
          rafPending = false;
          if (!impactRect) updateImpactRect();
          const r = impactRect || { left: 0, top: 0, width: window.innerWidth, height: 400 };
          const nx = (mx - r.left) / (r.width || 1) - 0.5;
          const ny = (my - r.top) / (r.height || 1) - 0.5;
          const rotY = nx * 14;
          const rotX = -ny * 10;
          const shiftX = nx * 28;
          const shiftY = ny * 18;
          isoSvg.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        });
      },
      { passive: true }
    );

    impactSky.addEventListener(
      'pointerleave',
      () => {
        isoSvg.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      },
      { passive: true }
    );
  }

  function initTechCardInteractions() {
    if (prefersReducedMotion || isLowEndDevice) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.v-card, .tilt-card').forEach((card) => {
      let rafPending = false;
      let lastX = 0;
      let lastY = 0;
      let cardRect = null;

      const getLiftY = () => {
        if (window.innerWidth >= 960 && card.classList.contains('podium-card--1')) return -16;
        if (window.innerWidth >= 920 && card.classList.contains('c-card--featured')) return -12;
        return -6;
      };

      card.addEventListener(
        'pointerenter',
        () => {
          card.classList.add('is-tilting');
          cardRect = card.getBoundingClientRect();
        },
        { passive: true }
      );

      card.addEventListener(
        'pointermove',
        (e) => {
          lastX = e.clientX;
          lastY = e.clientY;
          if (rafPending) return;
          rafPending = true;

          requestAnimationFrame(() => {
            rafPending = false;
            if (!card.classList.contains('is-tilting')) return;
            if (!cardRect) cardRect = card.getBoundingClientRect();
            const r = cardRect;
            const px = Math.max(0, Math.min(1, (lastX - r.left) / (r.width || 1)));
            const py = Math.max(0, Math.min(1, (lastY - r.top) / (r.height || 1)));

            const rotY = (px - 0.5) * 6.5;
            const rotX = (0.5 - py) * 5.5;
            const liftY = getLiftY();

            card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
            card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
            card.style.transform = `perspective(1050px) translate3d(0, ${liftY}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
          });
        },
        { passive: true }
      );

      card.addEventListener(
        'pointerleave',
        () => {
          card.classList.remove('is-tilting');
          cardRect = null;
          card.style.transform = '';
        },
        { passive: true }
      );
    });
  }

  function initMagneticButtons() {
    if (prefersReducedMotion || isLowEndDevice) return;
    document.querySelectorAll('.magnetic').forEach((btn) => {
      let rafPending = false;
      let lastX = 0;
      let lastY = 0;
      let btnRect = null;

      btn.addEventListener(
        'pointerenter',
        () => {
          btnRect = btn.getBoundingClientRect();
        },
        { passive: true }
      );

      btn.addEventListener(
        'pointermove',
        (e) => {
          lastX = e.clientX;
          lastY = e.clientY;
          if (rafPending) return;
          rafPending = true;

          requestAnimationFrame(() => {
            rafPending = false;
            if (!btnRect) btnRect = btn.getBoundingClientRect();
            const r = btnRect;
            const dx = (lastX - (r.left + r.width / 2)) * 0.18;
            const dy = (lastY - (r.top + r.height / 2)) * 0.22;
            btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
          });
        },
        { passive: true }
      );

      btn.addEventListener(
        'pointerleave',
        () => {
          btnRect = null;
          btn.style.transform = 'translate3d(0, 0, 0)';
        },
        { passive: true }
      );
    });
  }

  // =========================================================================
  // BOOTSTRAP ALL MODULES
  // =========================================================================
  let bootstrapRetryCount = 0;
  function bootstrap() {
    if (typeof window !== 'undefined' && window.__schoolifyHomepageRunning) {
      return;
    }
    const rootEl = document.getElementById('schoolify-homepage-root');
    if (!rootEl) {
      return;
    }

    if ((typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') && bootstrapRetryCount < 30) {
      bootstrapRetryCount++;
      setTimeout(bootstrap, 40);
      return;
    }
    bootstrapRetryCount = 0;

    isHomepageActive = true;
    if (typeof window !== 'undefined') {
      window.__schoolifyHomepageRunning = true;
    }

    initThemeMode();
    initPreloader();
    initScrollProgressBar();
    initConstellationSkyCanvas();
    initSmoothScrollAndNav();
    initAuthAndWallet();
    initOrigamiChoreography();
    initRevealsAndCounters();
    initInteractiveMiniDemo();
    initGradeCatalogTabs();
    initChampionshipPodium();
    initFaqAccordion();
    initContactSection();
    initBackToTop();
    initSubpageRoutePreview();
    initImpactIsoInteractions();
    initTechCardInteractions();
    initMagneticButtons();
  }

  if (typeof window !== 'undefined') {
    window.__initSchoolifyHomepage = bootstrap;
    window.__destroySchoolifyHomepage = destroyHomepage;
  }
  if (typeof document !== 'undefined' && document.getElementById('schoolify-homepage-root')) {
    bootstrap();
  }
})();
