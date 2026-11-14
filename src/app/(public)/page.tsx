'use client';

import * as React from 'react';
import Script from 'next/script';
import { HOMEPAGE_FINAL_HTML } from '@/components/features/home/homepage-final-html';
import { HomePageSkeletonOverlay } from '@/components/skeletons/home-skeleton';

// Completely isolate the 82KB pure HTML/CSS/JS homepage DOM from React re-renders
const StaticHomepageRoot = React.memo(
  function StaticHomepageRoot() {
    return (
      <div
        id="schoolify-homepage-root"
        dangerouslySetInnerHTML={{ __html: HOMEPAGE_FINAL_HTML }}
      />
    );
  },
  () => true
);

export default function HomePage() {
  // Skeleton phủ trang cho tới khi CSS + GSAP/Lenis + app.js nạp xong và hiệu ứng được khởi tạo.
  const [skeletonPhase, setSkeletonPhase] = React.useState<'show' | 'leaving' | 'gone'>('show');

  React.useEffect(() => {
    if (skeletonPhase !== 'leaving') return;
    const t = setTimeout(() => setSkeletonPhase('gone'), 520);
    return () => clearTimeout(t);
  }, [skeletonPhase]);

  React.useEffect(() => {
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    const revealHomepage = () => {
      if (revealTimer) return;
      // Chờ vài khung hình để hiệu ứng khởi tạo xong phía dưới rồi mới mờ skeleton
      revealTimer = setTimeout(() => setSkeletonPhase((p) => (p === 'show' ? 'leaving' : p)), 220);
    };
    // Failsafe: không bao giờ để skeleton kẹt quá 6s (mạng chậm / script lỗi)
    const failsafe = setTimeout(revealHomepage, 6000);
    (window as any).__schoolifyRevealHomepage = revealHomepage;
    return () => {
      clearTimeout(failsafe);
      if (revealTimer) clearTimeout(revealTimer);
      delete (window as any).__schoolifyRevealHomepage;
    };
  }, []);

  React.useEffect(() => {
    let isCached = false;
    try {
      isCached =
        (typeof window !== 'undefined' && Boolean((window as any).__schoolifyPreloaderShown)) ||
        sessionStorage.getItem('schoolify_preloader_seen') === '1';
    } catch (e) {
      isCached = false;
    }

    if (!isCached) {
      document.body.classList.add('is-loading');
    } else {
      document.body.classList.remove('is-loading');
      document.documentElement.classList.add('preloader-cached');
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('is-done');
        preloader.style.display = 'none';
      }
    }

    let cancelled = false;
    let pollInterval: any = null;

    const tryInit = () => {
      if (cancelled) return;
      if (typeof window !== 'undefined' && (window as any).__initSchoolifyHomepage) {
        (window as any).__initSchoolifyHomepage();
        (window as any).__schoolifyRevealHomepage?.();
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    // Try immediately on mount
    tryInit();

    // Poll until script loaded and initialized (up to 2.5s)
    let attempts = 0;
    pollInterval = setInterval(() => {
      attempts++;
      if (attempts > 50 || cancelled) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }
      tryInit();
    }, 50);

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      document.body.classList.remove('is-loading');
      if (typeof window !== 'undefined' && (window as any).__destroySchoolifyHomepage) {
        (window as any).__destroySchoolifyHomepage();
      }
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/homepage/styles.css?v=20261106_perf2" />
      <StaticHomepageRoot />
      {skeletonPhase !== 'gone' && (
        <HomePageSkeletonOverlay leaving={skeletonPhase === 'leaving'} />
      )}

      <Script
        src="/homepage/vendor/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/homepage/vendor/ScrollTrigger.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/homepage/vendor/lenis.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/homepage/app.js?v=20261106_perf2"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).__initSchoolifyHomepage) {
            (window as any).__initSchoolifyHomepage();
            (window as any).__schoolifyRevealHomepage?.();
          }
        }}
      />
    </>
  );
}

