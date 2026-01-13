import Link from "next/link";

export default function ImportProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100 p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline">
          ← กลับ Dashboard
        </Link>
        <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-white/70 backdrop-blur">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Import PDF
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">นำเข้าโครงการจากไฟล์ PDF</h1>
          <p className="text-sm text-slate-600">
            ระบบจะอ่านหัวข้อหลักและเติมข้อมูลให้ตามโครงสร้าง One Page
          </p>

          <form action="/api/projects/import" method="post" encType="multipart/form-data" className="mt-4 space-y-3">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">ไฟล์ PDF</div>
              <input
                name="file"
                type="file"
                accept="application/pdf"
                required
                className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
              />
            </label>
            <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 px-4 py-2 font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:brightness-110">
              นำเข้าและสร้างโครงการ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
