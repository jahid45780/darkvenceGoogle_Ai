import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../../components/ui/BrandLogo.tsx';

interface AdminLoginPageProps {
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBackToSite }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@darkvence.com');
  const [password, setPassword] = useState('darkvence2026!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreFill = () => {
    setEmail('admin@darkvence.com');
    setPassword('darkvence2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-[#0F0F0F] border border-[#232323] shadow-2xl space-y-8 relative">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>
          <p className="text-sm font-body text-[#A1A1A1] leading-relaxed max-w-[65ch]">
            Sign in to manage agency services, portfolio cases, blog articles, and lead inquiries.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs font-body text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold font-body text-white">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1A1A1] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-[#232323] rounded-xl pl-10 pr-4 py-2.5 text-sm font-body text-white focus:outline-none focus:border-[#B6FF2B]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold font-body text-white">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1A1A1] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161616] border border-[#232323] rounded-xl pl-10 pr-4 py-2.5 text-sm font-body text-white focus:outline-none focus:border-[#B6FF2B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] active:scale-[0.99] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div className="p-4 rounded-xl bg-black border border-[#232323] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium tracking-[0.08em] uppercase text-[#B6FF2B]">Default Credentials:</span>
            <button
              onClick={handlePreFill}
              className="text-xs font-mono text-white hover:text-[#B6FF2B] underline cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>
          <div className="text-xs font-mono text-[#A1A1A1] space-y-0.5">
            <p>Email: <span className="text-white">admin@darkvence.com</span></p>
            <p>Pass: <span className="text-white">darkvence2026!</span></p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onBackToSite}
            className="text-xs font-mono font-medium tracking-[0.08em] uppercase text-[#A1A1A1] hover:text-white transition-colors cursor-pointer"
          >
            ← Return to Public Agency Website
          </button>
        </div>
      </div>
    </div>
  );
};
