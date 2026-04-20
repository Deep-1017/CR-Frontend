import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name too long'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
});
type RegisterForm = z.infer<typeof registerSchema>;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const PasswordRule = ({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) => (
  <li className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-emerald-600' : 'text-stone-400'}`}>
    <Check size={11} className={met ? 'opacity-100' : 'opacity-30'} />
    {label}
  </li>
);

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const { register: registerUser, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const pwd = watch('password', '');
  useEffect(() => setPasswordValue(pwd || ''), [pwd]);

  const rules = [
    { met: passwordValue.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(passwordValue), label: 'One uppercase letter' },
    { met: /[0-9]/.test(passwordValue), label: 'One number' },
  ];

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome to CR Store.');
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Try again.';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('exists')) {
        setError('email', { message: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">CR</span>
          </div>
          <span className="text-stone-900 font-semibold text-sm tracking-tight">CR Store</span>
        </Link>
        <p className="text-stone-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-900 font-medium underline underline-offset-2 hover:text-stone-600 transition-colors">
            Sign in
          </Link>
        </p>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="bg-white border border-stone-200/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-stone-100">
              <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-stone-500">Join CR Store — it only takes a minute.</p>
            </div>
            <div className="px-8 py-7 space-y-5">
              <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading || isSubmitting} className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 hover:border-stone-300 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                {isGoogleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-xs text-stone-400 font-medium">or</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                    Full name
                  </label>
                  <input id="name" type="text" autoComplete="name" placeholder="Alex Johnson" {...register('name')} className={`w-full h-11 px-3.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 ${
                      errors.name ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-stone-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                    Email address
                  </label>
                  <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} className={`w-full h-11 px-3.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 ${
                      errors.email ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-stone-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                    Password
                  </label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••" {...register('password')} className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 ${
                        errors.password ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-stone-200'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors" tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordValue.length > 0 && (
                    <ul className="mt-2 space-y-1 pl-0.5">
                      {rules.map((r) => (
                        <PasswordRule key={r.label} met={r.met} label={r.label} />
                      ))}
                    </ul>
                  )}
                  {errors.password && !passwordValue && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting || isGoogleLoading} className="w-full h-11 mt-1 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </div>
          </div>
          <p className="text-center mt-6 text-xs text-stone-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-stone-600">Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-stone-600">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
