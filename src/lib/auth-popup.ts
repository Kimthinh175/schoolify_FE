/**
 * Utility helper to manage Schoolify Auth Subtab / Popup Windows.
 * Ensures the popup closes cleanly and parent updates auth state seamlessly.
 */

export function isAuthPopup(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check window.opener
  if (window.opener && window.opener !== window) return true;

  // 2. Check window name assigned by Navbar
  if (window.name && window.name.includes('SchoolifyAuth')) return true;

  // 3. Check query param ?popup=1
  if (window.location.search.includes('popup=1')) return true;

  // 4. Check sessionStorage persistence (preserves popup identity across navigation/maximize)
  try {
    if (sessionStorage.getItem('is_schoolify_popup') === '1') return true;
  } catch (e) {}

  return false;
}

export function isWindowLarge(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 850 && window.innerHeight >= 650;
}

export function isCompactSubtab(): boolean {
  if (typeof window === 'undefined') return false;
  return isAuthPopup() && !isWindowLarge();
}

export function initAuthPopupSession(): void {
  if (typeof window === 'undefined') return;
  if (isAuthPopup()) {
    try {
      sessionStorage.setItem('is_schoolify_popup', '1');
    } catch (e) {}
  }
}

export function notifyAuthSuccessAndKillPopup(payload: {
  user: any;
  token: string;
  role?: string;
}): boolean {
  if (typeof window === 'undefined') return false;

  const isPopup = isAuthPopup();
  if (!isPopup) return false;

  const { user, token, role } = payload;

  // Gửi 1 tín hiệu duy nhất qua BroadcastChannel (fallback sang localStorage nếu trình duyệt không hỗ trợ)
  let broadcasted = false;
  try {
    const ch = new BroadcastChannel('schoolify_auth_channel');
    ch.postMessage({ type: 'LOGIN_SUCCESS', user, token, role });
    ch.close();
    broadcasted = true;
  } catch (e) {}

  if (!broadcasted) {
    try {
      localStorage.setItem(
        'schoolify_auth_event',
        JSON.stringify({
          timestamp: Date.now(),
          user,
          token,
          role,
        })
      );
    } catch (e) {}
  }

  // 4. Clear the UI immediately to prevent navigating to main app in small window
  try {
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#090D16;color:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;padding:24px;">
          <div style="width:52px;height:52px;border-radius:16px;background:rgba(0,184,221,0.15);border:1px solid rgba(0,184,221,0.3);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;">
            ✓
          </div>
          <div style="font-size:18px;font-weight:700;margin-bottom:6px;color:#f8fafc;">Đăng nhập thành công!</div>
          <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">Đang đóng cửa sổ và chuyển về trang chính...</div>
          <button onclick="window.close()" style="background:#00B8DD;color:white;border:none;padding:10px 24px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(0,184,221,0.3);">
            Đóng cửa sổ ngay
          </button>
        </div>
      `;
    }
  } catch (e) {}

  // 5. Multi-attempt window.close()
  try {
    window.close();
  } catch (e) {}

  setTimeout(() => {
    try {
      window.close();
    } catch (e) {}
  }, 50);

  setTimeout(() => {
    try {
      window.close();
    } catch (e) {}
  }, 200);

  setTimeout(() => {
    try {
      window.close();
    } catch (e) {}
  }, 500);

  return true;
}
