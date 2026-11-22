import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-[#1a1c1a] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#002e03] text-white flex items-center justify-center font-display text-2xl mb-6 shadow-md">
        404
      </div>
      <h1 className="text-3xl font-bold font-display uppercase tracking-tight text-[#001601] mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-[#42493f] max-w-md mb-6">
        The requested operations view or resource could not be found in the SunPower portal.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#002e03] hover:bg-[#003d04] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
      >
        Return to Portal
      </Link>
    </div>
  );
}
