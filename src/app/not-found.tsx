import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="text-xl font-bold">Not found</h1>
      <p className="mt-1 text-slate-600">That page doesn&apos;t exist (or was deleted).</p>
      <Link href="/" className="btn mt-4">
        Back to tournaments
      </Link>
    </div>
  );
}
