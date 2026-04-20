import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      window.location.replace('/');
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
