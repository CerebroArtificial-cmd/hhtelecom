// src/hooks/use-toast.ts
"use client"
import * as React from "react";

type ToastItem = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  open?: boolean;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => { id: string; dismiss: () => void };
  dismiss: (id?: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((old) => [{ ...t, id, open: true }, ...old].slice(0, 3));
    const dismiss = () =>
      setToasts((old) => old.map((x) => (x.id === id ? { ...x, open: false } : x)));
    return { id, dismiss };
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    setToasts((old) =>
      old.map((t) => (id == null || t.id === id ? { ...t, open: false } : t))
    );
  }, []);

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}

// opcional (prefira o hook)
export const toast = (t: Omit<ToastItem, "id">) => {
  console.warn("Prefira useToast().toast(...) dentro de um <ToastProvider>.");
  return { id: "noop", dismiss: () => {} };
};

