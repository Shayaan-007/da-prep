import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="page-title">We can&apos;t find that page</h1>
      <p className="lead">The link may be out of date. Try one of these instead.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/interview" className="btn btn-secondary">
          Mock interview
        </Link>
        <Link href="/guide" className="btn btn-secondary">
          Process guide
        </Link>
      </div>
    </div>
  );
}
