"use client";
import { createContext, useContext, useState } from "react";

type Toast = { id: number; title: string; message?: string };
const Ctx = createContext<{ push:(t:Omit<Toast,"id">)=>void }>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  function push(t: Omit<Toast, "id">) {
    const id = Date.now();
    setItems((s) => [...s, { id, ...t }]);
    setTimeout(() => setItems((s) => s.filter(i => i.id !== id)), 3000);
  }
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 bottom-4 space-y-2 z-50">
        {items.map(i => (
          <div key={i.id} className="card px-3 py-2 shadow-[0_0_0_8px_hsl(var(--ring)/0.15)]">
            <div className="text-sm font-medium">{i.title}</div>
            {i.message && <div className="text-xs text-muted">{i.message}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast(){ return useContext(Ctx); }
