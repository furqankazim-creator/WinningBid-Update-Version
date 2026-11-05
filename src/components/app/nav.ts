import { Database, Gauge, Building2, Users, Kanban, Inbox, Layers, Handshake, BadgeCheck, LayoutGrid, FileText, Sparkles, ListChecks, ShieldCheck, MessageSquare, ShieldAlert, Scale, AlertTriangle, DraftingCompass, CheckSquare, Coins, SlidersHorizontal, Swords, FileSignature, Receipt, ClipboardCheck, Stamp, Presentation, Upload, Trophy, RotateCcw, FileBadge, FolderKanban, BarChart3, BookOpen, Factory, UserCog, Briefcase, Globe, History, Bot, type LucideIcon } from "lucide-react";

export interface NavItem { label: string; href: string; icon?: LucideIcon; countKey?: "clarifications" | "contract" | "deliverables" | "inquiries" | "approvals" | "reviews"; children?: { label: string; href: string }[]; }
export interface NavGroup { label?: string; items: NavItem[]; }

/** Navigation is built per active tender so tender-scoped routes carry the id. */
export function buildNav(tid: string, role = ""): NavGroup[] {
  const w = (p: string) => `/app/tenders/${tid}${p}`;
  const groups: NavGroup[] = [
    { items: [{ label: "Dashboard", href: "/app", icon: Gauge }] },
    { label: "Platform", items: [{ label: "Platform Console", href: "/app/platform", icon: Globe }] },
    { label: "CRM", items: [
      { label: "Companies", href: "/app/companies", icon: Building2 },
      { label: "Contacts", href: "/app/contacts", icon: Users },
      { label: "Opportunities", href: "/app/opportunities", icon: Kanban },
      { label: "Inquiries", href: "/app/inquiries", icon: Inbox, countKey: "inquiries" },
    ] },
    { label: "Tender Intelligence", items: [
      { label: "Tender Workspaces", href: "/app/tenders", icon: Layers },
      { label: "Vendors & Partners", href: "/app/vendors", icon: Handshake },
      { label: "Our Capabilities", href: "/app/capabilities", icon: BadgeCheck },
    ] },
    { label: "Active Workspace", items: [
      { label: "Overview", href: w(""), icon: LayoutGrid },
      { label: "Action Board", href: "/app/board", icon: Kanban },
      { label: "Documents", href: "/app/documents", icon: FileText },
      { label: "AI Analysis", href: w("/ai-analysis"), icon: Sparkles },
      { label: "Requirements", href: w("/requirements"), icon: ListChecks },
      { label: "Compliance", href: w("/compliance"), icon: ShieldCheck },
      { label: "Go / No-Go", href: w("/go-no-go"), icon: Scale },
      { label: "Technical Proposal", href: w("/technical"), icon: FileSignature },
      { label: "Pricing", href: w("/pricing"), icon: SlidersHorizontal },
    ] },
    { label: "Intelligence", items: [
      { label: "Reports & Analytics", href: "/app/reports", icon: BarChart3 },
      { label: "Knowledge Base", href: "/app/knowledge", icon: BookOpen },
      { label: "Master Library", href: "/app/master-library", icon: BookOpen },
      { label: "Local Database", href: "/app/database", icon: Database },
    ] },
    { label: "Administration", items: [
      { label: "Industry Templates", href: "/app/admin/templates", icon: Factory },
      { label: "Users & Roles", href: "/app/admin/users", icon: UserCog },
      { label: "Bidders", href: "/app/admin/bidders", icon: Briefcase },
      { label: "Audit Trail", href: "/app/admin/audit", icon: History },
      { label: "AI Governance", href: "/app/admin/ai", icon: Bot },
    ] },
  ];
  return groups.map((g) => ({ ...g, items: g.items.filter((n) => canAccess(role, n.href)) })).filter((g) => g.items.length);
}

/** Pages a Bidder never sees: the organisation's admin tools, CRM and the raw database view. Bidders work inside their own tender workspaces. */
const BIDDER_BLOCKED = ["/app/admin", "/app/companies", "/app/contacts", "/app/opportunities", "/app/inquiries", "/app/database"];
/** Pages only administrators may open. */
const ADMIN_ONLY = ["/app/admin/bidders"];
/** Pages only the platform Super Admin may open. */
const SUPER_ONLY = ["/app/platform"];
export function canAccess(role: string, path: string) {
  const under = (p: string) => path === p || path.startsWith(p + "/");
  if (SUPER_ONLY.some(under)) return role === "Super Admin";
  if (ADMIN_ONLY.some(under)) return role === "Super Admin";
  if (role === "Bidder") return !BIDDER_BLOCKED.some(under);
  return true;
}

export function allPagesFor(tid: string, role = "") {
  return buildNav(tid, role).flatMap((g) => g.items.flatMap((n) => [{ label: n.label, href: n.href }, ...(n.children || []).map((c) => ({ label: `${n.label} · ${c.label}`, href: c.href }))]));
}

