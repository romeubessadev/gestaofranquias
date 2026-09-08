import { useMemo, useState } from "react";
import { Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { cn } from "@/lib/cn";
import { fileQuickAccess, fileStorageTypes, files, swatch, type FileRecord } from "@/data/apps";
import { DownloadIcon, FolderIcon, SearchIcon, TrashIcon, UploadIcon, fileIcon } from "./icons";

const columns: DataTableColumn<FileRecord>[] = [
  {
    key: "name",
    header: "Name",
    render: (f) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-acc-soft text-acc">
          {fileIcon(f.fileType)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{f.name}</p>
          <p className="mt-px text-[11px] text-t2">{f.type}</p>
        </div>
      </div>
    ),
  },
  { key: "owner", header: "Owner", hideBelow: "md", render: (f) => <span className="text-[12.5px] text-t1">{f.owner}</span> },
  { key: "modified", header: "Modified", hideBelow: "sm", render: (f) => <span className="text-[12.5px] text-t2">{f.modified}</span> },
  { key: "size", header: "Size", render: (f) => <span className="font-mono text-[12.5px] font-semibold text-t0">{f.size}</span> },
  {
    key: "actions",
    header: "Actions",
    align: "center",
    hideBelow: "sm",
    render: () => (
      <div className="flex justify-center gap-1.5">
        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:bg-bg-3 hover:text-t0" aria-label="Download">
          <DownloadIcon size={13} />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:bg-bad-soft hover:text-bad" aria-label="Delete">
          <TrashIcon size={13} />
        </button>
      </div>
    ),
  },
];

export function FileManager() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div>
      <PageHeader
        title="File Manager"
        subtitle="My workspace · 12.4 GB used of 50 GB"
        actions={
          <>
            <Button variant="secondary" icon={<FolderIcon size={15} />}>
              New folder
            </Button>
            <Button icon={<UploadIcon size={15} />}>Upload</Button>
          </>
        }
      />

      {/* Storage bar */}
      <div className="mb-5 flex flex-col gap-5 rounded-2xl border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)] lg:flex-row lg:items-center lg:gap-6">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between">
            <span className="text-[12.5px] font-semibold text-t1">Storage used</span>
            <span className="font-mono text-[12.5px] font-bold text-t0">12.4 GB / 50 GB</span>
          </div>
          <div className="h-2 overflow-hidden rounded-[5px] bg-bg-inset">
            <div className="h-full w-[24.8%] rounded-[5px]" style={{ background: "linear-gradient(90deg, var(--acc), var(--info))" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:gap-6">
          {fileStorageTypes.map((s) => (
            <div key={s.name} className="lg:text-center">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                <span className={cn("h-[9px] w-[9px] rounded-[3px]", swatch(s.swatch).dot)} />
                {s.name}
              </span>
              <p className="mt-0.5 font-mono text-[13.5px] font-bold text-t0">{s.size}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div className="mb-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Quick access</p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {fileQuickAccess.map((f, i) => (
            <div
              key={f.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-bg-2 p-4 hover:border-line-2 hover:bg-bg-3"
            >
              <span className={cn("flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px]", swatch(i).bg, swatch(i).text)}>
                {fileIcon(f.type, 19)}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-t0">{f.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{f.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent files */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-t0">Recent files</h3>
        <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-line bg-bg-inset px-3">
          <SearchIcon size={13} className="text-t2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-28 bg-transparent text-[12.5px] text-t0 outline-none placeholder:text-t2 sm:w-40"
          />
        </div>
      </div>
      <DataTable columns={columns} data={filtered} rowKey={(f) => f.id} emptyMessage="No files match your search." />

      {filtered.length > 0 && (
        <p className="mt-3 text-[12.5px] text-t2">
          Showing {filtered.length} of {files.length} files
        </p>
      )}
    </div>
  );
}
