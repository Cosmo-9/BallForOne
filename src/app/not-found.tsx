import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center gap-3 text-center">
      <h1 className="h-display text-4xl">Not found</h1>
      <p className="text-muted">That page doesn&apos;t exist, or it was deleted.</p>
      <Link href="/" className="btn mt-2">
        Back to tournaments
      </Link>
    </div>
  );
}
