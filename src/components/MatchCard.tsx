import { PredictionForm } from '@/components/PredictionForm';
import { countryFlag } from '@/lib/countries';
import {
  formatUkKickoffTime,
  getFixtureMeta,
} from '@/lib/fixtures';
import type { Match, Prediction } from '@/lib/types';

function statusLabel(status: Match['status']) {
  return status[0].toUpperCase() + status.slice(1);
}

function TeamName({ name }: { name: string }) {
  return (
    <div className="grid min-w-0 justify-items-center gap-2 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-lg bg-white text-5xl shadow-sm ring-1 ring-ink/10 sm:h-24 sm:w-24 sm:text-6xl">
        {countryFlag(name)}
      </div>
      <p className="max-w-28 break-words text-sm font-black uppercase leading-tight text-ink sm:max-w-36 sm:text-base">
        {name === 'United States' ? 'USA' : name}
      </p>
    </div>
  );
}

export function MatchCard({
  match,
  prediction,
  showForm = false,
  forcePredictionOpen = false,
  returnTo = '/matches/today',
}: {
  match: Match;
  prediction?: Prediction | null;
  showForm?: boolean;
  forcePredictionOpen?: boolean;
  returnTo?: string;
}) {
  const hasFinalScore = match.home_score !== null && match.away_score !== null;
  const closed =
    !forcePredictionOpen && Date.now() >= new Date(match.kickoff_at).getTime();
  const fixture = getFixtureMeta(match);

  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-[#ededee] shadow-sm">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_1.5rem] items-center gap-2 border-b border-ink/10 bg-white/55 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-ink/65">
        <span aria-hidden="true" />
        <span className="min-w-0 text-center">
          {formatUkKickoffTime(match.kickoff_at)} | {fixture?.stage ?? 'World Cup'} |{' '}
          {fixture?.venue ?? 'TBC'}
        </span>
        <span aria-label={match.is_starred ? 'Star game' : undefined} className="text-right text-base leading-none">
          {match.is_starred ? '⭐' : null}
        </span>
      </div>
      <div className="grid gap-4 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
          <TeamName name={match.home_team} />
          <div className="grid justify-items-center gap-2 pt-1">
            {showForm ? (
              <PredictionForm
                forceOpen={forcePredictionOpen}
                match={match}
                prediction={prediction}
                returnTo={returnTo}
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="grid h-16 w-16 place-items-center rounded-lg border-2 border-ink/55 text-3xl font-black sm:h-20 sm:w-20 sm:text-4xl">
                  -
                </span>
                <span className="text-4xl font-black text-ink">:</span>
                <span className="grid h-16 w-16 place-items-center rounded-lg border-2 border-ink/55 text-3xl font-black sm:h-20 sm:w-20 sm:text-4xl">
                  -
                </span>
              </div>
            )}
          </div>
          <TeamName name={match.away_team} />
        </div>

        <div className="rounded-lg border-2 border-ink/55 bg-white/20 px-4 py-3 text-sm font-bold text-ink">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Result: {hasFinalScore ? `${match.home_score}-${match.away_score}` : 'Pending'}</span>
            <span className="uppercase tracking-wide text-ocean">{statusLabel(match.status)}</span>
          </div>
          <p className="mt-2 text-xs text-ink/55">
            Prediction window {closed ? 'closed' : 'open'}
          </p>
        </div>
      </div>
    </article>
  );
}
