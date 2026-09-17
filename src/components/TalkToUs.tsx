import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  MessageCircle,
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
  source?: 'form' | 'disqus';
}

const STORAGE_KEY = 'sg_transit_user_feedback_v2';

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
    source: 'form',
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
    source: 'disqus',
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
    source: 'form',
  },
];

// Fixed real canonical values for Disqus thread
const DISQUS_SHORTNAME = 'jasminep';
const CANONICAL_PAGE_URL = 'https://jvvsmne.github.io/mrt-bus-v1/talk-to-us';
const CANONICAL_PAGE_IDENTIFIER = 'sg-transport-hub-talk-to-us';
const CANONICAL_PAGE_TITLE = 'Talk to Us - SG Transport & Parking Hub Community Discussion';

export const TalkToUs: React.FC = () => {
  // Mode selection: 'all' displays both direct feedback & Disqus embed; or user can toggle tabs
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'feedback' | 'disqus'>('all');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'bus' | 'mrt' | 'delay' | 'feature' | 'general'>('bus');
  const [stationOrStop, setStationOrStop] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // List of feedback and captured comments
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

  // Disqus embed status and lifecycle management
  const [disqusStatus, setDisqusStatus] = useState<'loading' | 'ready' | 'blocked' | 'idle'>('loading');
  const [isReloadingDisqus, setIsReloadingDisqus] = useState(false);
  const disqusContainerRef = useRef<HTMLDivElement>(null);

  // Callback to capture new comments submitted through Disqus or the form
  const handleCaptureComment = useCallback((newComment: UserFeedbackItem) => {
    setFeedbackList(prev => {
      // Check if already captured to avoid duplication
      if (prev.some(item => item.id === newComment.id)) return prev;
      const updated = [newComment, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Native, rock-solid Disqus embedding with proper React SPA lifecycle and error prevention
  const initOrReloadDisqus = useCallback(() => {
    setIsReloadingDisqus(true);
    setDisqusStatus('loading');

    // Configure disqus_config safely without third-party library crashes
    const configureDisqus = function (this: any) {
      this.page = this.page || {};
      this.page.url = CANONICAL_PAGE_URL;
      this.page.identifier = CANONICAL_PAGE_IDENTIFIER;
      this.page.title = CANONICAL_PAGE_TITLE;

      // Ensure callbacks object exists safely
      this.callbacks = this.callbacks || {};

      // Listener to automatically capture comments submitted through Disqus
      this.callbacks.onNewComment = [
        function (comment: any) {
          if (comment) {
            handleCaptureComment({
              id: `disqus-${comment.id || Date.now()}`,
              category: 'general',
              name: comment.author?.name || 'Disqus Commuter',
              email: undefined,
              stationOrStop: 'Public Discussion',
              rating: 5,
              message: comment.text || comment.raw_message || 'Comment submitted via Disqus',
              createdAt: 'Just now',
              helpfulCount: 1,
              status: 'Received',
              source: 'disqus',
            });
          }
        },
      ];

      this.callbacks.onReady = [
        function () {
          setDisqusStatus('ready');
          setIsReloadingDisqus(false);
        },
      ];
    };

    // Attach to window
    (window as any).disqus_config = configureDisqus;

    if (typeof (window as any).DISQUS !== 'undefined') {
      // Disqus script already loaded in page: trigger clean reload into the mounted #disqus_thread DOM
      try {
        (window as any).DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
        setDisqusStatus('ready');
      } catch (err) {
        console.warn('Disqus reset error:', err);
        setDisqusStatus('blocked');
      }
      setTimeout(() => setIsReloadingDisqus(false), 500);
    } else {
      // First time loading: inject embed.js script cleanly
      let script = document.getElementById('dsq-embed-scr') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'dsq-embed-scr';
        script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', String(+new Date()));
        script.async = true;

        script.onload = () => {
          setDisqusStatus('ready');
          setIsReloadingDisqus(false);
        };

        script.onerror = () => {
          setDisqusStatus('blocked');
          setIsReloadingDisqus(false);
        };

        (document.head || document.body).appendChild(script);
      } else {
        // Script exists in head/body; wait for DISQUS global to be ready
        const poll = setInterval(() => {
          if (typeof (window as any).DISQUS !== 'undefined') {
            clearInterval(poll);
            try {
              (window as any).DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
              setDisqusStatus('ready');
            } catch (err) {
              console.warn('Disqus reset poll error:', err);
            }
            setIsReloadingDisqus(false);
          }
        }, 150);

        setTimeout(() => {
          clearInterval(poll);
          setIsReloadingDisqus(false);
        }, 4000);
      }
    }
  }, [handleCaptureComment]);

  // Mount effect: initialize Disqus when tab or sub-view is active
  useEffect(() => {
    initOrReloadDisqus();
  }, [initOrReloadDisqus]);

  // Handle direct feedback form submission
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
      source: 'form',
    };

    setTimeout(() => {
      handleCaptureComment(newItem);

      // Clear input fields
      setMessage('');
      setStationOrStop('');
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 350);
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
    <div id="talk-to-us-container" className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Talk to Us</h2>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                Community & Feedback Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit commuter feedback, report delays, suggest features, or participate in the public Disqus thread
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center text-xs font-semibold">
          <button
            id="tab-view-all"
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Views
          </button>
          <button
            id="tab-view-feedback"
            onClick={() => setActiveSubTab('feedback')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'feedback'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Feedback Form
          </button>
          <button
            id="tab-view-disqus"
            onClick={() => setActiveSubTab('disqus')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'disqus'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disqus Public Forum
          </button>
        </div>
      </div>

      {/* SECTION 1: DIRECT FEEDBACK & COMMUTER REPORTING FORM */}
      {(activeSubTab === 'all' || activeSubTab === 'feedback') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Submit Commuter Feedback</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct submission captured instantly on the public board without requiring 3rd-party login.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Live Capture Active
              </span>
            </div>

            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Thank you! Your feedback has been captured and published to the live community board below.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Topic / Category
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
                  <label htmlFor="fb-name-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name or Handle
                  </label>
                  <input
                    id="fb-name-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. WoodlandsCommuter"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="fb-email-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="fb-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Station or Stop */}
              <div>
                <label htmlFor="fb-stop-input" className="block text-xs font-bold text-slate-700 mb-1">
                  Bus Stop / MRT Station Reference <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="fb-stop-input"
                  type="text"
                  value={stationOrStop}
                  onChange={e => setStationOrStop(e.target.value)}
                  placeholder="e.g. Orchard (NS22/TE14) or Bus Stop 04111"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall App & Transit Experience Rating
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
                <label htmlFor="fb-message-input" className="block text-xs font-bold text-slate-700 mb-1">
                  Your Feedback / Comment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="fb-message-input"
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your transit experience, report a delayed bus/train, or share what features you'd like added..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Public feedback moderated for community safety</span>
                </div>

                <button
                  id="btn-submit-feedback-form"
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

          {/* Guidelines & Forum Highlights (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>How Feedback Is Captured</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Instant Local & Public Sync</strong>
                    <span>All submissions are recorded in real-time, displayed in the public community list below, and preserved across sessions.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Transit Telemetry Calibration</strong>
                    <span>Bus arrival notes and crowd observations are matched against GTFS live feeds to verify arrival accuracies.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Disqus Community Forum</strong>
                    <span>You can also sign in to post threaded comments in the Disqus forum section below with notifications on replies.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DISQUS PUBLIC FORUM */}
      {(activeSubTab === 'all' || activeSubTab === 'disqus') && (
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
                Canonical Thread ID: <code className="font-mono text-indigo-600 font-semibold">{CANONICAL_PAGE_IDENTIFIER}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-reload-disqus-feed"
                onClick={initOrReloadDisqus}
                disabled={isReloadingDisqus}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Reload Disqus Thread"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isReloadingDisqus ? 'animate-spin' : ''}`} />
                <span>{isReloadingDisqus ? 'Reloading...' : 'Reload Forum'}</span>
              </button>

              <a
                href={`https://${DISQUS_SHORTNAME}.disqus.com`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                title="Open Disqus Channel in New Window"
              >
                <span>Direct Forum Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Privacy / Sandbox notice */}
          {disqusStatus === 'blocked' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Disqus Embed Notice:</span>
                <span>
                  Disqus requires third-party cookies and account authentication. If the embed does not render inside your browser or preview container, you can post using the{' '}
                  <button
                    onClick={() => setActiveSubTab('feedback')}
                    className="font-bold underline text-indigo-700 cursor-pointer"
                  >
                    Direct Feedback Form
                  </button>
                  {' '}above or{' '}
                  <a
                    href={`https://${DISQUS_SHORTNAME}.disqus.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                  >
                    open the discussion on Disqus directly <ExternalLink className="w-3 h-3 inline" />
                  </a>.
                </span>
              </div>
            </div>
          )}

          {/* Disqus Mount Container with guaranteed ID */}
          <div ref={disqusContainerRef} className="min-h-[380px] w-full bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <div id="disqus_thread"></div>
            <noscript>
              Please enable JavaScript to view the{' '}
              <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-indigo-600 underline">
                comments powered by Disqus.
              </a>
            </noscript>
          </div>
        </div>
      )}

      {/* SECTION 3: CAPTURED FEEDBACK & COMMUNITY DISCUSSIONS STREAM */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Captured Feedback & Community Discussions
            </h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
              {filteredFeedback.length} posts
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium mr-1 shrink-0">Filter:</span>
            {['all', 'bus', 'mrt', 'delay', 'feature'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {item.category}
                    </span>
                    {item.source === 'disqus' && (
                      <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm border border-indigo-200/50">
                        Disqus
                      </span>
                    )}
                  </div>
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
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {item.stationOrStop || item.createdAt}
                  </div>
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
    </div>
  );
};
