export default function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-muted mb-1">{children}</label>;
}
