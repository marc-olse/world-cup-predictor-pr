'use client';

import { useEffect, useState } from 'react';

const MAX_TIMEOUT = 2_147_483_647;

export function useKickoffLock(kickoffAt: string) {
  const kickoffTime = new Date(kickoffAt).getTime();
  const [locked, setLocked] = useState(() => Date.now() >= kickoffTime);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleLock() {
      const remaining = kickoffTime - Date.now();

      if (remaining <= 0) {
        setLocked(true);
        return;
      }

      timer = setTimeout(scheduleLock, Math.min(remaining + 25, MAX_TIMEOUT));
    }

    setLocked(Date.now() >= kickoffTime);
    scheduleLock();

    return () => clearTimeout(timer);
  }, [kickoffTime]);

  return locked;
}
