/** Suspense fallback shown while a lazily-loaded route chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <span
        className="h-8 w-8 rounded-full border-2 border-line-2 border-t-acc"
        style={{ animation: "velaSpin .7s linear infinite" }}
      />
    </div>
  );
}
