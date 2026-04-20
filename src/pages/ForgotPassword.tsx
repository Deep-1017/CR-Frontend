import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, MailCheck } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/axios';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
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
            {!submitted ? (
              <>
                <div className="px-8 pt-8 pb-6 border-b border-stone-100">
                  <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
                    Reset your password
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Enter your email and we'll send a reset link.
                  </p>
                </div>
                <div className="px-8 py-7">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                    <button type="submit" disabled={isSubmitting} className="w-full h-11 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        'Send reset link'
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="px-8 py-10 text-center">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailCheck size={22} className="text-stone-700" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900 mb-1">Check your inbox</h2>
                <p className="text-sm text-stone-500 mb-1">
                  We sent a password reset link to
                </p>
                <p className="text-sm font-medium text-stone-800 mb-6">{submittedEmail}</p>
                <p className="text-xs text-stone-400">
                  Didn't receive it? Check your spam folder, or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-stone-600 underline hover:text-stone-900"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 mt-6 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
