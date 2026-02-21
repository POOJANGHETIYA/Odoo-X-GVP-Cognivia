import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Truck,
  Loader2,
  ShieldCheck,
  Lock,
  Mail,
  ChevronRight,
  Globe,
  BarChart3
} from 'lucide-react';

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
      await router.invalidate();
      navigate({ to: '/' });
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Visual Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <img
          src="/images/login-bg.png"
          alt="Fleet background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight uppercase">FleetFlow</span>
            </div>

            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 max-w-md tracking-tighter">
              Orchestrate Your <span className="text-indigo-400">Global Logistics</span> Infrastructure.
            </h2>
            <p className="text-zinc-400 text-lg max-w-sm leading-relaxed font-medium">
              Enterprise-grade fleet intelligence, real-time telemetry, and capital optimization in one unified interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-zinc-800 pt-12">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Corridors</span>
              </div>
              <p className="text-3xl font-black text-white tabular-nums">42<span className="text-lg text-zinc-500 ml-1">K+</span></p>
              <p className="text-xs text-zinc-500 font-bold mt-1">Real-time assets tracked</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Yield</span>
              </div>
              <p className="text-3xl font-black text-white tabular-nums">98.4<span className="text-lg text-zinc-500 ml-1">%</span></p>
              <p className="text-xs text-zinc-500 font-bold mt-1">Uptime SLA guaranteed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-50/50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-zinc-900 tracking-tight uppercase">FleetFlow</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-3">Operator Sign-in</h1>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Identity Verified Access Control</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1" htmlFor="email">
                Registry Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.in"
                  className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-sm font-medium transition-all outline-none shadow-sm ${errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5'
                    : 'border-zinc-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
                    }`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tighter">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1" htmlFor="password">
                  Security Key
                </label>
                <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Reset PIN</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-sm font-medium transition-all outline-none shadow-sm ${errors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5'
                    : 'border-zinc-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
                    }`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tighter">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs uppercase tracking-widest">Decrypting Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] ml-2">Authenticate Identity</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-5 text-center relative z-10">Access Control Registry (Dev Mode)</p>

            <div className="grid grid-cols-1 gap-2.5 relative z-10">
              <CredentialItem role="System Admin" email="admin@fleetflow.in" pass="fleet1234" color="bg-zinc-900" />
              <CredentialItem role="Operations" email="ops@fleetflow.in" pass="fleet1234" color="bg-indigo-600" />
              <CredentialItem role="Finance" email="finance@fleetflow.in" pass="fleet1234" color="bg-emerald-600" />
              <CredentialItem role="Maintenance" email="service@fleetflow.in" pass="fleet1234" color="bg-amber-600" />
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">
              By accessing this registry you agree to our <br />
              <button className="text-zinc-600 hover:text-zinc-900 underline underline-offset-4">Fleet Security Protocol</button> & <button className="text-zinc-600 hover:text-zinc-900 underline underline-offset-4">Privacy Standards</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CredentialItem = ({ role, email, pass, color }: any) => (
  <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all group/item">
    <div className="flex items-center gap-3">
      <div className={`w-1.5 h-8 rounded-full ${color}`} />
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{role}</span>
        <span className="text-[11px] font-bold text-zinc-700">{email}</span>
      </div>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">Password</span>
      <span className="text-[10px] font-black text-indigo-600 tabular-nums tracking-wider uppercase">{pass}</span>
    </div>
  </div>
);
