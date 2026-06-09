import { DemoPredictionForm } from '@/components/DemoPredictionForm';
import { countryFlag } from '@/lib/countries';
import type { Match } from '@/lib/types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatKickoffTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

function TeamName({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="text-3xl leading-none">
        {countryFlag(name)}
      </span>
      <span>{name}</span>
    </span>
  );
}

export function DemoMatchCard({ match }: { match: Match }) {
  return (
    <article className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink/60">{formatDateTime(match.kickoff_at)}</p>
          <h2 className="mt-2 flex flex-wrap items-center gap-3 text-xl font-bold">
            <TeamName name={match.home_team} />
            <span className="text-base text-ink/35">vs</span>
            <TeamName name={match.away_team} />
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-gold/15 px-3 py-2 text-sm font-bold text-ink">
            Kick-off {formatKickoffTime(match.kickoff_at)}
          </span>
          <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean">
            Demo
          </span>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink/55">Final score</dt>
          <dd className="font-semibold">Not entered</dd>
        </div>
        <div>
          <dt className="text-ink/55">Your prediction</dt>
          <dd className="font-semibold">Local only</dd>
        </div>
        <div>
          <dt className="text-ink/55">Prediction window</dt>
          <dd className="font-semibold">Open</dd>
        </div>
      </dl>
      <DemoPredictionForm match={match} />
    </article>
  );
}
