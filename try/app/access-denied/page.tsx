import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-6">
      <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-4xl text-rose-600">lock</span>
        <h1 className="mt-3 text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your role does not have permission to view this page. Ask your module administrator if access is required.
        </p>
        <Link href="/" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
