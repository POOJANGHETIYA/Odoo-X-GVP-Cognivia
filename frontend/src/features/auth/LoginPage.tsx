import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@fleetflow.in',
      password: 'fleet1234',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(data.email, data.password);
      // Ensure router state is fresh and navigate to dashboard
      await router.invalidate();
      navigate({ to: '/' });
    } catch (err: any) {
      setLoginError(err.message || 'Login failed Check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

        {/* Header Section */}
        <div className="bg-[#1a1d2e] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[#23273e] rounded-full flex items-center justify-center mb-4 text-white">
            <Truck className="w-8 h-8 text-[#3bb273]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FleetFlow</h1>
          <p className="text-slate-400 mt-2 text-sm">Enterprise Logistics Management</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">Sign in to your account</h2>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@fleetflow.in"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${errors.email ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-300 focus:border-[#3bb273] focus:ring-[#3bb273]/20'
                  }`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="fleet1234"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${errors.password ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-300 focus:border-[#3bb273] focus:ring-[#3bb273]/20'
                  }`}
                {...register('password')}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3bb273] hover:bg-[#329a63] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            <p>Demo Credentials:</p>
            <p className="font-medium inline-block bg-slate-100 px-2 py-1 rounded mt-2">admin@fleetflow.in / fleet1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
