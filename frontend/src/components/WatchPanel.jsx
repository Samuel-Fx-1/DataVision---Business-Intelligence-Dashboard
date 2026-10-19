import { ExternalLink, Flag, Globe, MonitorPlay, RefreshCw, ShieldCheck } from 'lucide-react';
import { useWatchOptions } from '../hooks/useWatchOptions';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';

const TYPE_LABEL = {
  tv: 'TV',
  streaming: 'Streaming',
  'free-to-air': 'Free-to-air TV',
  'official-youtube': 'Official YouTube',
};

const teamName = (t) => (typeof t === 'string' ? t : t?.name || '');

function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function statusText(match) {
  const s = match.status || {};
  if (match.phase === 'live') {
    if (s.code === 'HT') return 'Half time';
    if (s.minute != null) return `${s.minute}${s.extra ? `+${s.extra}` : ''}\u2032`;
    return 'Live';
  }
  if (match.phase === 'finished') return 'Full time';
  if (match.phase === 'postponed') return 'Postponed';
  if (match.phase === 'cancelled') return 'Cancelled';
  if (match.kickoff) {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(match.kickoff));
  }
  return 'Not started';
}

function MatchHeader({ match }) {
  const hasScore = match.score && match.score.home != null && match.score.away != null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{match.competitionName || match.league?.name}</span>
        <span className={match.isLive ? 'flex items-center gap-1.5 font-semibold text-red-400' : ''}>
          {match.isLive && <span className="h-2 w-2 animate-pulse rounded-full bg-red-400 motion-reduce:animate-none" aria-hidden="true" />}
          {statusText(match)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-right font-semibold text-slate-100">{teamName(match.homeTeam)}</p>
        <p className="shrink-0 rounded-lg bg-slate-950/60 px-3 py-1 text-lg font-bold tabular-nums text-white">
          {hasScore ? `${match.score.home} - ${match.score.away}` : 'vs'}
        </p>
        <p className="min-w-0 flex-1 truncate font-semibold text-slate-100">{teamName(match.awayTeam)}</p>
      </div>
    </div>
  );
}

function CountryPicker({ country, available, onChange }) {
  const codes = [...new Set([...(available || []), ...(country ? [country] : [])])];
  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
      <label htmlFor="watch-country" className="text-sm text-slate-300">
        Broadcasters in
      </label>
      <select
        id="watch-country"
        value={country || ''}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        {!country && <option value="">Choose your country</option>}
        {codes.map((code) => (
          <option key={code} value={code}>
            {countryName(code)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProviderRow({ provider }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-100">{provider.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">{TYPE_LABEL[provider.type] || 'TV'}</span>
          <span
            className={`rounded-full px-2 py-0.5 ${provider.requiresSubscription ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}
          >
            {provider.requiresSubscription ? 'Subscription needed' : 'Free to watch'}
          </span>
        </div>
        {provider.notes && <p className="mt-1.5 text-sm text-slate-400">{provider.notes}</p>}
      </div>
      {provider.url ? (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        >
          Open official site
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : (
        <span className="shrink-0 text-sm text-slate-500">Official link not added yet</span>
      )}
    </li>
  );
}

function OfficialEmbed({ provider }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-emerald-300">
        <ShieldCheck size={16} aria-hidden="true" />
        Official free stream from {provider.name}
      </p>
      <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
        <iframe
          title={`${provider.name} official stream`}
          src={provider.embedUrl}
          className="h-full w-full"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading broadcasters">
      <div className="h-9 animate-pulse rounded-lg bg-white/5 motion-reduce:animate-none" />
      <div className="h-16 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
      <div className="h-16 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
    </div>
  );
}

function Notice({ title, children, action }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="font-medium text-slate-100">{title}</p>
      {children && <p className="mt-1 text-sm text-slate-400">{children}</p>}
      {action}
    </div>
  );
}

/** Pure view: easy to test and to preview with fake data. */
export function WatchPanelView({ match, loading, error, data, country, setCountry, reload }) {
  if (!match) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <MonitorPlay size={44} className="text-slate-500" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold text-slate-100">No match selected</h3>
        <p className="mt-1 text-sm text-slate-400">Pick a match to see where to watch it in your country.</p>
      </div>
    );
  }

  const providers = data?.providers || [];
  const embedProvider = providers.find((p) => p.embedUrl);
  const verified = data?.lastVerifiedAt ? new Date(data.lastVerifiedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null;

  let body;
  if (error) {
    body = (
      <Notice
        title="We could not load broadcaster details"
        action={
          <button
            type="button"
            onClick={reload}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try again
          </button>
        }
      >
        {error}
      </Notice>
    );
  } else if (loading || !data) {
    body = <Skeleton />;
  } else {
    body = (
      <>
        <CountryPicker country={country} available={data.availableCountries} onChange={setCountry} />
        {!country && <Notice title="Choose your country">Broadcasters differ by country. Pick yours above.</Notice>}
        {country && !data.found && (
          <Notice title={`No official broadcaster listed for ${countryName(country)} yet`}>
            {data.availableCountries.length > 1
              ? 'Try another country, or check the league’s official website.'
              : 'Check the league’s official website for where this match is shown.'}
          </Notice>
        )}
        {data.found && (
          <>
            {embedProvider && <OfficialEmbed provider={embedProvider} />}
            <ul className="space-y-2">
              {providers.map((p) => (
                <ProviderRow key={`${p.name}-${p.type}`} provider={p} />
              ))}
            </ul>
            {verified && <p className="text-xs text-slate-500">Last checked {verified}</p>}
          </>
        )}
      </>
    );
  }

  const reportHref = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Report a link: ${teamName(match.homeTeam)} v ${teamName(match.awayTeam)}`)}`
    : null;

  return (
    <div className="space-y-4" aria-live="polite">
      <MatchHeader match={match} />
      {body}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-500">
        <p>Links go to each broadcaster’s official site. PitchCast does not host or restream matches.</p>
        {reportHref && (
          <a href={reportHref} className="inline-flex items-center gap-1 text-slate-400 underline hover:text-slate-200">
            <Flag size={12} aria-hidden="true" />
            Report a link
          </a>
        )}
      </div>
    </div>
  );
}

/** Drop-in replacement for the old VideoPlayer / IframePlayer block. */
export default function WatchPanel({ match }) {
  const state = useWatchOptions(match?.id);
  return <WatchPanelView match={match} {...state} />;
}
