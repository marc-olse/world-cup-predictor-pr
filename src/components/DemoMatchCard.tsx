import { DemoPredictionForm } from '@/components/DemoPredictionForm';
import { countryFlag } from '@/lib/countries';
import { formatUkDate, formatUkKickoffTime, getFixtureMeta } from '@/lib/fixtures';
import type { Match } from '@/lib/types';

function TeamName({ name }: { name: string }) {
  return (
    <div className="grid min-w-0 justify-items-center gap-3 text-center">
      <div className="grid aspect-[1.55] w-full max-w-44 place-items-center rounded-lg border border-ink/10 bg-white text-5xl shadow-md sm:max-w-64 sm:text-8xl">
        {countryFlag(name)}
      </div>
      <div>
        <p className="break-words text-xl font-black uppercase text-ink sm:text-4xl">
          {name === 'United States' ? 'USA' : name}
        </p>
        <p className="mt-1 break-words text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink/45 sm:text-sm sm:tracking-[0.25em]">
          {name}
        </p>
      </div>
    </div>
  );
}

export function DemoMatchCard({ match }: { match: Match }) {
  const fixture = getFixtureMeta(match);

  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <div className="relative isolate px-4 py-7 sm:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,94,120,0.10),_transparent_36%),linear-gradient(135deg,_rgba(15,94,120,0.06),_transparent_18%),linear-gradient(315deg,_rgba(217,95,76,0.07),_transparent_22%)]" />
        <div className="absolute right-8 top-8 -z-10 text-7xl font-black text-ink/[0.03]">
          ★
        </div>

        <div className="grid justify-items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.36em] text-ink sm:tracking-[0.42em]">
            <span className="text-ink/35">★</span>
            <span>World Cup</span>
            <span className="text-ink/35">★</span>
          </div>

          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-6">
            <TeamName name={match.home_team} />
            <div className="grid justify-items-center gap-2">
              <div className="text-4xl font-black italic text-ink sm:text-7xl">VS</div>
              <span className="h-0.5 w-8 bg-ink/20 sm:w-12" />
            </div>
            <TeamName name={match.away_team} />
          </div>

          <div className="grid justify-items-center gap-5">
            <div className="flex items-center gap-3 text-[0.68rem] font-black uppercase tracking-[0.18em] text-ink/45 sm:gap-4 sm:text-sm sm:tracking-[0.28em]">
              <span className="h-0.5 w-8 bg-coral sm:w-12" />
              <span>Predict the score</span>
              <span className="h-0.5 w-8 bg-ocean sm:w-12" />
            </div>
            <DemoPredictionForm match={match} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-ink/10 bg-white/80 p-4 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/45">
              Kick-off
            </p>
            <p className="mt-1 text-xl font-black text-ink">
              {formatUkKickoffTime(match.kickoff_at)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/45">
              Date
            </p>
            <p className="mt-1 text-xl font-black text-ink">
              {formatUkDate(match.kickoff_at)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/45">
              Stadium
            </p>
            <p className="mt-1 text-xl font-black text-ink">
              {fixture?.venue ?? 'TBC'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="font-semibold text-ink/60">
            {fixture?.stage ?? 'World Cup'} · Prediction window{' '}
            <span className="text-ink">open</span>
          </div>
          <div className="font-semibold uppercase tracking-wide text-ocean">
            Demo prediction
          </div>
        </div>
      </div>
    </article>
  );
}
