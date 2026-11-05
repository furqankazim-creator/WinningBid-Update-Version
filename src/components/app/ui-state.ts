"use client";
import { create } from "zustand";

interface UI {
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  palette: boolean; setPalette: (v: boolean) => void;
  settings: boolean; setSettings: (v: boolean) => void;
  mode: "workspace" | "chat"; setMode: (m: "workspace" | "chat") => void;
  agent: string; setAgent: (a: string) => void;
}
export const useUI = create<UI>((set) => ({
  collapsed: false, setCollapsed: (collapsed) => set({ collapsed }),
  palette: false, setPalette: (palette) => set({ palette }),
  settings: false, setSettings: (settings) => set({ settings }),
  mode: "workspace", setMode: (mode) => set({ mode }),
  agent: "tender-manager", setAgent: (agent) => set({ agent }),
}));
