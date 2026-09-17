import React, { useState, useEffect, useId } from 'react';
import { DiscussionEmbed } from 'disqus-react';
import {
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ThumbsUp,
  Filter,
  Train,
  Bus,
  Clock,
  HelpCircle,
} from 'lucide-react';

export interface UserFeedbackItem {
  id: string;
  category: 'bus' | 'mrt' | 'delay' | 'feature' | 'general';
  name: string;
  email?: string;
  stationOrStop?: string;
  rating: number;
  message: string;
  createdAt: string;
  helpfulCount: number;
  status: 'Received' | 'Reviewed' | 'Under Investigation';
}

const STORAGE_KEY = 'sg_transit_user_feedback_v1';

const INITIAL_COMMUNITY_FEEDBACK: UserFeedbackItem[] = [
  {
    id: 'fb-demo-1',
    category: 'bus',
    name: 'Kenji_T',
    stationOrStop: 'Dhoby Ghaut Stn Exit B (04111)',
    rating: 5,
    message: 'The live arrival countdowns for Bus 65 and 190 are spot on! Saved me from waiting in the rain this morning.',
    createdAt: '15 mins ago',
    helpfulCount: 14,
    status: 'Reviewed',
  },
  {
    id: 'fb-demo-2',
    category: 'mrt',
    name: 'Sarah Commuter',
    stationOrStop: 'Jurong East (NS1/EW24)',
    rating: 5,
    message: 'Love the line status and transfer indicators. Smooth navigation between NSL and EWL timings.',
    createdAt: '1 hour ago',
    helpfulCount: 9,
    status: 'Reviewed',
  },
  {
    id: 'fb-demo-3',
    category: 'feature',
    name: 'Dave_SG',
    stationOrStop: 'All Lines',
    rating: 4,
    message: 'Could you add push notification alerts for line delays on Thomson-East Coast Line? Overall great app!',
    createdAt: '3 hours ago',
    helpfulCount: 22,
    status: 'Under Investigation',
  },
];

// Fixed Disqus universal configuration
const DISQUS_SHORTNAME = 'jasminep';
const DISQUS_PAGE_IDENTIFIER = 'sg-transport-hub-talk-to-us';
const DISQUS_PAGE_TITLE = 'Talk to Us - SG Transport & Parking Hub Community';

export const TalkToUs: React.FC = () => {
  // Navigation between direct feedback form & Disqus forum
  const [activeSubTab, setActiveSubTab] = useState<'feedback' | 'disqus' | 'all'>('feedback');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'bus' | 'mrt' | 'delay' | 'feature' | 'general'>('bus');
  const [stationOrStop, setStationOrStop] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // List of feedback items (loaded from localStorage + initial examples)
  const [feedbackList, setFeedbackList] = useState<UserFeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_COMMUNITY_FEEDBACK;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Disqus state
  const [disqusKey, setDisqusKey] = useState<number>(() => Date.now());
  const [isReloadingDisqus, setIsReloadingDisqus] = useState(false);
  const [disqusLoadError, setDisqusLoadError] = useState(false);

  // Canonical page URL for Disqus
  const canonicalUrl =
    typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
      ? `${window.location.origin}/talk-to-us`
      : 'https://jvvsmne.github.io/mrt-bus-v1/talk-to-us';

  const disqusConfig = {
    url: canonicalUrl,
    identifier: DISQUS_PAGE_IDENTIFIER,
    title: DISQUS_PAGE_TITLE,
    language: 'en',
  };

  // Reload Disqus handler
  const handleReloadDisqus = () => {
    setIsReloadingDisqus(true);
    setDisqusLoadError(false);
    setDisqusKey(Date.now());
    setTimeout(() => {
      setIsReloadingDisqus(false);
    }, 600);
  };

  // Check if Disqus iframe loaded within 5 seconds; if not, flag notice
  useEffect(() => {
    if (activeSubTab === 'disqus' || activeSubTab === 'all') {
      const timer = setTimeout(() => {
        const iframe = document.querySelector('#disqus_thread iframe');
        if (!iframe) {
          setDisqusLoadError(true);
        }
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab, disqusKey]);

  // Handle new feedback submission
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    const newItem: UserFeedbackItem = {
      id: `fb-${Date.now()}`,
      category,
      name: name.trim() || 'Anonymous Commuter',
      email: email.trim() || undefined,
      stationOrStop: stationOrStop.trim() || undefined,
      rating,
      message: message.trim(),
      createdAt: 'Just now',
      helpfulCount: 1,
      status: 'Received',
    };

    setTimeout(() => {
      const updated = [newItem, ...feedbackList];
      setFeedbackList(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }

      // Reset form
      setMessage('');
      setStationOrStop('');
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 400);
  };

  const handleHelpful = (id: string) => {
    const updated = feedbackList.map(item =>
      item.id === id ? { ...item, helpfulCount: item.helpfulCount + 1 } : item
    );
    setFeedbackList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filteredFeedback =
    categoryFilter === 'all'
      ? feedbackList
      : feedbackList.filter(item => item.category === categoryFilter);

  return (
    <div id="talk-to-us-section" className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Talk to Us</h2>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                  Feedback & Forum
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit live commuter feedback, report delays, suggest improvements, or join the Disqus discussion
              </p>
            </div>
          </div>

          {/* Sub Navigation Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center text-xs font-semibold">
            <button
              id="subtab-btn-feedback"
              onClick={() => setActiveSubTab('feedback')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'feedback'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submit Feedback
            </button>
            <button
              id="subtab-btn-disqus"
              onClick={() => setActiveSubTab('disqus')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'disqus'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disqus Forum
            </button>
            <button
              id="subtab-btn-all"
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hidden sm:block ${
                activeSubTab === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View Both
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DIRECT FEEDBACK SUBMISSION FORM */}
      {(activeSubTab === 'feedback' || activeSubTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Submit Commuter Feedback
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your thoughts help improve bus arrivals, train monitoring, and station tools.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Instant Online
              </span>
            </div>

            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Thank you! Your feedback has been received and added to the community board below.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Feedback Topic / Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'bus', label: 'Bus Timings', icon: Bus },
                    { id: 'mrt', label: 'MRT / LRT', icon: Train },
                    { id: 'delay', label: 'Delay Alert', icon: Clock },
                    { id: 'feature', label: 'Feature Request', icon: Sparkles },
                    { id: 'general', label: 'General Question', icon: HelpCircle },
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fb-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name or Handle
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. WoodlandsRider"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="fb-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. commuter@example.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Station or Stop */}
              <div>
                <label htmlFor="fb-stop" className="block text-xs font-bold text-slate-700 mb-1">
                  Bus Stop / MRT Station Reference <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="fb-stop"
                  type="text"
                  value={stationOrStop}
                  onChange={e => setStationOrStop(e.target.value)}
                  placeholder="e.g. Dhoby Ghaut Exit B (04111) or Jurong East NS1"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall App & Commute Experience Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-500 ml-2">
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label htmlFor="fb-message" className="block text-xs font-bold text-slate-700 mb-1">
                  Your Message or Suggestion <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Share details of the bus delay, route suggestion, station accessibility, or what features you'd like to see next..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Public feedback moderated for community safety</span>
                </div>

                <button
                  id="btn-submit-feedback"
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines & Community Highlights (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>How We Use Your Feedback</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Bus Arrival Verification</strong>
                    <span>Reports of discrepancy between countdowns and actual arrivals help refine telemetry prediction seeds.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Train className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">MRT Crowd & Disruptions</strong>
                    <span>Live community reports verify track faults and train delays alongside official LTA DataMall GTFS feeds.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Feature Roadmaps</strong>
                    <span>Highest-upvoted requests are prioritized in upcoming releases of the Singapore Transport Hub.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Want open discussion?</span>
                <button
                  onClick={() => setActiveSubTab('disqus')}
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Switch to Disqus Forum</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECENT COMMUNITY FEEDBACK STREAM */}
      {(activeSubTab === 'feedback' || activeSubTab === 'all') && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Commuter Feedback & Reports
              </h3>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">
                {filteredFeedback.length}
              </span>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium mr-1">Filter:</span>
              {['all', 'bus', 'mrt', 'delay', 'feature'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredFeedback.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed mb-3">
                    "{item.message}"
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    {item.stationOrStop && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {item.stationOrStop}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleHelpful(item.id)}
                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Mark feedback as helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{item.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: DISQUS DISCUSSION EMBED (PROPER JS FRAMEWORK VIA DISQUS-REACT) */}
      {(activeSubTab === 'disqus' || activeSubTab === 'all') && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Disqus Public Forum
                </h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 font-mono">
                  {DISQUS_SHORTNAME}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by official Disqus React framework with fixed URL and unique thread identifier
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-reload-disqus-tab"
                onClick={handleReloadDisqus}
                disabled={isReloadingDisqus}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Reload Disqus Thread"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isReloadingDisqus ? 'animate-spin' : ''}`} />
                <span>{isReloadingDisqus ? 'Reloading...' : 'Reload Thread'}</span>
              </button>

              <a
                href={`https://${DISQUS_SHORTNAME}.disqus.com`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                title="Open Disqus Channel in New Tab"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Privacy & Sandbox notification if iframe is blocked */}
          {disqusLoadError && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Browser Privacy / Sandbox Notice:</span>
                <span>
                  If Disqus comments do not render inside this preview window, your browser or ad-blocker (such as Brave Shields, uBlock Origin, or third-party cookie blocking) may be preventing third-party embeds. You can:{' '}
                  <a
                    href={`https://${DISQUS_SHORTNAME}.disqus.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                  >
                    Open the Discussion directly on Disqus <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  {' '}or use the <strong>Submit Feedback</strong> form above to send your feedback directly!
                </span>
              </div>
            </div>
          )}

          {/* Official disqus-react DiscussionEmbed Component */}
          <div className="min-h-[380px] w-full bg-slate-50/40 rounded-xl p-3 border border-slate-100">
            <DiscussionEmbed
              key={disqusKey}
              shortname={DISQUS_SHORTNAME}
              config={disqusConfig}
            />
          </div>

          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-indigo-600 underline">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>
      )}
    </div>
  );
};
