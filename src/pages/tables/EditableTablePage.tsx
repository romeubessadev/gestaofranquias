import { useState } from "react";
import { Badge, Card, PageHeader, useToast } from "@/components/ui";
import { employees } from "./data";

interface EditableRow {
  id: number;
  name: string;
  role: string;
  dept: string;
  salary: string;
  status: string;
}

const initialRows: EditableRow[] = employees.slice(0, 6).map(({ id, name, role, dept, salary, status }) => ({
  id,
  name,
  role,
  dept,
  salary,
  status,
}));

type EditableField = "role" | "dept" | "salary";

export function EditableTablePage() {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<{ id: number; field: EditableField } | null>(null);
  const [draft, setDraft] = useState("");
  const toast = useToast();

  function startEdit(id: number, field: EditableField, current: string) {
    setEditing({ id, field });
    setDraft(current);
  }

  function commit() {
    if (!editing) return;
    setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, [editing.field]: draft } : r)));
    setEditing(null);
    toast.show("Cell updated", "success");
  }

  function cancel() {
    setEditing(null);
  }

  function cell(row: EditableRow, field: EditableField) {
    const isEditing = editing?.id === row.id && editing.field === field;
    if (isEditing) {
      return (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="w-full rounded-lg border border-acc bg-bg-inset px-2.5 py-1.5 text-[13px] text-t0 outline-none"
        />
      );
    }
    return (
      <button
        onClick={() => startEdit(row.id, field, row[field])}
        className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-t1 hover:bg-bg-3 hover:text-t0"
        title="Click to edit"
      >
        {row[field]}
      </button>
    );
  }

  return (
    <div>
      <PageHeader title="Editable Tables" subtitle="Inline cell editing with save/discard" />
      <Card>
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-acc-soft px-3.5 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
          </svg>
          <span className="text-[13px] font-semibold text-acc">
            Click any Role, Department or Salary cell to edit inline. Press Enter to save, Escape to discard.
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-2 border-line">
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Name</th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Role</th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Department</th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Salary</th>
                <th className="px-3.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-t2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-bg-3/50">
                  <td className="px-3.5 py-2 text-[13.5px] font-bold text-t0">{r.name}</td>
                  <td className="px-1.5 py-2">{cell(r, "role")}</td>
                  <td className="px-1.5 py-2">{cell(r, "dept")}</td>
                  <td className="px-1.5 py-2">{cell(r, "salary")}</td>
                  <td className="px-3.5 py-2 text-center">
                    <Badge status={r.status}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
