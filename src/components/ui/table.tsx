export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto border rounded-2xl">{children}</div>;
}
export function T({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full text-sm">{children}</table>;
}
export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`p-2 ${right ? "text-right" : "text-left"} bg-[hsl(var(--surface))]`}>{children}</th>;
}
export function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`p-2 ${right ? "text-right" : "text-left"} border-t`}>{children}</td>;
}