/** Minimal placeholder for pages that haven't been designed yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">
        This page hasn't been designed yet — it's next in line.
      </p>
    </div>
  );
}
