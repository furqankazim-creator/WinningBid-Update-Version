"use client";
import { industries as builtIn, type IndustryTemplate } from "./industries";
import { useStore } from "@/store/useStore";
/** Built-in templates merged with organisation-defined ones from Administration → Industry Templates. */
export function useIndustries(): IndustryTemplate[] {
  const custom = useStore((s) => s.customIndustries);
  const overridden = new Set(custom.map((c) => c.id));
  return [...builtIn.filter((b) => !overridden.has(b.id)), ...custom].sort((a, b) => (a.id === "other" ? 1 : b.id === "other" ? -1 : a.name.localeCompare(b.name)));
}
export function useIndustry(id: string): IndustryTemplate {
  const all = useIndustries();
  return all.find((i) => i.id === id) || all.find((i) => i.id === "other")!;
}
