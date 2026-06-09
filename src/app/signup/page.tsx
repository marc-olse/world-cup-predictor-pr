import { signup } from '@/actions/auth';
import { Notice } from '@/components/Notice';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto grid max-w-md gap-5">
      <div>
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-ink/60">Pick a display name for the leaderboard.</p>
      </div>
      <Notice error={params.error} />
      <form action={signup} className="panel grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Display name
          <input
            autoComplete="name"
            className="field"
            name="displayName"
            required
            type="text"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input autoComplete="email" className="field" name="email" required type="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Password
          <input
            autoComplete="new-password"
            className="field"
            minLength={6}
            name="password"
            required
            type="password"
          />
        </label>
        <button className="btn-primary" type="submit">
          Sign up
        </button>
      </form>
    </section>
  );
}
