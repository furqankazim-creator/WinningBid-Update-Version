import { severity } from "@/store/useStore";
import { cn } from "@/lib/cn";
export function SeverityText({ p, i }: { p: number; i: number }) {
  const s = severity(p, i);
  return <span className={cn("text-xs font-medium", s === "Very High" ? "text-app-red" : s === "High" ? "text-app-red/80" : s === "Medium" ? "text-app-yellow" : "text-app-green")}>{s}</span>;
}
