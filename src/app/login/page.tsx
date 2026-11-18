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
    <div className="mx-auto max-w-sm">
      <form action={login} className="card space-y-4">
        <h1 className="text-xl font-bold">Organizer sign in</h1>
        <p className="text-sm text-slate-600">
          Organizers can create tournaments and manage teams. Everyone else can view without signing in.
        </p>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        {error && <p className="text-sm text-red-600">That password isn&apos;t right.</p>}
        <button className="btn w-full">Sign in</button>
      </form>
    </div>
  );
}
