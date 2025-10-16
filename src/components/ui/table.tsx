import { cn } from "@/lib/cn";

export function TableShell({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-card", className)}>
      <table className="w-full border-separate border-spacing-0 text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-zinc-50 text-zinc-600">
      {children}
    </thead>
  );
}

export function TH({ children, className }: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-3 py-2 text-left font-semibold border-b border-zinc-200", className)}>{children}</th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&_tr:nth-child(even)]:bg-zinc-50/40">{children}</tbody>;
}

export function TR({ children, className }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-zinc-100", className)}>{children}</tr>;
}

export function TD({ children, className, mono }: React.HTMLAttributes<HTMLTableCellElement> & { mono?: boolean }) {
  return <td className={cn("px-3 py-2 whitespace-nowrap", mono && "font-mono", className)}>{children}</td>;
}

// Legacy exports for backward compatibility
export const TableWrap = TableShell;
export const T = ({ children }: { children: React.ReactNode }) => <>{children}</>;