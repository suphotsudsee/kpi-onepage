"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-gradient-to-r from-slate-900 via-indigo-700 to-fuchsia-700 px-5 py-2 text-white shadow-lg shadow-fuchsia-600/20 transition hover:brightness-110"
    >
      Print / Save PDF
    </button>
  );
}
