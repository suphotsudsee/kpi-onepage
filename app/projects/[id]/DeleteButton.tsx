"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!confirm("ลบโครงการนี้ใช่หรือไม่?")) {
          event.preventDefault();
        }
      }}
      className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:brightness-110"
    >
      ลบ
    </button>
  );
}
