'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '511595808378-ibkrl21ad899r4dmd2v7pit5ejhalgg6.apps.googleusercontent.com';

export interface GoogleLoginButtonProps {
  role?: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL';
  returnUrl?: string;
  label?: string;
  className?: string;
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GoogleLoginButton({
  role = 'STUDENT',
  returnUrl,
  label = 'Đăng nhập bằng tài khoản Google',
  className,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [gsiReady, setGsiReady] = React.useState(false);

  // Nạp script Google Identity Services (GSI) chính thức từ Google
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).google?.accounts?.oauth2) {
      setGsiReady(true);
      return;
    }
    const existing = document.getElementById('google-gsi-client-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => setGsiReady(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiReady(true);
    document.head.appendChild(script);
  }, []);

  const defaultRedirect = React.useMemo(() => {
    if (returnUrl) return returnUrl;
    return role === 'TEACHER' ? '/teacher/dashboard' : '/luyen-thi';
  }, [role, returnUrl]);

  const authenticateWithBackend = async (payload: {
    idToken?: string;
    accessToken?: string;
  }) => {
    setIsLoading(true);
    try {
      const profileType = role === 'TEACHER' ? 'TEACHER' : 'STUDENT';

      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: payload.idToken,
          accessToken: payload.accessToken,
          profile_type: profileType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        throw new Error(data.message || 'Xác thực Google thất bại');
      }

      const backendUser = data.user;
      const jwtToken = data.accessToken || '';

      login(backendUser, jwtToken, role);

      toast.success('Đăng nhập Google thành công!', {
        description: `Chào mừng ${backendUser.fullname} (${backendUser.email})!`,
      });

      router.push(defaultRedirect);
    } catch (error: any) {
      toast.error('Lỗi xác thực Google', {
        description: error?.message || 'Vui lòng kiểm tra cấu hình Google Client ID.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGoogleAuth = () => {
    const g = (window as any).google;
    if (!g?.accounts?.oauth2) {
      toast.error('Đang tải thư viện Google Sign-In', {
        description: 'Vui lòng đợi 1-2 giây rồi bấm lại hoặc kiểm tra kết nối mạng.',
      });
      return;
    }

    try {
      const tokenClient = g.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: (tokenResponse: any) => {
          if (tokenResponse?.error) {
            toast.error('Đã hủy hoặc lỗi đăng nhập Google', {
              description: tokenResponse.error_description || tokenResponse.error,
            });
            return;
          }
          if (tokenResponse?.access_token) {
            authenticateWithBackend({ accessToken: tokenResponse.access_token });
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err: any) {
      toast.error('Không thể mở cửa sổ Google Sign-In', {
        description: err?.message || 'Vui lòng kiểm tra NEXT_PUBLIC_GOOGLE_CLIENT_ID.',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpenGoogleAuth}
      disabled={isLoading}
      className={
        className ||
        'w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60'
      }
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#00B8DD]" /> : <GoogleIcon />}
      <span>
        {isLoading
          ? 'Đang xác thực với Google...'
          : gsiReady
            ? label
            : 'Đang kết nối Google...'}
      </span>
    </button>
  );
}
