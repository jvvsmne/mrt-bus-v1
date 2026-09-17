import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, ShieldCheck, Sparkles, HelpCircle, HeartHandshake } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: (this: {
      page: {
        url?: string;
        identifier?: string;
        title?: string;
      };
    }) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            url?: string;
            identifier?: string;
            title?: string;
          };
        }) => void;
      }) => void;
    };
  }
}

// Canonical values for Disqus thread
const DISQUS_PAGE_IDENTIFIER = 'sg-transport-hub-talk-to-us';
const DISQUS_SHORTNAME_URL = 'https://jasminep.disqus.com/embed.js';

export function TalkToUs(): React.ReactElement {
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Derive fixed canonical URL based on window location or domain
  const getPageUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/talk-to-us`;
    }
    return 'https://sg-transport-hub.chemistryteam.com/talk-to-us';
  };

  const loadOrReloadDisqus = () => {
    setIsResetting(true);
    setLoadError(null);

    const pageUrl = getPageUrl();
    const pageIdentifier = DISQUS_PAGE_IDENTIFIER;

    try {
      if (typeof window !== 'undefined' && window.DISQUS) {
        // SPA reload: call DISQUS.reset with updated configuration
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = pageIdentifier;
            this.page.url = pageUrl;
            this.page.title = 'Talk to Us - Singapore Transit Network';
          },
        });
        setTimeout(() => setIsResetting(false), 400);
      } else {
        // Initial setup: configure global disqus_config and inject script
        window.disqus_config = function () {
          this.page.url = pageUrl;
          this.page.identifier = pageIdentifier;
          this.page.title = 'Talk to Us - Singapore Transit Network';
        };

        const existingScript = document.getElementById('disqus-embed-script') as HTMLScriptElement | null;
        if (!existingScript) {
          const d = document;
          const s = d.createElement('script');
          s.id = 'disqus-embed-script';
          s.src = DISQUS_SHORTNAME_URL;
          s.setAttribute('data-timestamp', String(+new Date()));
          s.async = true;
          s.onload = () => {
            setIsResetting(false);
          };
          s.onerror = () => {
            setIsResetting(false);
            setLoadError('Disqus could not be loaded. Please ensure third-party cookies/scripts are allowed.');
          };
          (d.head || d.body).appendChild(s);
        } else {
          // If script element exists but DISQUS is not ready yet, listen for load
          existingScript.addEventListener('load', () => {
            if (window.DISQUS) {
              window.DISQUS.reset({
                reload: true,
                config: function () {
                  this.page.identifier = pageIdentifier;
                  this.page.url = pageUrl;
                  this.page.title = 'Talk to Us - Singapore Transit Network';
                },
              });
            }
            setIsResetting(false);
          });
          setTimeout(() => setIsResetting(false), 500);
        }
      }
    } catch (err) {
      console.error('Failed to load or reset Disqus:', err);
      setIsResetting(false);
    }
  };

  useEffect(() => {
    // Ensure #disqus_thread is mounted in DOM before initializing
    const timer = setTimeout(() => {
      loadOrReloadDisqus();
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div id="talk-to-us-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Talk to Us & Community Discussion
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  Live Forum
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Share your daily commute feedback, report transport service updates, ask commuter questions, or leave suggestions for our team.
              </p>
            </div>
          </div>

          <button
            id="btn-reload-disqus"
            onClick={loadOrReloadDisqus}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            title="Reload comments thread"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isResetting ? 'Reloading...' : 'Reload Comments'}</span>
          </button>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Community Respect</div>
              <div className="text-[11px] text-slate-500">Keep feedback constructive and civil for all commuters.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Transit Inquiries</div>
              <div className="text-[11px] text-slate-500">Discuss MRT/LRT delays, bus arrival observations & route tips.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Real-Time Sync</div>
              <div className="text-[11px] text-slate-500">Powered by Disqus universal discussion infrastructure.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Thread Area */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        {loadError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Required Disqus Container */}
        <div id="disqus_thread" className="min-h-[360px]" />

        {/* Fallback for disabled JavaScript */}
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" rel="noreferrer" target="_blank">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </div>
  );
}
