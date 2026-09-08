import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, PageHeader, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/cn";

interface UploadFile {
  name: string;
  size: string;
  pct: number;
  eta?: string;
  done: boolean;
  iconColor: string;
  iconBg: string;
}

const files: UploadFile[] = [
  { name: "Q3-financial-report.pdf", size: "2.4 MB", pct: 100, done: true, iconColor: "var(--bad)", iconBg: "var(--bad-soft)" },
  { name: "brand-guidelines.pdf", size: "8.1 MB", pct: 100, done: true, iconColor: "var(--bad)", iconBg: "var(--bad-soft)" },
  { name: "team-photo.jpg", size: "4.7 MB", pct: 100, done: true, iconColor: "var(--info)", iconBg: "var(--info-soft)" },
  { name: "product-demo.mp4", size: "48.2 MB", pct: 62, eta: "24s left", done: false, iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { name: "dataset-export.csv", size: "1.2 MB", pct: 31, eta: "8s left", done: false, iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
];

export function FileUploadPage() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <PageHeader title="File Upload" subtitle="Drag-and-drop, multiple uploads, progress tracking" />
      <div className="flex max-w-3xl flex-col gap-5">
        <Card padding="lg">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            className={cn(
              "rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
              dragOver ? "border-acc bg-acc-soft" : "border-line",
            )}
          >
            <div className="mx-auto mb-4 flex h-15 w-15 items-center justify-center rounded-2xl bg-acc-soft" style={{ height: 60, width: 60 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-t0">Drop files here or click to upload</h3>
            <p className="mt-2 mb-4 text-[13.5px] text-t2">Supports PNG, JPG, PDF, DOCX up to 50MB each</p>
            <Button variant="secondary">Choose files</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploading files</CardTitle>
            <span className="text-[12.5px] text-t2">3 of 5 complete</span>
          </CardHeader>
          <div className="flex flex-col gap-3.5">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-3.5 rounded-xl border border-line bg-bg-inset p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: f.iconBg, color: f.iconColor }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-bold text-t0">{f.name}</span>
                    <span className="shrink-0 text-xs text-t2">{f.size}</span>
                  </div>
                  {f.done ? (
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className="text-[11.5px] font-semibold text-ok">Upload complete</span>
                    </div>
                  ) : (
                    <>
                      <ProgressBar value={f.pct} height={5} />
                      <div className="mt-1 flex justify-between text-[11px] text-t2">
                        <span>{f.pct}%</span>
                        <span>{f.eta}</span>
                      </div>
                    </>
                  )}
                </div>
                <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-t2 hover:border-bad hover:text-bad">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
