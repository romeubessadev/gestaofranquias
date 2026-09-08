import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Breadcrumbs, Button, Card, CardTitle, FormField, Input, Select, Textarea, useToast } from "@/components/ui";
import { paths } from "@/router/paths";
import { projects } from "@/data/projects";
import { Icon, icons } from "./Icons";

const teamPick = ["Marcus Liu", "Elena Park", "David Stone", "Priya Nair", "Omar Haddad", "Sofia Rossi"];
const priorities = ["Low", "Medium", "High"] as const;

export function CreateEditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const existing = useMemo(() => projects.find((p) => p.id === id) ?? (isEdit ? projects[0] : undefined), [id, isEdit]);

  const [selected, setSelected] = useState<string[]>(existing?.team ?? []);
  const [priority, setPriority] = useState<string>(existing?.priority ?? "Medium");

  function toggleMember(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]));
  }

  function handleSave() {
    toast.show(isEdit ? "Project changes saved." : "Project created.", "success");
    navigate(paths.projects.list);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button variant="secondary" size="sm" icon={<Icon d={icons.arrowLeft} size={14} />} onClick={() => navigate(paths.projects.list)}>
            Back
          </Button>
          <div>
            <Breadcrumbs items={[{ label: "Projects", to: paths.projects.list }, { label: isEdit ? "Edit" : "Create" }]} />
            <h1 className="mt-1 text-xl font-extrabold text-t0 sm:text-2xl">
              {isEdit ? `Edit ${existing?.name ?? "project"}` : "Create new project"}
            </h1>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => navigate(paths.projects.list)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEdit ? "Save changes" : "Create project"}</Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <CardTitle className="mb-4">Project details</CardTitle>
            <div className="flex flex-col gap-4">
              <FormField label="Project name" required>
                <Input defaultValue={isEdit ? existing?.name : ""} placeholder="e.g. Billing Platform v2" />
              </FormField>
              <FormField label="Description">
                <Textarea defaultValue={isEdit ? existing?.desc : ""} placeholder="What is this project about?" />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Start date">
                  <Input type="date" defaultValue={isEdit ? existing?.startDate : ""} />
                </FormField>
                <FormField label="Due date">
                  <Input type="date" defaultValue={isEdit ? existing?.dueDate : ""} />
                </FormField>
                <FormField label="Budget">
                  <Input defaultValue={isEdit ? existing?.budget : ""} placeholder="$0" />
                </FormField>
                <FormField label="Client / stakeholder">
                  <Input defaultValue={isEdit ? existing?.client : ""} placeholder="e.g. Acme Co." />
                </FormField>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Team members</CardTitle>
            <div className="flex flex-wrap gap-2.5">
              {teamPick.map((name) => {
                const on = selected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleMember(name)}
                    className="flex items-center gap-2 rounded-full border-2 py-1.5 pl-2 pr-3.5 transition-colors"
                    style={{ borderColor: on ? "var(--acc)" : "var(--line)", background: on ? "var(--acc-soft)" : "var(--bg-inset)" }}
                  >
                    <Avatar name={name} size="xs" />
                    <span className="text-[12.5px] font-semibold text-t0">{name}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <Card padding="sm">
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Status</p>
            <Select defaultValue={existing?.status === "Completed" ? "Archived" : "Active"}>
              <option>Active</option>
              <option>Planning</option>
              <option>On hold</option>
              <option>Archived</option>
            </Select>
          </Card>
          <Card padding="sm">
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Priority</p>
            <div className="flex gap-1.5">
              {priorities.map((p) => {
                const on = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="h-9 flex-1 rounded-[10px] text-[12.5px] font-bold transition-colors"
                    style={
                      on
                        ? { background: p === "High" ? "var(--bad)" : "var(--acc)", color: "#fff" }
                        : { border: "1px solid var(--line)", color: "var(--t1)" }
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Card>
          {isEdit && (
            <Card padding="sm" className="border-bad-soft">
              <p className="mb-2.5 text-[13px] font-bold text-bad">Danger zone</p>
              <Button variant="outline" fullWidth className="border-bad-soft text-bad hover:bg-bad-soft">
                Archive project
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
