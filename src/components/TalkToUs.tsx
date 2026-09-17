import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, RefreshCw, MessageCircle, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

export const TalkToUs: React.FC = () => {
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Real fixed values for page.url and page.identifier
  const getDisqusConfig = useCallback(() => {
    const pageUrl =
      typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
        ? `${window.location.origin}/talk-to-us`
        : 'https://jvvsmne.github.io/mrt-bus-v1/talk-to-us';
    const pageIdentifier = 'sg-transport-hub-talk-to-us';

    return {
      url: pageUrl,
      identifier: pageIdentifier,
      title: 'Talk to Us - SG Transport & Parking Hub',
    };
  }, []);

  const loadOrReloadDisqus = useCallback(() => {
    setIsReloading(true);
    const { url, identifier, title } = getDisqusConfig();

    const configureDisqus = function (this: any) {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    // Set global disqus_config as required by Disqus universal code
    (window as any).disqus_config = configureDisqus;

    if (typeof (window as any).DISQUS !== 'undefined') {
      // Disqus is already loaded in this SPA session: reset and reload the mounted thread
      try {
        (window as any).DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
      } catch (err) {
        console.warn('Error resetting Disqus:', err);
      }
      setTimeout(() => setIsReloading(false), 400);
    } else {
      // First load: dynamically inject the Disqus embed script if not already present
      let script = document.getElementById('dsq-embed-scr') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'dsq-embed-scr';
        script.src = 'https://jasminep.disqus.com/embed.js';
        script.setAttribute('data-timestamp', String(+new Date()));
        script.async = true;

        script.onload = () => {
          setIsReloading(false);
        };
        script.onerror = () => {
          setIsReloading(false);
        };

        (document.head || document.body).appendChild(script);
      } else {
        // Script tag exists but DISQUS global is still initializing
        const pollInterval = window.setInterval(() => {
          if (typeof (window as any).DISQUS !== 'undefined') {
            window.clearInterval(pollInterval);
            try {
              (window as any).DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
            } catch (err) {
              console.warn('Disqus reset error:', err);
            }
            setIsReloading(false);
          }
        }, 120);

        window.setTimeout(() => {
          window.clearInterval(pollInterval);
          setIsReloading(false);
        }, 3500);
      }
    }
  }, [getDisqusConfig]);

  useEffect(() => {
    loadOrReloadDisqus();
  }, [loadOrReloadDisqus]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Talk to Us</h2>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                Community Board
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Share commuter insights, transit suggestions, report service delays, or ask questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            id="btn-reload-disqus"
            onClick={loadOrReloadDisqus}
            disabled={isReloading}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Reload discussion thread"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isReloading ? 'animate-spin' : ''}`} />
            <span>{isReloading ? 'Reloading...' : 'Reload Comments'}</span>
          </button>
        </div>
      </div>

      {/* Community Guidelines & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Transit Discussion</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Connect with fellow Singapore commuters on bus crowding, MRT transfers, and first/last train tips.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Feature Requests</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Tell us what stops, lines, or transport amenities you would like added to the hub.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Disqus Verified</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Sign in via Disqus, Google, or social profiles to post and receive email alerts on replies.
            </p>
          </div>
        </div>
      </div>

      {/* Disqus Thread Embed Container */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Discussion Feed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            ID: sg-transport-hub-talk-to-us
          </span>
        </div>

        {/* Disqus Thread DOM mount point */}
        <div id="disqus_thread" className="min-h-[380px] w-full"></div>
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-indigo-600 underline">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </div>
  );
};
