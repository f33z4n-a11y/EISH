"use client";
import { useState } from "react";

export function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        required
        maxLength={72}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
          {!visible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
}
