import type { RoleCode } from "@prisma/client";
export const roleLabels: Record<RoleCode, string> = {
  CONTRIBUTOR: "Kontributor Monitoring",
  EDITOR: "Editor",
  APPROVER: "Ketua Tim (Approver)",
  READER: "Pembaca",
  ADMIN: "Admin Sistem",
};
export function canManageUsers(roles: RoleCode[]): boolean {
  return roles.includes("ADMIN");
}
export function canApprove(roles: RoleCode[]): boolean {
  return roles.includes("APPROVER");
}
export function canReadDraft(roles: RoleCode[]): boolean {
  return roles.some((r) => ["CONTRIBUTOR", "EDITOR", "APPROVER"].includes(r));
}
export const IDLE_MS = 30 * 60 * 1000;
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000;
export function sessionValid(
  s: { lastSeenAt: Date; expiresAt: Date },
  now: Date,
): boolean {
  return (
    now.getTime() < s.expiresAt.getTime() &&
    now.getTime() - s.lastSeenAt.getTime() < IDLE_MS
  );
}
