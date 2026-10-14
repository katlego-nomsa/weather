import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

type ToastType = "success" | "error";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastValue = { showToast: (type: ToastType, message: string) => void };

const TOAST_TIME = 3000; // 3 seconds

const ToastContext = createContext<ToastValue | null>(null);
let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = nextToastId++;
    setMessages((list) => [...list, { id, type, message }]);
    // Remove this message after a few seconds
    setTimeout(() => {
      setMessages((list) => list.filter((item) => item.id !== id));
    }, TOAST_TIME);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Announced politely to screen readers */}
      <div className={styles.stack} role="status" aria-live="polite">
        {messages.map((item) => (
          <div key={item.id} className={`${styles.toast} ${styles[item.type]}`}>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}