export function Notice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={
        error
          ? 'rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral'
          : 'rounded-md border border-turf/30 bg-turf/10 px-3 py-2 text-sm text-turf'
      }
    >
      {error ?? success}
    </div>
  );
}
