import * as React from 'react'

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="table-wrap"><div className="table-surface">{children}</div></div>
}
export function T({ children }: { children: React.ReactNode }) {
  return <table className="table">{children}</table>
}
export function TH({ children }: { children: React.ReactNode }) {
  return <th>{children}</th>
}
export function TD({ children, mono=false }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={mono ? 'font-mono' : undefined}>{children}</td>
}