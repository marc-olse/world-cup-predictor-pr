import fixtures from '@/data/world-cup-fixtures.json';
import type { Match } from '@/lib/types';

export type WorldCupFixture = {
  kickoffAt: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
};

const sourceFixtures = fixtures as WorldCupFixture[];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const worldCupFixtures = sourceFixtures.map((fixture, index) => ({
  ...fixture,
  id: `wc-2026-${String(index + 1).padStart(3, '0')}-${slugify(
    `${fixture.homeTeam}-${fixture.awayTeam}`,
  )}`,
}));

export function fixtureToMatch(fixture: (typeof worldCupFixtures)[number]): Match {
  return {
    id: fixture.id,
    source_id: fixture.id,
    kickoff_at: fixture.kickoffAt,
    home_team: fixture.homeTeam,
    away_team: fixture.awayTeam,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    created_at: '2026-06-09T00:00:00.000Z',
    updated_at: '2026-06-09T00:00:00.000Z',
  };
}

export function getFixtureMeta(
  match: Pick<Match, 'id' | 'home_team' | 'away_team' | 'kickoff_at'> & {
    source_id?: string | null;
  },
) {
  return worldCupFixtures.find(
    (fixture) =>
      fixture.id === match.id ||
      fixture.id === match.source_id ||
      (fixture.homeTeam === match.home_team &&
        fixture.awayTeam === match.away_team &&
        fixture.kickoffAt === match.kickoff_at),
  );
}

export function getStaticMatches() {
  return worldCupFixtures.map(fixtureToMatch);
}

export function formatUkDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Europe/London',
  }).format(new Date(value));
}

export function formatUkDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  }).format(new Date(value));
}

export function formatUkKickoffTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
    timeZoneName: 'short',
  }).format(new Date(value));
}

export function getUkDateKey(value: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/London',
    year: 'numeric',
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getCurrentUkScheduleWindow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/London',
    year: 'numeric',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  const dateKey = `${part('year')}-${part('month')}-${part('day')}`;
  const start = new Date(`${dateKey}T09:00:00+01:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    end,
    label: formatUkDate(start.toISOString()),
    start,
  };
}

export function groupMatchesByUkDate<T extends Pick<Match, 'kickoff_at'>>(matches: T[]) {
  return matches.reduce<Array<{ dateKey: string; label: string; matches: T[] }>>(
    (groups, match) => {
      const dateKey = getUkDateKey(match.kickoff_at);
      const group = groups.find((item) => item.dateKey === dateKey);

      if (group) {
        group.matches.push(match);
      } else {
        groups.push({
          dateKey,
          label: formatUkDate(match.kickoff_at),
          matches: [match],
        });
      }

      return groups;
    },
    [],
  );
}
