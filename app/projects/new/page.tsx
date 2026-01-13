import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewProjectPage() {
  async function create(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const ownerName = String(formData.get("ownerName") || "").trim();
    const department = String(formData.get("department") || "").trim();
    const fiscalYear = Number(formData.get("fiscalYear") || 2569);
    const status = String(formData.get("status") || "ON_TRACK");
    const progress = Number(formData.get("progress") || 0);
    const budget = Number(formData.get("budget") || 0);
    const startDateValue = String(formData.get("startDate") || "");
    const endDateValue = String(formData.get("endDate") || "");
    const objective = String(formData.get("objective") || "").trim();
    const targetGroup = String(formData.get("targetGroup") || "").trim();
    const outcomes = String(formData.get("outcomes") || "").trim();
    const risks = String(formData.get("risks") || "").trim();
    const mitigation = String(formData.get("mitigation") || "").trim();
    const timelineNote = String(formData.get("timelineNote") || "").trim();

    if (!name || !ownerName || !department) return;

    const startDate = startDateValue ? new Date(startDateValue) : new Date();
    const endDate = endDateValue
      ? new Date(endDateValue)
      : new Date(new Date().setMonth(new Date().getMonth() + 6));

    const p = await db.project.create({
      data: {
        name,
        ownerName,
        department,
        fiscalYear,
        status: status as "ON_TRACK" | "AT_RISK" | "DELAYED" | "DONE",
        progress,
        budget,
        startDate,
        endDate,
        objective: objective || null,
        targetGroup: targetGroup || null,
        outcomes: outcomes || null,
        risks: risks || null,
        mitigation: mitigation || null,
        timelineNote: timelineNote || null,
      },
    });

    redirect(`/projects/${p.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-rose-100 to-amber-100 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline">
          ← กลับ Dashboard
        </Link>
        <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-white/70 backdrop-blur">
        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          New Project
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">เพิ่มโครงการ</h1>
        <p className="text-sm text-slate-600">กรอกข้อมูลหลักเพื่อสร้างโครงการใหม่</p>
        <form action={create} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="ชื่อโครงการ" name="name" />
          <Field label="ผู้รับผิดชอบ" name="ownerName" />
          <Field label="หน่วยงาน" name="department" />
          <Field label="ปีงบประมาณ" name="fiscalYear" defaultValue="2569" />
          <Select
            label="สถานะ"
            name="status"
            defaultValue="ON_TRACK"
            options={[
              { value: "ON_TRACK", label: "ตามแผน" },
              { value: "AT_RISK", label: "เสี่ยง" },
              { value: "DELAYED", label: "ล่าช้า" },
              { value: "DONE", label: "เสร็จสิ้น" },
            ]}
          />
          <Field label="ความคืบหน้า (%)" name="progress" defaultValue="0" />
          <Field label="งบประมาณ" name="budget" defaultValue="0" />
          <Field label="วันเริ่มต้น" name="startDate" type="date" />
          <Field label="วันสิ้นสุด" name="endDate" type="date" />
          <TextArea label="วัตถุประสงค์" name="objective" />
          <TextArea label="กลุ่มเป้าหมาย" name="targetGroup" />
          <TextArea label="ผลลัพธ์ที่คาดหวัง" name="outcomes" />
          <TextArea label="ความเสี่ยง/อุปสรรค" name="risks" />
          <TextArea label="แผนจัดการความเสี่ยง" name="mitigation" />
          <TextArea label="หมายเหตุกรอบเวลา/วิธีดำเนินการ" name="timelineNote" />
          <div className="md:col-span-2">
            <button className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2 font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:brightness-110">
              บันทึก
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block md:col-span-2">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300"
      />
    </label>
  );
}
