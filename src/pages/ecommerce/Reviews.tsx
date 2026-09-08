import { useState } from "react";
import { Button, PageHeader, Rating } from "@/components/ui";
import { reviews, initialsOf } from "@/data/ecommerce";

const distribution = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 24 },
  { stars: 3, pct: 8 },
  { stars: 2, pct: 4 },
  { stars: 1, pct: 2 },
];

const avgRating = 4.5;

export function Reviews() {
  const [filter, setFilter] = useState("All ratings");

  const filtered = reviews.filter((r) => {
    if (filter === "All ratings") return true;
    if (filter === "Needs response") return !r.reply;
    const stars = Number(filter[0]);
    return r.rating === stars;
  });

  return (
    <div>
      <PageHeader
        title="Product Reviews"
        subtitle="2,840 reviews · 4.5★ avg rating"
        actions={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[38px] cursor-pointer rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none"
          >
            <option>All ratings</option>
            <option>5 stars</option>
            <option>4 stars</option>
            <option>3 stars</option>
            <option>Needs response</option>
          </select>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)] lg:w-[260px]">
          <div className="mb-4.5 text-center">
            <p className="text-[52px] font-extrabold leading-none text-t0">{avgRating}</p>
            <div className="my-2 flex justify-center">
              <Rating value={avgRating} size={20} />
            </div>
            <p className="text-[12.5px] text-t2">2,840 total reviews</p>
          </div>
          <div className="flex flex-col gap-2">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-2">
                <span className="w-4 text-right text-xs font-bold text-t2">{d.stars}</span>
                <span className="text-[13px] text-warn">★</span>
                <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full bg-warn" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-8 text-right text-[11.5px] text-t2">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          {filtered.length === 0 ? (
            <div className="rounded-[var(--radius-vela-lg)] border border-dashed border-line bg-bg-2 p-14 text-center text-sm text-t2">No reviews match this filter.</div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: r.avatarBg }}>
                      {initialsOf(r.name)}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-t0">{r.name}</p>
                      <p className="mt-0.5 text-[11.5px] text-t2">
                        {r.product} · {r.date}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Rating value={r.rating} />
                  </div>
                </div>
                <p className="text-[13.5px] leading-[1.65] text-t1">{r.text}</p>
                {r.reply ? (
                  <div className="mt-3 rounded-xl border-l-[3px] border-acc bg-bg-inset p-3">
                    <p className="mb-1 text-[11px] font-bold text-acc">Store reply</p>
                    <p className="text-[13px] text-t1">{r.reply}</p>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2.5">
                    Reply to review
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
