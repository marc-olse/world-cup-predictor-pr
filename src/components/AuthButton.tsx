import Link from 'next/link';

import { signout } from '@/actions/auth';
import { getUser } from '@/lib/auth';

export async function AuthButton() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link className="btn-secondary min-h-9 px-3 py-1.5" href="/login">
          Sign in
        </Link>
        <Link className="btn-primary min-h-9 px-3 py-1.5" href="/signup">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <form action={signout}>
      <button className="btn-secondary min-h-9 px-3 py-1.5" type="submit">
        Sign out
      </button>
    </form>
  );
}
