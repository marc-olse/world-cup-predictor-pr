import { teamOptionLabel } from '@/lib/teams';

type TournamentPredictionEntry = {
  displayName: string;
  semiFinalists: string[];
  userId: string;
  winner: string | null;
};

function TeamPill({ matched, team }: { matched: boolean; team: string }) {
  return (
    <span
      className={
        matched
          ? 'rounded-full border border-turf/25 bg-turf/10 px-3 py-1 text-sm font-bold text-turf'
          : 'rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-sm font-semibold text-ink/45'
      }
    >
      {teamOptionLabel(team)}
    </span>
  );
}

export function TournamentPredictionsList({
  predictions,
  trueSemiFinalists,
  trueWinner,
}: {
  predictions: TournamentPredictionEntry[];
  trueSemiFinalists: string[];
  trueWinner: string | null;
}) {
  const trueSemiFinalistsSet = new Set(trueSemiFinalists);

  return (
    <section className="panel grid gap-4">
      <div>
        <h2 className="text-xl font-bold">Group semi-finalist predictions</h2>
        <p className="mt-1 text-sm text-ink/60">
          Matched semi-finalists are highlighted as results are confirmed.
        </p>
      </div>

      {predictions.length ? (
        <div className="grid gap-3">
          {predictions.map((prediction) => (
            <article
              className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm"
              key={prediction.userId}
            >
              <h3 className="font-black text-ink">{prediction.displayName}</h3>
              <div className="mt-3 grid gap-1">
                <p className="text-xs font-black uppercase tracking-wide text-ink/45">
                  Winner
                </p>
                {trueWinner && prediction.winner ? (
                  <TeamPill
                    matched={prediction.winner === trueWinner}
                    team={prediction.winner}
                  />
                ) : (
                  <span className="h-8 w-fit min-w-24 rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-sm font-semibold text-ink/35">
                    &nbsp;
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-ink/45">
                Semi-finalists
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {prediction.semiFinalists.length ? (
                  [...prediction.semiFinalists]
                    .sort((first, second) => first.localeCompare(second))
                    .map((team) => (
                      <TeamPill
                        key={team}
                        matched={trueSemiFinalistsSet.has(team)}
                        team={team}
                      />
                    ))
                ) : (
                  <p className="text-sm text-ink/45">No semi-finalists submitted.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/60">
          No tournament predictions have been submitted yet.
        </p>
      )}
    </section>
  );
}
