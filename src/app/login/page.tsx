import { redirect } from "next/navigation";
import { login } from "../actions";
import { isOrganizer } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isOrganizer()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-6">
      <div>
        <p className="eyebrow text-lime">Sports reps</p>
        <h1 className="h-display mt-2 text-[40px]">Rep sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Reps create tournaments, add teams and update scores. Everyone else can follow along without signing in.
        </p>
      </div>
      <form action={login} className="card flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        {error && <p className="text-sm text-red-400">That password isn&apos;t right.</p>}
        <button className="btn w-full">Sign in</button>
      </form>
    </div>
  );
}
