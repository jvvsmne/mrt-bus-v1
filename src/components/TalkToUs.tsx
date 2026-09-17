import React, { useState } from 'react';
import { DiscussionEmbed } from 'disqus-react';
import { MessageSquare, RefreshCw, ShieldCheck, Sparkles, HeartHandshake, ExternalLink } from 'lucide-react';

// Real fixed canonical configuration values for Disqus thread
const DISQUS_SHORTNAME = 'jasminep';
const DISQUS_PAGE_IDENTIFIER = 'sg-transport-hub-talk-to-us';
const DISQUS_PAGE_URL = 'https://jvvsmne.github.io/mrt-bus-v1/talk-to-us';
const DISQUS_PAGE_TITLE = 'Talk to Us - Singapore Transit Network & Live Community';

export function TalkToUs(): React.ReactElement {
  // Key to force complete remount/reload of the Disqus React component if requested
  const [threadKey, setThreadKey] = useState<number>(() => Date.now());
  const [isReloading, setIsReloading] = useState<boolean>(false);

  const handleManualReload = () => {
    setIsReloading(true);
    setThreadKey(Date.now());
    setTimeout(() => {
      setIsReloading(false);
    }, 600);
  };

  const disqusConfig = {
    url: DISQUS_PAGE_URL,
    identifier: DISQUS_PAGE_IDENTIFIER,
    title: DISQUS_PAGE_TITLE,
    language: 'en',
  };

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
                Share your daily commute feedback, report transit service delays, ask questions, or leave suggestions for the Singapore transit app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-reload-disqus"
              onClick={handleManualReload}
              disabled={isReloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
              title="Force reload comments thread"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Comments'}</span>
            </button>

            <a
              href="https://jasminep.disqus.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <span>Disqus Channel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Community Respect</div>
              <div className="text-[11px] text-slate-500">Keep discussions helpful, respectful, and focused on transit.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">Commuter Tips</div>
              <div className="text-[11px] text-slate-500">Share optimal transfer points, bus timings, and travel hacks.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">React Framework</div>
              <div className="text-[11px] text-slate-500">Integrated with official disqus-react SPA lifecycle hooks.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Thread Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-700">
            Thread Channel: <span className="font-mono text-indigo-600">{DISQUS_SHORTNAME}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ID: {DISQUS_PAGE_IDENTIFIER}
          </div>
        </div>

        {/* Official disqus-react DiscussionEmbed */}
        <div className="min-h-[380px]">
          <DiscussionEmbed
            key={threadKey}
            shortname={DISQUS_SHORTNAME}
            config={disqusConfig}
          />
        </div>

        {/* Fallback for noscript */}
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

