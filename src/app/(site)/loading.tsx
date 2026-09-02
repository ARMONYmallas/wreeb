export default function Loading() {
  return (
    <div className="container-page section">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-surface-2" />
        <div className="mt-4 h-10 w-2/3 rounded bg-surface-2" />
        <div className="mt-3 h-5 w-1/2 rounded bg-surface" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-52 rounded-3xl bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
