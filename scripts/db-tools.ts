import { accessSync, constants } from "node:fs";
import { delimiter, join } from "node:path";
import { execFileSync } from "node:child_process";
export function databaseConfig(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL belum diatur."); const url = new URL(databaseUrl); if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("DATABASE_URL harus PostgreSQL.");
  return { host: url.hostname, port: url.port || "5432", database: url.pathname.slice(1), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password) };
}
export function postgresBinary(name: string) {
  const directories = [...(process.env.PATH ?? "").split(delimiter), "/opt/homebrew/opt/postgresql@17/bin", "/usr/local/opt/postgresql@17/bin"];
  for (const directory of directories) { const candidate = join(directory, name); try { accessSync(candidate, constants.X_OK); return candidate; } catch { /* lanjut */ } }
  throw new Error(`${name} tidak ditemukan. Pasang PostgreSQL client 17.`);
}
export function pgEnv(config: ReturnType<typeof databaseConfig>) { return { ...process.env, PGHOST: config.host, PGPORT: config.port, PGUSER: config.user, PGPASSWORD: config.password, PGDATABASE: config.database }; }
export function run(name: string, args: string[], config: ReturnType<typeof databaseConfig>, capture = false) { return execFileSync(postgresBinary(name), args, { env: pgEnv(config), encoding: capture ? "utf8" : undefined, stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"] }); }
export function counts(config: ReturnType<typeof databaseConfig>) { const tables = ["User", "IssueRecord", "IssueRevision", "Statement", "StatementVersion", "Briefing", "BriefingRevision", "AuditEvent"]; const sql = tables.map((table) => `SELECT '${table}=' || count(*) FROM "${table}";`).join(" "); const output = String(run("psql", ["-v", "ON_ERROR_STOP=1", "-Atc", sql], config, true)); return Object.fromEntries(output.trim().split("\n").filter(Boolean).map((line) => { const [key, value] = line.split("="); return [key, Number(value)]; })); }
