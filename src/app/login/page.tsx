import { login } from '@/actions/auth';
import { Notice } from '@/components/Notice';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto grid max-w-md gap-5">
      <div>
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-ink/60">Use your email and password.</p>
      </div>
      <Notice error={params.error} success={params.notice} />
      <form action={login} className="panel grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input autoComplete="email" className="field" name="email" required type="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Password
          <input
            autoComplete="current-password"
            className="field"
            name="password"
            required
            type="password"
          />
        </label>
        <button className="btn-primary" type="submit">
          Sign in
        </button>
      </form>
    </section>
  );
}
