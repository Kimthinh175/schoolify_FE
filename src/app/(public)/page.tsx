'use client';

import * as React from 'react';
import Script from 'next/script';
import { HOMEPAGE_FINAL_HTML } from '@/components/features/home/homepage-final-html';

export default function HomePage() {
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
      <div
        id="schoolify-homepage-root"
        dangerouslySetInnerHTML={{ __html: HOMEPAGE_FINAL_HTML }}
      />

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
        src="/homepage/app.js?v=20261104e"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).__initSchoolifyHomepage) {
            (window as any).__initSchoolifyHomepage();
          }
        }}
      />
    </>
  );
}

