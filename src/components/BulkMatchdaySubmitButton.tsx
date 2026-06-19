'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { submitMatchdayPredictions } from '@/actions/predictions';

function buildSummary(result: {
  closed: number;
  invalid: number;
  saved: number;
  skipped: number;
}) {
  if (result.saved > 0) {
    return `Saved ${result.saved} prediction${result.saved === 1 ? '' : 's'}.`;
  }

  if (result.invalid > 0) {
    return 'Complete both scores before submitting all predictions.';
  }

  if (result.closed > 0) {
    return 'Some games have already started.';
  }

  return 'No predictions to submit yet.';
}

export function BulkMatchdaySubmitButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function submitAllPredictions() {
    const formData = new FormData();
    const matchIds = new Set<string>();
    const inputs = document.querySelectorAll<HTMLInputElement>(
      'input[data-bulk-match-id][data-bulk-score-side]',
    );

    inputs.forEach((input) => {
      if (input.disabled || input.value === '') {
        return;
      }

      const matchId = input.dataset.bulkMatchId;
      const side = input.dataset.bulkScoreSide;

      if (!matchId || !side) {
        return;
      }

      matchIds.add(matchId);
      formData.set(
        `${side === 'home' ? 'predictedHomeScore' : 'predictedAwayScore'}:${matchId}`,
        input.value,
      );
    });

    matchIds.forEach((matchId) => formData.append('matchId', matchId));

    startTransition(async () => {
      try {
        const result = await submitMatchdayPredictions(formData);
        setMessage(buildSummary(result));

        if (result.saved > 0) {
          router.refresh();
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not save predictions.');
      }
    });
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">Ready for the full matchday?</p>
          <p className="text-xs text-ink/55">Fill the scores below, then save them together.</p>
        </div>
        <button
          className="btn border border-emerald-700/20 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 disabled:bg-ink/[0.08] disabled:text-ink/55 disabled:opacity-100"
          disabled={isPending}
          onClick={submitAllPredictions}
          type="button"
        >
          {isPending ? 'Saving...' : 'Submit all'}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-semibold text-ink/65">{message}</p> : null}
    </div>
  );
}
