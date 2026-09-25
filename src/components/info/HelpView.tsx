import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown, Send } from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';

export function HelpView() {
  const { showToast } = useMarketplace();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'How does the Zero Invest Reseller model work?',
      a: 'As a reseller, you can pick any product from our verified catalog, customize your selling price, and market it on social media or via landing pages. When a customer orders, our suppliers fulfill the order directly with cash on delivery, and we deposit the profit into your wallet.'
    },
    {
      q: 'When and how do I receive my reseller profits?',
      a: 'Profits are credited to your reseller wallet as soon as the courier marks the order as delivered and cash is collected. You can request a withdrawal to your bKash, Nagad, or Bank account anytime.'
    },
    {
      q: 'Which delivery couriers are integrated?',
      a: 'We are integrated with Steadfast Courier, Pathao Courier, and RedX Delivery for fast nationwide delivery coverage across all 64 districts of Bangladesh.'
    },
    {
      q: 'What is the return and replacement policy?',
      a: 'Customers enjoy a 7-day hassle-free replacement warranty for defective or mismatched items. Our platform coordinates the courier reverse pickup directly.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Error', 'Please fill in all fields', 'error');
      return;
    }
    showToast('Message Sent', 'Our support team will get back to you within 24 hours.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#E6E4E0] flex items-center justify-center mx-auto text-neutral-800 shadow-xs">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Help &amp; Customer Support</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Need assistance with your orders, reseller earnings, or deliveries? We are here to help.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E6E4E0] rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Phone Support</h3>
          <p className="text-xs text-neutral-500">+880 1700-000000</p>
          <span className="text-[10px] text-neutral-400">Sun - Thu, 10am - 8pm</span>
        </div>

        <div className="p-5 bg-white border border-[#E6E4E0] rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Email Support</h3>
          <p className="text-xs text-neutral-500">support@zeroinvest.com</p>
          <span className="text-[10px] text-neutral-400">Response within 24 hrs</span>
        </div>

        <div className="p-5 bg-white border border-[#E6E4E0] rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Live WhatsApp</h3>
          <p className="text-xs text-neutral-500">+880 1800-000000</p>
          <span className="text-[10px] text-neutral-400">Priority for Resellers</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#E6E4E0] rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-neutral-900 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white border border-[#E6E4E0] rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahim Ahmed"
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahim@example.com"
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-neutral-700 font-semibold mb-1">Your Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your question or issue..."
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" /> Send Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
