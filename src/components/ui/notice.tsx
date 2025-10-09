export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl bg-neutral-50 text-[13px] text-neutral-700 px-3 py-2 ring-1 ring-[var(--ring)]">
      {children}
    </div>
  )
}
