import { DemoPredictionForm } from '@/components/DemoPredictionForm';
import { countryFlag } from '@/lib/countries';
import { formatUkKickoffTime, getFixtureMeta } from '@/lib/fixtures';
import type { Match } from '@/lib/types';

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

export function DemoMatchCard({ match }: { match: Match }) {
  const fixture = getFixtureMeta(match);

  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-[#ededee] shadow-sm">
      <div className="border-b border-ink/10 bg-white/55 px-3 py-3 text-center text-[0.58rem] font-black uppercase tracking-normal text-ink/65 sm:px-4 sm:text-xs sm:tracking-[0.12em]">
        <p className="truncate whitespace-nowrap">
        {formatUkKickoffTime(match.kickoff_at)} | {fixture?.stage ?? 'World Cup'} |{' '}
        {fixture?.venue ?? 'TBC'}
        </p>
      </div>
      <div className="grid gap-4 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
          <TeamName name={match.home_team} />
          <div className="pt-1">
            <DemoPredictionForm match={match} />
          </div>
          <TeamName name={match.away_team} />
        </div>

        <div className="rounded-lg border-2 border-ink/55 bg-white/20 px-4 py-3 text-sm font-bold text-ink">
          Demo prediction
        </div>
      </div>
    </article>
  );
}
