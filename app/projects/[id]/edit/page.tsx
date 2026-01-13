import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import KpiEditor from "./KpiEditor";

function toDateInput(value: Date) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();
  const projectId: string = id;

  const p = await db.project.findUnique({ where: { id: projectId }, include: { kpis: true } });
  if (!p) return notFound();
  const project = p;

  async function updateProject(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const ownerName = String(formData.get("ownerName") || "").trim();
    const department = String(formData.get("department") || "").trim();
    const fiscalYear = Number(formData.get("fiscalYear") || project.fiscalYear);
    const status = String(formData.get("status") || project.status);
    const progress = Number(formData.get("progress") || project.progress);
    const budget = Number(formData.get("budget") || project.budget);
    const startDate = new Date(String(formData.get("startDate") || project.startDate.toISOString()));
    const endDate = new Date(String(formData.get("endDate") || project.endDate.toISOString()));

    const objective = String(formData.get("objective") || "").trim();
    const targetGroup = String(formData.get("targetGroup") || "").trim();
    const outcomes = String(formData.get("outcomes") || "").trim();
    const risks = String(formData.get("risks") || "").trim();
    const mitigation = String(formData.get("mitigation") || "").trim();
    const timelineNote = String(formData.get("timelineNote") || "").trim();

    const rowCount = Number(formData.get("kpiRows") || 0);
    const kpiUpdates: Prisma.PrismaPromise<unknown>[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      const idValue = String(formData.get(`kpi_id_${i}`) || "").trim();
      const nameValue = String(formData.get(`kpi_name_${i}`) || "").trim();
      const targetValue = Number(formData.get(`kpi_target_${i}`) || 0);
      const actualValue = Number(formData.get(`kpi_actual_${i}`) || 0);
      const unitValue = String(formData.get(`kpi_unit_${i}`) || "").trim();
      const weightValue = Number(formData.get(`kpi_weight_${i}`) || 1);
      const shouldDelete = formData.get(`kpi_delete_${i}`) === "on";

      if (idValue) {
        if (shouldDelete) {
          kpiUpdates.push(db.kPI.deleteMany({ where: { id: idValue, projectId } }));
          continue;
        }
        if (!nameValue) continue;
        kpiUpdates.push(
          db.kPI.update({
            where: { id: idValue },
            data: {
              name: nameValue,
              target: targetValue,
              actual: actualValue,
              unit: unitValue || null,
              weight: weightValue,
            },
          }),
        );
        continue;
      }

      if (!nameValue) continue;
      kpiUpdates.push(
        db.kPI.create({
          data: {
            projectId,
            name: nameValue,
            target: targetValue,
            actual: actualValue,
            unit: unitValue || null,
            weight: weightValue,
          },
        }),
      );
    }

    await db.$transaction([
      db.project.update({
        where: { id: projectId },
        data: {
          name,
          ownerName,
          department,
          fiscalYear,
          status: status as typeof project.status,
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
      }),
      ...kpiUpdates,
    ]);

    redirect(`/projects/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-rose-100 to-amber-100 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href={`/projects/${projectId}`} className="text-sm font-medium text-slate-600 underline">
          ← กลับรายละเอียดโครงการ
        </Link>
        <div className="rounded-2xl bg-white/85 p-6 shadow-lg ring-1 ring-white/70 backdrop-blur">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Edit Project
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">แก้ไขโครงการ</h1>
          <form action={updateProject} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="ชื่อโครงการ" name="name" defaultValue={p.name} />
            <Field label="ผู้รับผิดชอบ" name="ownerName" defaultValue={p.ownerName} />
            <Field label="หน่วยงาน" name="department" defaultValue={p.department} />
            <Field label="ปีงบประมาณ" name="fiscalYear" defaultValue={String(p.fiscalYear)} />
            <Select
              label="สถานะ"
              name="status"
              defaultValue={p.status}
              options={[
                { value: "ON_TRACK", label: "ตามแผน" },
                { value: "AT_RISK", label: "เสี่ยง" },
                { value: "DELAYED", label: "ล่าช้า" },
                { value: "DONE", label: "เสร็จสิ้น" },
              ]}
            />
            <Field label="ความคืบหน้า (%)" name="progress" defaultValue={String(p.progress)} />
            <Field label="งบประมาณ" name="budget" defaultValue={String(p.budget)} />
            <Field label="วันเริ่มต้น" name="startDate" type="date" defaultValue={toDateInput(p.startDate)} />
            <Field label="วันสิ้นสุด" name="endDate" type="date" defaultValue={toDateInput(p.endDate)} />
            <TextArea label="วัตถุประสงค์" name="objective" defaultValue={p.objective ?? ""} />
            <TextArea label="กลุ่มเป้าหมาย" name="targetGroup" defaultValue={p.targetGroup ?? ""} />
            <TextArea label="ผลลัพธ์ที่คาดหวัง" name="outcomes" defaultValue={p.outcomes ?? ""} />
            <TextArea label="ความเสี่ยง/อุปสรรค" name="risks" defaultValue={p.risks ?? ""} />
            <TextArea label="แผนจัดการความเสี่ยง" name="mitigation" defaultValue={p.mitigation ?? ""} />
            <TextArea label="หมายเหตุกรอบเวลา/วิธีดำเนินการ" name="timelineNote" defaultValue={p.timelineNote ?? ""} />
            <KpiEditor kpis={p.kpis} />
            <div className="md:col-span-2">
              <button className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2 font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:brightness-110">
                บันทึกการแก้ไข
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
