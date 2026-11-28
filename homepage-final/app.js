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
        document.body.classList.remove('is-loading');
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

    const pointer = { x: -9999, y: -9999, active: false };
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

      constellationStars.length = 0;
      const count = Math.min(68, Math.max(34, Math.floor((width * height) / 22000)));
      for (let i = 0; i < count; i++) {
        const hasGlyph = i % 3 === 0;
        constellationStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 9,
          vy: 8 + Math.random() * 16,
          r: hasGlyph ? 2.2 : 1.1 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          glyph: hasGlyph ? GLYPHS[i % GLYPHS.length] : null,
          isGold: i % 5 === 0
        });
      }
    }

    function spawnStardust(noseX, tailY, wingSpanHalf) {
      // Alternate spawning between left wingtip, right wingtip, and center tail
      const mode = Math.random();
      let sx = noseX;
      let sy = tailY;
      let vx = (Math.random() - 0.5) * 14;

      if (mode < 0.34) {
        sx = noseX - wingSpanHalf * 0.92 + (Math.random() - 0.5) * 6;
        sy = tailY + 12;
        vx = -6 - Math.random() * 10;
      } else if (mode < 0.68) {
        sx = noseX + wingSpanHalf * 0.92 + (Math.random() - 0.5) * 6;
        sy = tailY + 12;
        vx = 6 + Math.random() * 10;
      } else {
        sx = noseX + (Math.random() - 0.5) * 26;
        sy = tailY + Math.random() * 20;
      }

      const isSpark = Math.random() < 0.28;
      stardustTrail.push({
        x: sx,
        y: sy,
        vx,
        vy: 75 + Math.random() * 95,
        r: isSpark ? 2.4 : 1.2 + Math.random() * 2.4,
        life: 0,
        maxLife: 0.95 + Math.random() * 1.15,
        color: isSpark ? '251, 191, 36' : '0, 212, 255'
      });
    }

    function spawnShootingStar(originX, originY) {
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

    heroSection.addEventListener(
      'pointermove',
      (e) => {
        const r = heroSection.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.active = true;
      },
      { passive: true }
    );

    heroSection.addEventListener('pointerleave', () => {
      pointer.active = false;
    });

    heroSection.addEventListener('click', (e) => {
      if (prefersReducedMotion) return;
      const r = heroSection.getBoundingClientRect();
      spawnShootingStar(e.clientX - r.left, e.clientY - r.top);
    });

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let lastTime = performance.now();
    let nextAutoMeteor = lastTime + 3600;

    function render(now) {
      if (!isHeroVisible) {
        rafId = null;
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Locate live Origami Glider coordinates
      let gliderCx = width * 0.5;
      let gliderNoseY = height * 0.48;
      let gliderTailY = height * 0.84;
      let wingHalf = 72;

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
        const distCursor = pointer.active
          ? Math.hypot(s.x - pointer.x, s.y - pointer.y)
          : 9999;
        const nearCursor = distCursor < 190;

        const alpha = nearCursor ? 0.98 : 0.28 + twinkle * 0.48;
        ctx.fillStyle = s.isGold
          ? `rgba(251, 191, 36, ${alpha.toFixed(3)})`
          : nearCursor
            ? `rgba(0, 212, 255, ${alpha.toFixed(3)})`
            : `rgba(226, 232, 240, ${alpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, nearCursor ? s.r * 1.5 : s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.glyph && (nearCursor || twinkle > 0.58)) {
          ctx.font = `${nearCursor ? 600 : 500} 11px Inter, sans-serif`;
          ctx.fillStyle = nearCursor
            ? 'rgba(0, 212, 255, 0.96)'
            : s.isGold
              ? 'rgba(251, 191, 36, 0.55)'
              : 'rgba(148, 163, 184, 0.42)';
          ctx.fillText(s.glyph, s.x + 6, s.y - 5);
        }
      }

      // 2) Draw Constellation Mesh Lines (Ambient + Interactive Mouse "Chòm Sao Điểm 10"!)
      ctx.lineWidth = 1;
      for (let i = 0; i < constellationStars.length; i++) {
        const a = constellationStars[i];
        const distA = pointer.active ? Math.hypot(a.x - pointer.x, a.y - pointer.y) : 9999;

        // Connect star to cursor when hovering!
        if (distA < 180) {
          const lineAlpha = (1 - distA / 180) * 0.6;
          ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();

          // Also link energized stars near the center to the Origami Glider's Nose!
          const distNose = Math.hypot(a.x - gliderCx, a.y - gliderNoseY);
          if (distNose < 260) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${((1 - distNose / 260) * 0.42).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(gliderCx, gliderNoseY);
            ctx.stroke();
          }
        }

        // Connect nearby stars into subtle academic constellations
        for (let j = i + 1; j < constellationStars.length; j++) {
          const b = constellationStars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > 130 || Math.abs(dy) > 130) continue;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            const boost = distA < 185 ? 0.48 : 0.14;
            const segAlpha = (1 - d / 130) * boost;
            ctx.strokeStyle =
              distA < 185
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
      if (pointer.active) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 3.2, 0, Math.PI * 2);
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

      // 4) Spawn & render streaming Stardust Wake
      if (!prefersReducedMotion && stardustTrail.length < 110) {
        spawnStardust(gliderCx, gliderTailY, wingHalf);
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

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !rafId && !prefersReducedMotion) {
              lastTime = performance.now();
              rafId = requestAnimationFrame(render);
            }
          });
        },
        { threshold: 0.02 }
      );
      heroObserver.observe(heroSection);
    }

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

    if (typeof window.Lenis !== 'undefined' && !prefersReducedMotion) {
      lenisInstance = new window.Lenis({
        duration: 1.12,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });

      if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    }

    const updateHeaderState = () => {
      if (!siteHeader) return;
      const threshold = Math.max(240, window.innerHeight * 0.72);
      siteHeader.classList.toggle('is-scrolled', window.scrollY > threshold);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState, { passive: true });

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
    let scrollSurgeY = 0;
    let scrollScale = 1;

    const applyHeroGliderTransform = () => {
      if (!heroGliderRig) return;
      heroGliderRig.style.transform = `translate3d(${pointerX.toFixed(1)}px, ${(scrollSurgeY + pointerY).toFixed(1)}px, 0) rotate(${bankDeg.toFixed(2)}deg) scale(${scrollScale.toFixed(3)})`;
    };

    if (heroSection && heroGliderRig && !prefersReducedMotion) {
      heroSection.addEventListener('pointermove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        pointerX = nx * 24;
        pointerY = ny * 12;
        bankDeg = nx * 5.5;
        applyHeroGliderTransform();
      });

      heroSection.addEventListener('pointerleave', () => {
        pointerX = 0;
        pointerY = 0;
        bankDeg = 0;
        applyHeroGliderTransform();
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
    const flightSection = document.getElementById('chuyen-dich');
    const flightPin = document.getElementById('paradigmPin');
    const horizGlider = document.getElementById('horizShip');
    const beforeLayer = document.getElementById('textBeforeLayer');
    const afterLayer = document.getElementById('textAfterLayer');
    const swarmConvoy = document.getElementById('swarmConvoy');
    const swarmUnits = gsap.utils.toArray('.swarm-unit');

    if (flightSection && flightPin && horizGlider && swarmConvoy && swarmUnits.length) {
      // 1. Initial coordinates
      gsap.set(horizGlider, { x: () => window.innerWidth * 1.04 });
      if (beforeLayer) beforeLayer.style.clipPath = 'inset(0 0% 0 0)';
      if (afterLayer) {
        afterLayer.style.clipPath = 'inset(0 0 0 100%)';
        gsap.set(afterLayer, { opacity: 1, x: 0 });
      }

      // Initial convoy position: staged directly behind the big glider
      const getInitialConvoyX = () => window.innerWidth * 1.18;
      gsap.set(swarmConvoy, { x: getInitialConvoyX });

      const getSlotSpacingY = () => {
        const sample = swarmUnits[0];
        const unitH = sample ? sample.offsetHeight : 68;
        const gap = Math.min(16, Math.max(8, window.innerHeight * 0.014));
        return unitH + gap;
      };

      // Initial 9-gliders stack (folded neatly into 1 lead unit)
      gsap.set(swarmUnits, {
        y: (i, el) => {
          const slot = Number(el.getAttribute('data-slot') || 0);
          return -slot * getSlotSpacingY();
        },
        rotation: (i, el) => Number(el.getAttribute('data-slot') || 0) * -6,
        scale: (i, el) => (Number(el.getAttribute('data-slot') || 0) === 0 ? 1 : 0.75),
        opacity: (i) => (i === 0 ? 1 : 0.2)
      });

      // Master continuous timeline: Big Plane wipes -> Seamlessly continues towing 9 Planes
      const tlFlight = gsap.timeline({
        scrollTrigger: {
          trigger: flightSection,
          pin: flightPin,
          start: 'top top',
          end: '+=420%',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Dynamic wing mask tracking as the giant glider sweeps past
            const rect = horizGlider.getBoundingClientRect();
            const vw = window.innerWidth || 1;
            const wingMaskX = rect.left + rect.width * 0.68;
            const revealLeftPct = Math.max(0, Math.min(100, (wingMaskX / vw) * 100));
            const eraseRightPct = 100 - revealLeftPct;

            if (beforeLayer) {
              beforeLayer.style.clipPath = `inset(0 ${eraseRightPct.toFixed(2)}% 0 0)`;
            }
            if (afterLayer) {
              afterLayer.style.clipPath = `inset(0 0 0 ${revealLeftPct.toFixed(2)}%)`;
            }

            // Subtle aerodynamic float drift
            if (!prefersReducedMotion) {
              const floatY = Math.sin(self.progress * Math.PI * 4) * 6;
              horizGlider.style.marginTop = `${floatY.toFixed(1)}px`;
            }
          }
        }
      });

      // Phase 1: Giant Glider sweeps across the entire screen (0.00 to 0.58)
      tlFlight.to(
        horizGlider,
        {
          x: () => -(horizGlider.offsetWidth + window.innerWidth * 0.45),
          duration: 0.58,
          ease: 'none'
        },
        0
      );

      // Transition: Paradigm text dissolves as the giant glider completes its sweep (0.36 to 0.48)
      if (afterLayer) {
        tlFlight.to(
          afterLayer,
          {
            opacity: 0,
            x: () => -window.innerWidth * 0.08,
            duration: 0.12,
            ease: 'power2.inOut'
          },
          0.36
        );
      }

      // Phase 2: Trailing fleet of 9 Origami Gliders smoothly sweeps in behind the lead glider (0.26 to 1.00)
      tlFlight.to(
        swarmConvoy,
        {
          x: () => {
            const totalW = swarmConvoy.scrollWidth;
            return -Math.max(window.innerWidth * 0.38, totalW - window.innerWidth * 0.86);
          },
          duration: 0.74,
          ease: 'none'
        },
        0.26
      );

      // Escort Deployment: 1 lead glider deploys into 9 delta-formation gliders (0.32 to 0.52)
      tlFlight.to(
        swarmUnits,
        {
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 0.20,
          stagger: 0.015,
          ease: 'power2.out'
        },
        0.32
      );
    }

    // -----------------------------------------------------------------------
    // ACT IV: Vertical Top-to-Bottom Origami Glider Dive & Stage Unlock
    // -----------------------------------------------------------------------
    const voyageArena = document.getElementById('voyageArena');
    const verticalCraft = document.getElementById('verticalCraft');
    const voyageWake = document.getElementById('voyageWake');
    const voyageItems = gsap.utils.toArray('.v-item');

    if (voyageArena && verticalCraft) {
      ScrollTrigger.create({
        trigger: voyageArena,
        start: 'top 62%',
        end: 'bottom 58%',
        scrub: 0.55,
        onUpdate: (self) => {
          const p = self.progress;
          const arenaH = voyageArena.offsetHeight;
          const craftH = verticalCraft.offsetHeight || 200;
          const maxTravel = Math.max(0, arenaH - craftH);
          const currentY = p * maxTravel;
          const bankAngle = prefersReducedMotion ? 0 : Math.sin(p * Math.PI * 5) * 3.4;

          verticalCraft.style.top = `${currentY.toFixed(1)}px`;
          verticalCraft.style.transform = `translate(-50%, 0) rotate(${bankAngle.toFixed(2)}deg)`;

          if (voyageWake) {
            voyageWake.style.height = `${Math.min(arenaH, currentY + craftH * 0.55).toFixed(1)}px`;
          }

          const noseScreenY =
            verticalCraft.getBoundingClientRect().top + craftH * 0.72;

          voyageItems.forEach((item) => {
            const itemRect = item.getBoundingClientRect();
            const unlocked = noseScreenY >= itemRect.top + 40;
            item.classList.toggle('is-unlocked', unlocked);
          });
        }
      });
    }

    // -----------------------------------------------------------------------
    // ACT V: Night Observatory Parallax + Horizon Origami Squadron Flyby
    // -----------------------------------------------------------------------
    const impactSection = document.getElementById('tac-dong');
    const impactImg = document.getElementById('impactParallaxImg');
    const isoGliderRig = document.getElementById('isoGliderRig');
    const isoWingmanHigh = document.getElementById('isoWingmanHigh');
    const isoWingmanLow = document.getElementById('isoWingmanLow');

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
          xPercent: 46,
          yPercent: -26,
          scale: 0.94
        },
        {
          xPercent: -42,
          yPercent: 26,
          scale: 1.06,
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

        // Continuous Phase 1: Big Glider Sweep (p: 0 to 0.58)
        const pBig = clamp01(p / 0.58);
        const startX = vw * 1.04;
        const endX = -(horizGlider.offsetWidth + vw * 0.45);
        const curX = startX + (endX - startX) * pBig;
        horizGlider.style.transform = `translate3d(${curX.toFixed(1)}px, 0, 0)`;

        const sRect = horizGlider.getBoundingClientRect();
        const pct = clamp01((sRect.left + sRect.width * 0.68) / vw) * 100;
        if (beforeLayer) {
          beforeLayer.style.clipPath = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;
        }
        if (afterLayer) {
          afterLayer.style.clipPath = `inset(0 0 0 ${pct.toFixed(2)}%)`;
          if (p > 0.36) {
            const pFade = clamp01((p - 0.36) / 0.12);
            afterLayer.style.opacity = `${(1 - pFade).toFixed(2)}`;
            afterLayer.style.transform = `translate3d(${(-pFade * 60).toFixed(1)}px, 0, 0)`;
          } else {
            afterLayer.style.opacity = '1';
            afterLayer.style.transform = 'translate3d(0, 0, 0)';
          }
        }

        // Continuous Phase 2: Trailing 9-Glider Convoy (p: 0.26 to 1.0)
        if (swarmConvoy) {
          const pSwarm = clamp01((p - 0.26) / 0.74);
          const startSwarmX = vw * 1.18;
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

    const counters = document.querySelectorAll('.count-up[data-target]');
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
          meta: '30 câu • 45 phút rèn chắc nền tảng, nắm trọn 7–8 điểm.'
        },
        {
          title: 'Tin học 12: Thuật toán & CSDL',
          meta: '40 câu • 50 phút thực chiến trắc nghiệm Python & SQL.'
        },
        {
          title: 'Toán & Tin 12: Vận dụng cao',
          meta: '45 câu • 90 phút thử sức đề phân loại ĐGNL & học sinh giỏi.'
        }
      ],
      lop11: [
        {
          title: 'Toán 11: Lượng giác & Dãy số',
          meta: '30 câu • 45 phút củng cố kiến thức trọng tâm học kỳ.'
        },
        {
          title: 'Tin học 11: Mảng & CSDL quan hệ',
          meta: '36 câu • 50 phút trắc nghiệm cú pháp & thiết kế dữ liệu.'
        },
        {
          title: 'Toán 11: Đạo hàm & Hình không gian',
          meta: '40 câu • 75 phút rèn tư duy phân loại và mẹo Casio nhanh.'
        }
      ],
      lop10: [
        {
          title: 'Toán 10: Mệnh đề & Hàm số',
          meta: '30 câu • 45 phút nắm chắc kiến thức căn bản lớp 10.'
        },
        {
          title: 'Tin học 10: Lập trình Python',
          meta: '35 câu • 45 phút rèn kỹ năng đọc luồng mã lệnh căn bản.'
        },
        {
          title: 'Toán & Tin 10: Tọa độ Oxy & Thuật toán',
          meta: '40 câu • 60 phút thử sức bồi dưỡng học sinh giỏi.'
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
    const tableBody = document.getElementById('champTableBody');
    const toggleBtn = document.getElementById('toggleFullBoardBtn');
    const toggleLabel = document.getElementById('toggleBoardLabel');
    const boardExpand = document.getElementById('champBoardExpand');

    if (!tabs.length || !podium) return;

    const BOARDS = {
      all: [
        { avatar: 'MK', name: 'Nguyễn Minh Khôi', school: 'THPT Chuyên KHTN', streak: '14 đề tuần này', score: '9.85đ', scale: 0.985, gems: '+240 Ngọc' },
        { avatar: 'KL', name: 'Trần Khánh Linh', school: 'THPT Lê Quý Đôn', streak: '12 đề tuần này', score: '9.60đ', scale: 0.96, gems: '+195 Ngọc' },
        { avatar: 'HN', name: 'Lê Hoàng Nam', school: 'THPT Phan Châu Trinh', streak: '11 đề tuần này', score: '9.50đ', scale: 0.95, gems: '+170 Ngọc' }
      ],
      math: [
        { avatar: 'MK', name: 'Nguyễn Minh Khôi', school: 'Chuyên Toán KHTN', streak: '10 đề Toán VDC', score: '9.90đ', scale: 0.99, gems: '+180 Ngọc' },
        { avatar: 'BA', name: 'Phạm Bảo Anh', school: 'THPT Chu Văn An', streak: '9 đề Toán 2025', score: '9.65đ', scale: 0.965, gems: '+155 Ngọc' },
        { avatar: 'ĐP', name: 'Vũ Đức Phúc', school: 'THPT Kim Liên', streak: '8 đề Toán 11–12', score: '9.45đ', scale: 0.945, gems: '+130 Ngọc' }
      ],
      cs: [
        { avatar: 'KL', name: 'Trần Khánh Linh', school: 'Đội tuyển Tin LQĐ', streak: '11 đề Python & SQL', score: '9.80đ', scale: 0.98, gems: '+175 Ngọc' },
        { avatar: 'HN', name: 'Lê Hoàng Nam', school: 'THPT Phan Châu Trinh', streak: '10 đề Thuật toán', score: '9.60đ', scale: 0.96, gems: '+150 Ngọc' },
        { avatar: 'QM', name: 'Đặng Quang Minh', school: 'THPT Gia Định', streak: '9 đề CS & ICT', score: '9.40đ', scale: 0.94, gems: '+125 Ngọc' }
      ]
    };

    const IN_PAGE_TABLE_DATA = {
      all: [
        { rank: 4, name: 'Phạm Bảo Anh', school: 'Lớp 12A2 • THPT Chu Văn An', streak: 10, score: '9.40', gems: '+140 Ngọc' },
        { rank: 5, name: 'Đặng Quang Minh', school: 'Lớp 12CTin • THPT Gia Định', streak: 9, score: '9.35', gems: '+125 Ngọc' },
        { rank: 6, name: 'Vũ Đức Phúc', school: 'Lớp 11T2 • THPT Kim Liên', streak: 9, score: '9.25', gems: '+110 Ngọc' },
        { rank: 7, name: 'Hoàng Thùy Dương', school: 'Lớp 12A • THPT Chuyên Sư Phạm', streak: 8, score: '9.15', gems: '+95 Ngọc' },
        { rank: 8, name: 'Bùi Tuấn Kiệt', school: 'Lớp 12Tin • THPT Chuyên Lương Thế Vinh', streak: 8, score: '9.05', gems: '+85 Ngọc' },
        { rank: 9, name: 'Nguyễn Phương Thảo', school: 'Lớp 11A1 • THPT Việt Đức', streak: 7, score: '8.95', gems: '+70 Ngọc' },
        { rank: 10, name: 'Trần Quốc Đạt', school: 'Lớp 12A3 • THPT Thăng Long', streak: 7, score: '8.85', gems: '+60 Ngọc' }
      ],
      math: [
        { rank: 4, name: 'Nguyễn Ngọc Anh', school: 'Lớp 12A • THPT Chuyên Hà Nội - Amsterdam', streak: 8, score: '9.30', gems: '+115 Ngọc' },
        { rank: 5, name: 'Lê Gia Huy', school: 'Lớp 12T1 • THPT Chuyên Lê Hồng Phong', streak: 7, score: '9.20', gems: '+100 Ngọc' },
        { rank: 6, name: 'Trần Tuấn Dũng', school: 'Lớp 12A1 • THPT Yên Hòa', streak: 7, score: '9.10', gems: '+90 Ngọc' },
        { rank: 7, name: 'Hoàng Minh Châu', school: 'Lớp 11A1 • THPT Chuyên Lam Sơn', streak: 6, score: '9.00', gems: '+80 Ngọc' },
        { rank: 8, name: 'Đỗ Tiến Đạt', school: 'Lớp 12A4 • THPT Cầu Giấy', streak: 6, score: '8.90', gems: '+70 Ngọc' },
        { rank: 9, name: 'Vũ Thảo Vy', school: 'Lớp 12T2 • THPT Chuyên Bắc Ninh', streak: 6, score: '8.80', gems: '+60 Ngọc' },
        { rank: 10, name: 'Phan Nhật Minh', school: 'Lớp 11A2 • THPT Chuyên Phan Bội Châu', streak: 5, score: '8.75', gems: '+50 Ngọc' }
      ],
      cs: [
        { rank: 4, name: 'Bùi Tuấn Kiệt', school: 'Lớp 12Tin • THPT Chuyên LTV', streak: 8, score: '9.25', gems: '+110 Ngọc' },
        { rank: 5, name: 'Nguyễn Quốc Việt', school: 'Lớp 11Tin • THPT Chuyên Thái Bình', streak: 8, score: '9.15', gems: '+95 Ngọc' },
        { rank: 6, name: 'Lâm Hải Đăng', school: 'Lớp 12Tin • THPT Chuyên Nguyễn Du', streak: 7, score: '9.05', gems: '+85 Ngọc' },
        { rank: 7, name: 'Trần Văn Hưng', school: 'Lớp 12A • THPT Chuyên KHTN', streak: 7, score: '8.95', gems: '+75 Ngọc' },
        { rank: 8, name: 'Đinh Hồng Phúc', school: 'Lớp 11Tin • THPT Chuyên Hạ Long', streak: 6, score: '8.85', gems: '+65 Ngọc' },
        { rank: 9, name: 'Lý Gia Bảo', school: 'Lớp 12Tin • THPT Năng Khiếu ĐHQG', streak: 6, score: '8.75', gems: '+55 Ngọc' },
        { rank: 10, name: 'Vũ Đức Trọng', school: 'Lớp 11A • THPT Nguyễn Huệ', streak: 5, score: '8.70', gems: '+50 Ngọc' }
      ]
    };

    let timer = null;

    const renderInPageTable = (key) => {
      if (!tableBody) return;
      const rows = IN_PAGE_TABLE_DATA[key] || IN_PAGE_TABLE_DATA.all;
      tableBody.innerHTML = '';

      rows.forEach(item => {
        const tr = document.createElement('tr');
        const initials = item.name.split(' ').map(w => w[0]).slice(-2).join('');

        tr.innerHTML = `
          <td>
            <span class="champ-rank-badge">#${item.rank < 10 ? '0' + item.rank : item.rank}</span>
          </td>
          <td>
            <div class="champ-user-cell">
              <div class="champ-user-mini-av">${initials}</div>
              <div>
                <strong class="champ-user-name">${item.name}</strong>
                <span class="champ-user-school">${item.school}</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; color: var(--muted); font-weight: 600;">${item.streak} đề</td>
          <td style="text-align: right;">
            <strong class="champ-score-val">${item.score}</strong> <span style="font-size: 11px; color: var(--muted);">/ 10đ</span>
          </td>
          <td style="text-align: right;">
            <span class="champ-gems-pill">
              <svg class="ic-inline" style="width: 12px; height: 12px;"><use href="#iconGem" /></svg>
              <span>${item.gems}</span>
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    };

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

        // Also update the in-page table
        renderInPageTable(key);
      });
    });

    // Toggle In-Page Table Collapse/Expand
    if (toggleBtn && boardExpand) {
      toggleBtn.addEventListener('click', () => {
        const isCollapsed = boardExpand.classList.toggle('is-collapsed');
        if (toggleLabel) {
          toggleLabel.textContent = isCollapsed
            ? 'Xem đầy đủ Top 10 Cao Thủ Tuần ▼'
            : 'Thu gọn Bảng xếp hạng ▲';
        }
      });
    }

    // Initial table render
    renderInPageTable('all');
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

    applyTheme(currentTheme, false);

    document.querySelectorAll('[data-toggle-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
      });
    });
  }

  function initInteractiveMiniDemo() {
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
          'Cho hàm số <strong>f(x) = x³ − 3x + 2</strong> xác định trên ℝ. Xét tính <strong>Đúng / Sai</strong> của các mệnh đề sau:',
        code: null,
        items: [
          {
            key: 'a',
            text: 'Đạo hàm của hàm số đã cho là f\'(x) = 3x² − 3.',
            ans: true,
            explain: 'Đúng — f\'(x) = (x³ − 3x + 2)\' = 3x² − 3.'
          },
          {
            key: 'b',
            text: 'Hàm số đồng biến trên khoảng (−1; 1).',
            ans: false,
            explain: 'Sai — f\'(x) < 0 trên (−1; 1) ⇒ Hàm số nghịch biến.'
          },
          {
            key: 'c',
            text: 'Giá trị cực đại của hàm số bằng 4 tại x = −1.',
            ans: true,
            explain: 'Đúng — Đổi dấu (+) sang (−) tại x = −1 ⇒ Cực đại y = f(−1) = 4.'
          },
          {
            key: 'd',
            text: 'Tích phân từ 0 đến 1 của f\'(x)dx có giá trị bằng 0.',
            ans: false,
            explain: 'Sai — Tích phân = f(1) − f(0) = 0 − 2 = −2.'
          }
        ],
        tipHtml:
          '<strong>Mẹo Casio:</strong> Dùng phím <strong>d/dx</strong> thử nhanh f\'(x) trong 3 giây để loại trừ đáp án Sai.'
      },
      cs: {
        stemHtml:
          'Cho đoạn mã <strong>Python</strong> sau. Xét tính <strong>Đúng / Sai</strong> của từng phát biểu:',
        code: `def tinh_tong(arr):\n    s = 0\n    for x in arr:\n        if x % 2 == 0:\n            s += x\n    return s\n\nprint(tinh_tong([2, 5, 8, 3, 6]))`,
        items: [
          {
            key: 'a',
            text: 'Hàm tinh_tong(arr) tính tổng các phần tử có giá trị chẵn trong mảng.',
            ans: true,
            explain: 'Đúng — Điều kiện x % 2 == 0 lọc và cộng dồn các số chẵn.'
          },
          {
            key: 'b',
            text: 'Kết quả in ra màn hình của lệnh print(...) ở dòng cuối là 24.',
            ans: false,
            explain: 'Sai — Chỉ cộng các số chẵn 2 + 8 + 6 = 16 (24 là tổng cả mảng).'
          },
          {
            key: 'c',
            text: 'Độ phức tạp thời gian của hàm với danh sách gồm n phần tử là O(n).',
            ans: true,
            explain: 'Đúng — Duyệt vòng lặp for 1 lần qua n phần tử.'
          },
          {
            key: 'd',
            text: 'Nếu truyền vào danh sách toàn số lẻ [1, 3, 5] thì chương trình báo lỗi.',
            ans: false,
            explain: 'Sai — Biến s khởi tạo bằng 0 nên hàm trả về 0 an toàn.'
          }
        ],
        tipHtml:
          '<strong>Góc nhìn AI:</strong> Luôn kiểm tra <strong>giá trị khởi tạo (s = 0)</strong> và trường hợp biên (mảng rỗng hoặc toàn số lẻ).'
      }
    };

    const SCALE_POINTS = [0, 0.1, 0.25, 0.5, 1.0];
    let activeSubj = 'math';
    let userChoices = [null, null, null, null];
    let isGraded = false;

    const renderQuestion = () => {
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

        const textDiv = document.createElement('div');
        textDiv.className = 'demo-row__text';
        textDiv.innerHTML = `<strong>${item.key})</strong> ${item.text}`;

        const pills = document.createElement('div');
        pills.className = 'tf-pills';

        const btnTrue = document.createElement('button');
        btnTrue.type = 'button';
        btnTrue.className = `tf-btn${userChoices[idx] === true ? ' is-selected' : ''}`;
        btnTrue.textContent = 'Đúng';
        btnTrue.addEventListener('click', () => {
          userChoices[idx] = true;
          isGraded = false;
          resetAiPanelOnly();
          renderQuestion();
        });

        const btnFalse = document.createElement('button');
        btnFalse.type = 'button';
        btnFalse.className = `tf-btn${userChoices[idx] === false ? ' is-selected' : ''}`;
        btnFalse.textContent = 'Sai';
        btnFalse.addEventListener('click', () => {
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
        demoScorePill.textContent = `Đúng ${rightCount}/4 ý`;
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
          rightCount === 4 ? '+2 Ngọc Tri Thức (Tuyệt đối!)' : `Đúng ${rightCount}/4 mệnh đề`;
        demoGemBonus.classList.remove('has-bounce');
        void demoGemBonus.offsetWidth;
        demoGemBonus.classList.add('has-bounce');
      }

      if (demoExplainList) {
        demoExplainList.innerHTML = q.items
          .map((item, idx) => {
            const ok = userChoices[idx] === item.ans;
            const mark = ok ? '✓' : '✕';
            return `<div class="demo-explain-item"><strong>Ý ${item.key} (${mark}):</strong> ${item.explain}</div>`;
          })
          .join('');
      }

      if (demoTipBox) {
        demoTipBox.innerHTML = q.tipHtml;
      }

      if (demoSubmitBtn) {
        demoSubmitBtn.disabled = false;
        demoSubmitBtn.innerHTML = 'Chấm điểm &amp; Hỏi Gia Sư AI ⚡';
      }
      if (demoCardMain) demoCardMain.classList.remove('is-scanning');
      isScanningInProgress = false;
    };

    const gradeCurrentQuestion = () => {
      if (isScanningInProgress) return;
      const q = QUESTIONS[activeSubj];
      if (!q) return;

      if (userChoices.some((v) => v === null)) {
        showAppToast('Bạn hãy chọn Đúng hoặc Sai cho đủ cả 4 ý a, b, c, d (hoặc bấm "Điền nhanh thử nghiệm") nhé!');
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

      // Trigger Cybernetic AI Scan Sequence
      isScanningInProgress = true;
      if (demoSubmitBtn) {
        demoSubmitBtn.disabled = true;
        demoSubmitBtn.innerHTML = '<span class="ai-pulse-dot" style="display:inline-block;margin-right:6px"></span> Đang quét ma trận đề...';
      }
      if (demoCardMain) {
        demoCardMain.classList.remove('is-scanning');
        void demoCardMain.offsetWidth;
        demoCardMain.classList.add('is-scanning');
      }
      if (demoAiIdle) demoAiIdle.hidden = true;
      if (demoAiResult) demoAiResult.hidden = true;
      if (demoAiScanning) demoAiScanning.hidden = false;

      if (scanStep1) {
        scanStep1.className = 'ai-scan-step is-active';
      }
      if (scanStep2) {
        scanStep2.className = 'ai-scan-step';
      }
      if (scanStep3) {
        scanStep3.className = 'ai-scan-step';
      }

      setTimeout(() => {
        if (scanStep1) scanStep1.className = 'ai-scan-step is-done';
        if (scanStep2) scanStep2.className = 'ai-scan-step is-active';
      }, 260);

      setTimeout(() => {
        if (scanStep2) scanStep2.className = 'ai-scan-step is-done';
        if (scanStep3) scanStep3.className = 'ai-scan-step is-active';
      }, 540);

      setTimeout(() => {
        if (scanStep3) scanStep3.className = 'ai-scan-step is-done';
      }, 760);

      setTimeout(() => {
        finalizeGrading(q, rightCount, score);
      }, 820);
    };

    demoTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const subj = tab.getAttribute('data-demo-subj');
        if (!subj || !QUESTIONS[subj]) return;
        activeSubj = subj;
        userChoices = [null, null, null, null];
        isGraded = false;
        demoTabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        resetAiPanelOnly();
        renderQuestion();
      });
    });

    demoSubmitBtn.addEventListener('click', gradeCurrentQuestion);

    if (demoQuickFillBtn) {
      demoQuickFillBtn.addEventListener('click', () => {
        const q = QUESTIONS[activeSubj];
        if (!q) return;
        userChoices = q.items.map((item) => item.ans);
        gradeCurrentQuestion();
      });
    }

    if (demoResetBtn) {
      demoResetBtn.addEventListener('click', () => {
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
    if (!backBtn) return;

    const onScroll = () => {
      backBtn.classList.toggle('is-visible', window.scrollY > 560);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    backBtn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function initImpactIsoInteractions() {
    const impactSky = document.getElementById('tac-dong');
    const ctaSquare = impactSky ? impactSky.querySelector('.bento-cta-square') : null;
    const stats = impactSky ? impactSky.querySelectorAll('.impact-stat') : [];
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

    let rafId = false;
    let mx = 0;
    let my = 0;

    impactSky.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (rafId) return;
      rafId = true;

      requestAnimationFrame(() => {
        rafId = false;
        const r = impactSky.getBoundingClientRect();
        const nx = (mx - r.left) / (r.width || 1) - 0.5;
        const ny = (my - r.top) / (r.height || 1) - 0.5;
        const rotY = nx * 14;
        const rotX = -ny * 10;
        const shiftX = nx * 28;
        const shiftY = ny * 18;
        isoSvg.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      });
    });

    impactSky.addEventListener('pointerleave', () => {
      isoSvg.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
    });
  }

  function initTechCardInteractions() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.v-card, .tilt-card').forEach((card) => {
      let rafPending = false;
      let lastX = 0;
      let lastY = 0;

      const getLiftY = () => {
        if (window.innerWidth >= 960 && card.classList.contains('podium-card--1')) return -16;
        if (window.innerWidth >= 920 && card.classList.contains('c-card--featured')) return -12;
        return -6;
      };

      card.addEventListener('pointerenter', () => {
        card.classList.add('is-tilting');
      });

      card.addEventListener('pointermove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (rafPending) return;
        rafPending = true;

        requestAnimationFrame(() => {
          rafPending = false;
          if (!card.classList.contains('is-tilting')) return;
          const r = card.getBoundingClientRect();
          const px = Math.max(0, Math.min(1, (lastX - r.left) / (r.width || 1)));
          const py = Math.max(0, Math.min(1, (lastY - r.top) / (r.height || 1)));

          const rotY = (px - 0.5) * 6.5;
          const rotX = (0.5 - py) * 5.5;
          const liftY = getLiftY();

          card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
          card.style.transform = `perspective(1050px) translate3d(0, ${liftY}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        });
      });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  function initMagneticButtons() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }


  // =========================================================================
  // 17. INTERACTIVE FULL LEADERBOARD MODAL (TOP 10 TELEMETRY TABLE)
  // =========================================================================
  function initLeaderboardModal() {
    const modal = document.getElementById('leaderboardModal');
    const backdrop = document.getElementById('leaderboardModalBackdrop');
    const closeBtn = document.getElementById('leaderboardModalClose');
    const openBtn = null;
    const tableBody = document.getElementById('leaderboardTableBody');
    const tabs = document.querySelectorAll('#modalBoardTabs .lb-tab');

    if (!modal || !tableBody) return;

    const LEADERBOARD_DATA = {
      all: [
        { rank: 1, name: 'Nguyễn Minh Khôi', school: 'Lớp 12A1 • THPT Chuyên KHTN', streak: 14, score: '9.85', gems: '+240' },
        { rank: 2, name: 'Trần Khánh Linh', school: 'Lớp 12T1 • THPT Lê Quý Đôn', streak: 12, score: '9.60', gems: '+195' },
        { rank: 3, name: 'Lê Hoàng Nam', school: 'Lớp 11Tin • THPT Phan Châu Trinh', streak: 11, score: '9.50', gems: '+170' },
        { rank: 4, name: 'Phạm Bảo Anh', school: 'Lớp 12A2 • THPT Chu Văn An', streak: 10, score: '9.40', gems: '+140' },
        { rank: 5, name: 'Đặng Quang Minh', school: 'Lớp 12CTin • THPT Gia Định', streak: 9, score: '9.35', gems: '+125' },
        { rank: 6, name: 'Vũ Đức Phúc', school: 'Lớp 11T2 • THPT Kim Liên', streak: 9, score: '9.25', gems: '+110' },
        { rank: 7, name: 'Hoàng Thùy Dương', school: 'Lớp 12A • THPT Chuyên Sư Phạm', streak: 8, score: '9.15', gems: '+95' },
        { rank: 8, name: 'Bùi Tuấn Kiệt', school: 'Lớp 12Tin • THPT Chuyên Lương Thế Vinh', streak: 8, score: '9.05', gems: '+85' },
        { rank: 9, name: 'Nguyễn Phương Thảo', school: 'Lớp 11A1 • THPT Việt Đức', streak: 7, score: '8.95', gems: '+70' },
        { rank: 10, name: 'Trần Quốc Đạt', school: 'Lớp 12A3 • THPT Thăng Long', streak: 7, score: '8.85', gems: '+60' }
      ],
      math: [
        { rank: 1, name: 'Nguyễn Minh Khôi', school: 'Lớp 12A1 • Chuyên Toán KHTN', streak: 10, score: '9.90', gems: '+180' },
        { rank: 2, name: 'Phạm Bảo Anh', school: 'Lớp 12A2 • THPT Chu Văn An', streak: 9, score: '9.65', gems: '+155' },
        { rank: 3, name: 'Vũ Đức Phúc', school: 'Lớp 11T2 • THPT Kim Liên', streak: 8, score: '9.45', gems: '+130' },
        { rank: 4, name: 'Nguyễn Ngọc Anh', school: 'Lớp 12A • THPT Chuyên Hà Nội - Amsterdam', streak: 8, score: '9.30', gems: '+115' },
        { rank: 5, name: 'Lê Gia Huy', school: 'Lớp 12T1 • THPT Chuyên Lê Hồng Phong', streak: 7, score: '9.20', gems: '+100' },
        { rank: 6, name: 'Trần Tuấn Dũng', school: 'Lớp 12A1 • THPT Yên Hòa', streak: 7, score: '9.10', gems: '+90' },
        { rank: 7, name: 'Hoàng Minh Châu', school: 'Lớp 11A1 • THPT Chuyên Lam Sơn', streak: 6, score: '9.00', gems: '+80' },
        { rank: 8, name: 'Đỗ Tiến Đạt', school: 'Lớp 12A4 • THPT Cầu Giấy', streak: 6, score: '8.90', gems: '+70' },
        { rank: 9, name: 'Vũ Thảo Vy', school: 'Lớp 12T2 • THPT Chuyên Bắc Ninh', streak: 6, score: '8.80', gems: '+60' },
        { rank: 10, name: 'Phan Nhật Minh', school: 'Lớp 11A2 • THPT Chuyên Phan Bội Châu', streak: 5, score: '8.75', gems: '+50' }
      ],
      cs: [
        { rank: 1, name: 'Trần Khánh Linh', school: 'Lớp 12T1 • Đội tuyển Tin LQĐ', streak: 11, score: '9.80', gems: '+175' },
        { rank: 2, name: 'Lê Hoàng Nam', school: 'Lớp 11Tin • THPT Phan Châu Trinh', streak: 10, score: '9.60', gems: '+150' },
        { rank: 3, name: 'Đặng Quang Minh', school: 'Lớp 12CTin • THPT Gia Định', streak: 9, score: '9.40', gems: '+125' },
        { rank: 4, name: 'Bùi Tuấn Kiệt', school: 'Lớp 12Tin • THPT Chuyên LTV', streak: 8, score: '9.25', gems: '+110' },
        { rank: 5, name: 'Nguyễn Quốc Việt', school: 'Lớp 11Tin • THPT Chuyên Thái Bình', streak: 8, score: '9.15', gems: '+95' },
        { rank: 6, name: 'Lâm Hải Đăng', school: 'Lớp 12Tin • THPT Chuyên Nguyễn Du', streak: 7, score: '9.05', gems: '+85' },
        { rank: 7, name: 'Trần Văn Hưng', school: 'Lớp 12A • THPT Chuyên KHTN', streak: 7, score: '8.95', gems: '+75' },
        { rank: 8, name: 'Đinh Hồng Phúc', school: 'Lớp 11Tin • THPT Chuyên Hạ Long', streak: 6, score: '8.85', gems: '+65' },
        { rank: 9, name: 'Lý Gia Bảo', school: 'Lớp 12Tin • THPT Năng Khiếu ĐHQG', streak: 6, score: '8.75', gems: '+55' },
        { rank: 10, name: 'Vũ Đức Trọng', school: 'Lớp 11A • THPT Nguyễn Huệ', streak: 5, score: '8.70', gems: '+50' }
      ]
    };

    let activeBoard = 'all';

    const renderTable = (boardKey) => {
      const rows = LEADERBOARD_DATA[boardKey] || LEADERBOARD_DATA.all;
      tableBody.innerHTML = '';

      rows.forEach(item => {
        const tr = document.createElement('tr');

        let badgeClass = 'lb-rank--norm';
        if (item.rank === 1) badgeClass = 'lb-rank--1';
        else if (item.rank === 2) badgeClass = 'lb-rank--2';
        else if (item.rank === 3) badgeClass = 'lb-rank--3';

        const initials = item.name.split(' ').map(w => w[0]).slice(-2).join('');

        tr.innerHTML = `
          <td>
            <span class="lb-rank-badge ${badgeClass}">${item.rank}</span>
          </td>
          <td>
            <div class="lb-user-cell">
              <div class="lb-user-avatar">${initials}</div>
              <div>
                <strong class="lb-user-name">${item.name}</strong>
                <span class="lb-user-school">${item.school}</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; color: var(--muted); font-weight: 600;">${item.streak} đề</td>
          <td style="text-align: right;">
            <strong class="lb-score-val">${item.score}</strong> <span style="font-size: 11px; color: var(--muted);">/ 10đ</span>
          </td>
          <td style="text-align: right;">
            <span class="lb-gems-pill">
              <svg class="ic-inline" style="width: 12px; height: 12px;"><use href="#iconGem" /></svg>
              <span>${item.gems}</span>
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    };

    const openModal = (e) => {
      if (e) e.preventDefault();
      renderTable(activeBoard);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        activeBoard = tab.getAttribute('data-mboard') || 'all';
        renderTable(activeBoard);
      });
    });

    const modalLuyenDeBtn = document.getElementById('modalLuyenDeBtn');
    if (modalLuyenDeBtn) {
      modalLuyenDeBtn.addEventListener('click', () => {
        closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  // =========================================================================
  // 18. INTERACTIVE NEWS CATEGORY FILTERS & SPOTLIGHT GLOW
  // =========================================================================
  function initNewsFiltersAndSpotlight() {
    // CargoKite Cursor Spotlight Glow Tracking on Cards
    document.querySelectorAll('.news-card.ck-spotlight').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // CargoKite News Category Filter Pills
    const filterBtns = document.querySelectorAll('.news-filter-btn[data-filter]');
    const newsCards = document.querySelectorAll('.news-card[data-cat]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.getAttribute('data-filter');

        newsCards.forEach(card => {
          const cat = card.getAttribute('data-cat');
          if (f === 'all' || cat === f) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // =========================================================================
  // BOOTSTRAP ALL MODULES (V7 HOMEPAGE: INCLUDES NEWS & LEADERBOARD MODAL)
  // =========================================================================
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
  initLeaderboardModal();
  initNewsFiltersAndSpotlight();
  initFaqAccordion();
  initContactSection();
  initBackToTop();
  initSubpageRoutePreview();
  initImpactIsoInteractions();
  initTechCardInteractions();
  initMagneticButtons();
})();
