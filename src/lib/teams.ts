import { countryFlag } from '@/lib/countries';
import { worldCupFixtures } from '@/lib/fixtures';

function isPlaceholderTeam(name: string) {
  return (
    name.startsWith('Group ') ||
    name.startsWith('Match ') ||
    name.includes('third place') ||
    name.includes('winners') ||
    name.includes('runners-up') ||
    name.includes('losers')
  );
}

export const tournamentTeams = Array.from(
  new Set(
    worldCupFixtures
      .flatMap((fixture) => [fixture.homeTeam, fixture.awayTeam])
      .filter((team) => !isPlaceholderTeam(team)),
  ),
).sort((first, second) => first.localeCompare(second));

export function teamOptionLabel(team: string) {
  return `${countryFlag(team)} ${team}`;
}
