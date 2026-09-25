import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useMarketplace();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Error', 'Please enter a valid email address', 'error');
      return;
    }
    setIsSubmitted(true);
    showToast('Subscribed!', 'You will receive our weekly wholesale product drops.', 'success');
  };

  return (
    <section className="py-12 bg-neutral-900 text-white my-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 overflow-hidden relative">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-[#C98F6B] text-xs font-bold uppercase tracking-wider">Stay Ahead</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Get Instant Alerts for Trending Products & Drops
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
          Join 25,000+ Bangladeshi resellers getting insider wholesale prices, viral catalog additions, and logistics updates.
        </p>

        {isSubmitted ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold pt-2">
            <CheckCircle2 className="w-5 h-5" />
            Thank you for subscribing!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2">
            <div className="relative w-full">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C98F6B]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C98F6B] hover:bg-[#b87e5b] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
