"use client";
import { useRef } from "react";

export function AutoFilterForm({ children }: { children: React.ReactNode }) {
  const searchTimer = useRef<number | null>(null);

  return (
    <form
      className="card issue-filter-bar"
      method="get"
      onChange={(event) => {
        const target = event.nativeEvent.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
        if (target.tagName === "SELECT" || target.type === "date") {
          event.currentTarget.requestSubmit();
        }
      }}
      onInput={(event) => {
        const target = event.nativeEvent.target;
        if (!(target instanceof HTMLInputElement)) return;
        if (target.name !== "q") return;
        const form = event.currentTarget;
        if (searchTimer.current) window.clearTimeout(searchTimer.current);
        searchTimer.current = window.setTimeout(() => form.requestSubmit(), 450);
      }}
    >
      {children}
    </form>
  );
}
