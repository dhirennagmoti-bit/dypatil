import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HelpCircle,
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Headphones,
  User,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  FileText,
  Building2,
  Lock,
} from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'callback' | 'book' | 'ai-chat' | 'ticket'>('callback');
  
  // Instant Callback Form State
  const [callbackName, setCallbackName] = useState(user?.fullName || '');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('Claim Reimbursement & Settlement');
  const [callbackLanguage, setCallbackLanguage] = useState('Hindi & English (Bilingual)');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackRefToken, setCallbackRefToken] = useState('');
  const [callbackTimer, setCallbackTimer] = useState(55);

  // Book Consultation State
  const [bookDate, setBookDate] = useState('2026-10-15');
  const [bookTime, setBookTime] = useState('11:00 AM');
  const [bookExpertType, setBookExpertType] = useState('IRDAI Claims Senior Surveyor');
  const [bookSuccess, setBookSuccess] = useState(false);

  // Live AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: 'Namaste! I am the InsureChain IRDAI Compliance & Claims Assistant. How can I assist you with your policy, claim eligibility, duplicate incident detection, or audit logs today?',
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Claim Eligibility Dispute');
  const [ticketPolicyRef, setTicketPolicyRef] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);

  // Copy Email State
  const [copiedEmail, setCopiedEmail] = useState(false);

  // FAQ State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>('ALL');

  const faqs = [
    {
      category: 'CLAIMS',
      q: 'How does InsureChain’s deterministic eligibility engine calculate my claim payout?',
      a: 'Unlike opaque platforms, InsureChain never uses generative AI to decide money or approvals. Our mathematical engine strictly evaluates four hard criteria: (1) whether the filing date falls within the policy’s filing window (e.g. 30 days from incident), (2) whether the claimed incident category is in the excluded perils list, (3) deduction of the mandatory policy deductible (e.g. ₹5,000) from admissible expenses, and (4) capping the payout at the policy’s maximum coverage limit in ₹ (e.g. ₹10,00,000).',
    },
    {
      category: 'DUPLICATE',
      q: 'What is duplicate incident detection and why was my claim blocked?',
      a: 'Under IRDAI anti-double dipping regulations and VORTEXA 3.0 Problem B-02, the same incident under the same policy cannot be paid twice—even if submitted under different claim reference numbers. InsureChain matches the stable Incident ID + Policy ID across both pending and settled claims. If a duplicate is detected, the system immediately flags or blocks the submission with an auditable cryptographic log.',
    },
    {
      category: 'AUDIT',
      q: 'How does the SHA-256 cryptographic audit chain guarantee transparency?',
      a: 'Every single event—from submission and eligibility check to approval, rejection, or supervisor review—is hashed sequentially using SHA-256, embedding the cryptographic hash of the previous log entry. Any post-facto alteration of database records breaks the entire chain, allowing IRDAI auditors to mathematically verify record integrity at any time.',
    },
    {
      category: 'HOSPITALS',
      q: 'How do cashless hospital claims work across the 10,000+ network?',
      a: 'For emergency or planned hospitalizations, show your InsureChain Policy Card (e.g. Star Health or Apex Shield) at the insurance TPA helpdesk. The hospital sends an e-preauthorization request. Once approved by the underwriting insurer, eligible expenses are settled directly with the hospital.',
    },
    {
      category: 'FILING',
      q: 'What should I do if my incident occurred more than 30 days ago?',
      a: 'Policies specify a filing window (typically 15 to 60 days from the incident date). Claims submitted past this window are automatically marked ineligible by the deterministic engine. However, in cases of medical emergencies or hospitalization delays, you may request an exception review through your insurer’s claims supervisor with supporting hospital discharge summaries.',
    },
    {
      category: 'BUYING',
      q: 'How can I compare policies before buying?',
      a: 'Visit the "Buy Insurance" Marketplace page. You can filter across Health, Motor, Travel, and Commercial plans, check deductibles, coverage limits, and excluded perils side-by-side, or use our AI Recommendation Wizard to find the ideal policy for your family, parents, or vehicle.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = faqCategory === 'ALL' || faq.category === faqCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('insureclaimsupport@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleRequestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    const token = 'EXP-' + Math.floor(100000 + Math.random() * 900000);
    setCallbackRefToken(token);
    setCallbackSubmitted(true);
  };

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookSuccess(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsgList = [
      ...chatMessages,
      { sender: 'user' as const, text: userText, time: 'Now' },
    ];
    setChatMessages(newMsgList);
    setInputMessage('');

    // Simulated Smart Indian Insurance AI Assistant
    setTimeout(() => {
      let reply = 'Thank you for reaching out. Your query regarding InsureChain has been analyzed against the IRDAI compliance knowledge base.';
      const lower = userText.toLowerCase();

      if (lower.includes('deductible') || lower.includes('calculate')) {
        reply = 'In InsureChain, the deductible is the fixed amount you pay before insurance coverage starts (e.g. ₹5,000 for health policies, ₹2,000 for motor). The formula is: Approved Amount = Min(Claimed Amount - Deductible, Coverage Limit).';
      } else if (lower.includes('duplicate') || lower.includes('double')) {
        reply = 'Duplicate claims for the same incident are automatically detected by cross-referencing Policy ID and Incident ID. Submissions matching an existing claim are rejected to comply with IRDAI anti-double-dipping guidelines.';
      } else if (lower.includes('hospital') || lower.includes('cashless')) {
        reply = 'We partner with over 10,000 cashless hospitals across India including Apollo, Fortis, Max, and Manipal Healthcare. Present your Policy Number at the hospital TPA desk for instant pre-authorization.';
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('support')) {
        reply = 'You can reach our dedicated support desk directly at insureclaimsupport@gmail.com or call our 24x7 toll-free helpline at 1800-258-4433.';
      } else if (lower.includes('status') || lower.includes('track')) {
        reply = 'You can view real-time status of all your claims in your Policyholder Dashboard. Every state transition is recorded on the tamper-evident SHA-256 audit ledger.';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: reply, time: 'Now' },
      ]);
    }, 800);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      alert('Please complete the subject and message fields.');
      return;
    }
    const ticketId = 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000);
    setTicketCreated(ticketId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003B73] via-[#00509D] to-[#002952] text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 text-orange-400" />
            24x7 IRDAI Claims Assistance & Consumer Grievance Cell
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Connect directly with verified Indian claims adjusters, resolve policy disputes, inspect deterministic audit calculations, or reach out to our dedicated support desk.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs">
              <Mail className="w-4 h-4 text-orange-300" />
              <span>Email: <strong>insureclaimsupport@gmail.com</strong></span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="ml-1 text-blue-200 hover:text-white transition-colors"
                title="Copy email to clipboard"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs">
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span>Toll-Free Helpline: <strong>1800-258-4433</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Talk to Expert Section & Quick Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Talk to Expert Console (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" id="expert-console">
          
          <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  Certified IRDAI Specialists Live
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mt-1">Talk to an Insurance Expert</h2>
              <p className="text-xs text-[#64748B]">Get unbiased guidance from licensed claims officers and surveyors.</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('callback')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'callback' ? 'bg-white text-blue-700 shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Instant Callback
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'book' ? 'bg-white text-blue-700 shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Schedule Call
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai-chat')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'ai-chat' ? 'bg-white text-blue-700 shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                AI Assistant
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'ticket' ? 'bg-white text-blue-700 shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Raise Ticket
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {/* TAB 1: Instant Callback */}
            {activeTab === 'callback' && (
              <div>
                {!callbackSubmitted ? (
                  <form onSubmit={handleRequestCallback} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
                      <PhoneCall className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Free Instant Callback:</strong> An IRDAI certified claims manager will ring your mobile within 60 seconds with no sales harassment.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Your Name</label>
                        <input
                          type="text"
                          required
                          value={callbackName}
                          onChange={(e) => setCallbackName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Indian Mobile Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-mono font-bold text-[#475569]">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={callbackPhone}
                            onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98765 43210"
                            className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Topic of Assistance</label>
                        <select
                          value={callbackTopic}
                          onChange={(e) => setCallbackTopic(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="Claim Reimbursement & Settlement">Claim Reimbursement & Settlement</option>
                          <option value="Cashless Hospital Denial Dispute">Cashless Hospital Denial Dispute</option>
                          <option value="Deductible & Capping Calculation">Deductible & Capping Calculation</option>
                          <option value="Duplicate Incident Query">Duplicate Incident Query</option>
                          <option value="Policy Recommendation & Purchase">Policy Recommendation & Purchase</option>
                          <option value="IRDAI Grievance Escalation">IRDAI Grievance Escalation</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Preferred Language</label>
                        <select
                          value={callbackLanguage}
                          onChange={(e) => setCallbackLanguage(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="Hindi & English (Bilingual)">Hindi & English (Bilingual)</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Marathi">Marathi (मराठी)</option>
                          <option value="Tamil">Tamil (தமிழ்)</option>
                          <option value="Bengali">Bengali (বাংলা)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Request Instant Callback (Under 60 Seconds)
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        Priority Call Scheduled
                      </span>
                      <h3 className="text-lg font-bold text-[#0F172A] mt-1.5">
                        Calling +91 {callbackPhone}...
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                        Assigned Specialist: <strong>Vikramaditya Sen (IRDAI Surveyor #SUR-84920)</strong>. Your call reference token is:
                      </p>
                      <div className="inline-block mt-2 font-mono font-bold text-sm bg-white px-3 py-1 rounded-lg border border-emerald-300 text-emerald-800">
                        {callbackRefToken}
                      </div>
                    </div>

                    <div className="text-xs text-[#64748B] pt-2">
                      In the event of network disruption, please reply to{' '}
                      <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 font-bold underline">
                        insureclaimsupport@gmail.com
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCallbackSubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A]"
                    >
                      Request Another Call
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Book 1-on-1 Consultation */}
            {activeTab === 'book' && (
              <div>
                {!bookSuccess ? (
                  <form onSubmit={handleBookConsultation} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3 text-xs text-purple-900">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Scheduled 1-on-1 Deep Dive:</strong> Reserve a 30-minute dedicated session with an IRDAI accredited surveyor or high-value claim adjudicator.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Preferred Date</label>
                        <input
                          type="date"
                          required
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Preferred Time Slot (IST)</label>
                        <select
                          value={bookTime}
                          onChange={(e) => setBookTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                          <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                          <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                          <option value="04:30 PM">04:30 PM - 05:00 PM</option>
                          <option value="07:00 PM">07:00 PM - 07:30 PM (Evening)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0F172A]">Specialist Specialization</label>
                      <select
                        value={bookExpertType}
                        onChange={(e) => setBookExpertType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      >
                        <option value="IRDAI Claims Senior Surveyor">IRDAI Claims Senior Surveyor (Accidental & Health)</option>
                        <option value="Motor Accidental Damage Assessor">Motor Accidental Damage & Zero-Dep Assessor</option>
                        <option value="Commercial Fire & Marine Specialist">Commercial Property & Marine Loss Assessor</option>
                        <option value="Cryptographic Audit & Ombudsman Officer">IRDAI Ombudsman Grievance Counselor</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Confirm Consultation Slot
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 text-center">
                    <CheckCircle2 className="w-10 h-10 text-purple-600 mx-auto" />
                    <h3 className="text-base font-bold text-[#0F172A]">Consultation Confirmed!</h3>
                    <p className="text-xs text-[#64748B]">
                      Scheduled with <strong>{bookExpertType}</strong> on <strong>{bookDate}</strong> at <strong>{bookTime}</strong>. A Google Meet / phone conference link has been dispatched to your email.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookSuccess(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A]"
                    >
                      Reschedule Slot
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Interactive Live AI Assistant */}
            {activeTab === 'ai-chat' && (
              <div className="space-y-3">
                <div className="h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-[#0F172A] rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 mb-0.5 font-mono">
                          {msg.sender === 'user' ? 'You' : 'InsureChain AI Specialist'}
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about deductible calculation, duplicate incident rules, or cashless coverage..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: Raise a Support Ticket */}
            {activeTab === 'ticket' && (
              <div>
                {!ticketCreated ? (
                  <form onSubmit={handleCreateTicket} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Category</label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        >
                          <option value="Claim Eligibility Dispute">Claim Eligibility Dispute</option>
                          <option value="Duplicate Incident Appeal">Duplicate Incident Appeal</option>
                          <option value="Deductible / Capping Discrepancy">Deductible / Capping Discrepancy</option>
                          <option value="Cashless Pre-Auth Delay">Cashless Pre-Auth Delay</option>
                          <option value="Cryptographic Audit Proof Inquiry">Cryptographic Audit Proof Inquiry</option>
                          <option value="Other / General Grievance">Other / General Grievance</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A]">Priority</label>
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        >
                          <option value="Low">Low - General query</option>
                          <option value="Medium">Medium - Regular processing</option>
                          <option value="Urgent">Urgent - Emergency hospitalization</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0F172A]">Policy or Claim Reference (Optional)</label>
                      <input
                        type="text"
                        value={ticketPolicyRef}
                        onChange={(e) => setTicketPolicyRef(e.target.value)}
                        placeholder="e.g. POL-01 or CLM-101"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0F172A]">Subject</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief summary of grievance"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0F172A]">Detailed Narrative</label>
                      <textarea
                        required
                        rows={3}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Please describe what happened, hospital name, dates, and amounts involved..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                    >
                      Submit Ticket to Support Desk
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-bold text-[#0F172A]">Ticket Logged Successfully</h3>
                    <p className="text-xs text-[#64748B]">
                      Ticket Reference: <strong className="font-mono text-emerald-800">{ticketCreated}</strong>. A copy has been dispatched to{' '}
                      <strong className="text-blue-700">insureclaimsupport@gmail.com</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTicketCreated(null)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                    >
                      Submit Another Ticket
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Channels & Escalation Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Official Email Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Official Support Email</h3>
                <span className="text-[11px] text-[#64748B]">Monitored 24/7 by Escalation Officers</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0F172A]">
                insureclaimsupport@gmail.com
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-blue-600 transition-colors flex items-center gap-1"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href="mailto:insureclaimsupport@gmail.com?subject=InsureChain%20Support%20Request"
                className="flex-1 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Launch Email Client
              </a>
            </div>
          </div>

          {/* Toll Free Helpline Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">All-India Toll-Free Hotline</h3>
                <span className="text-[11px] text-[#64748B]">Toll-Free across Airtel, Jio, VI & BSNL</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-base font-extrabold text-emerald-800">
                  1800-258-4433
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold">
                  Zero Call Charges • 24x7 Available
                </span>
              </div>
              <a
                href="tel:18002584433"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Escalation Matrix */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
              IRDAI Escalation Matrix
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  L1
                </span>
                <div>
                  <strong className="text-[#0F172A] block">InsureChain Claims Desk</strong>
                  <span className="text-[#64748B] text-[11px]">Turnaround: Under 2 hours • insureclaimsupport@gmail.com</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  L2
                </span>
                <div>
                  <strong className="text-[#0F172A] block">Principal Insurer Grievance Officer</strong>
                  <span className="text-[#64748B] text-[11px]">Apex Mutual, Star Health & HDFC ERGO Escalations</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  L3
                </span>
                <div>
                  <strong className="text-[#0F172A] block">Insurance Ombudsman (IRDAI)</strong>
                  <span className="text-[#64748B] text-[11px]">Statutory Redressal under IRDAI Act 1999</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Searchable Knowledge Base & FAQs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Frequently Asked Questions & Policy Guide
            </h2>
            <p className="text-xs text-[#64748B]">
              Deterministic eligibility calculations, duplicate incident rules, and audit verification explained.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Topics' },
            { id: 'CLAIMS', label: 'Eligibility & Deductibles' },
            { id: 'DUPLICATE', label: 'Duplicate Incidents' },
            { id: 'AUDIT', label: 'SHA-256 Audit Trail' },
            { id: 'HOSPITALS', label: 'Cashless Hospitals' },
            { id: 'BUYING', label: 'Policy Purchase' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFaqCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                faqCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-[#F8FAFC]/50 hover:bg-white"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0F172A]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
