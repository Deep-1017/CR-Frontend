import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/axios';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetForm = z.infer<typeof resetSchema>;

const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
  <li className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-emerald-600' : 'text-stone-400'}`}>
    <Check size={11} className={met ? 'opacity-100' : 'opacity-30'} />
    {label}
  </li>
);

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const passwordValue = watch('password', '');
  const rules = [
    { met: passwordValue.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(passwordValue), label: 'One uppercase letter' },
    { met: /[0-9]/.test(passwordValue), label: 'One number' },
  ];

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <p className="text-stone-600 mb-4">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-stone-900 font-medium underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

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
      <header className="relative z-10 px-6 py-5 flex items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">CR</span>
          </div>
          <span className="text-stone-900 font-semibold text-sm tracking-tight">CR Store</span>
        </Link>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="bg-white border border-stone-200/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-stone-100">
              <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
                Set a new password
              </h1>
              <p className="mt-1 text-sm text-stone-500">Choose a strong password for your account.</p>
            </div>
            <div className="px-8 py-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 ${
                        errors.password ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-stone-200'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordValue.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {rules.map((r) => <PasswordRule key={r.label} met={r.met} label={r.label} />)}
                    </ul>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 ${
                        errors.confirmPassword ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-stone-200'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full h-11 mt-1 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {isSubmitting ? (
                    <><Loader2 size={15} className="animate-spin" />Resetting…</>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
