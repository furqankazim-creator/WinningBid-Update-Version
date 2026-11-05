"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { Input, Table, PageHeader } from "@/components/ui";
import { useStore } from "@/store/useStore";

export default function Contacts() {
  const s = useStore(); const [q, setQ] = useState("");
  const list = s.contacts.filter((c) => (c.name + c.email + c.title).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="font-sans">
      <PageHeader title="Contacts" sub={`${s.contacts.length} contacts across ${s.companies.length} companies`} />
      <div className="relative mb-4 max-w-md"><Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" /><Input className="w-full pl-8" placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Table head={["Name", "Title", "Company", "Role", "Email", "Phone", ""]}>
        {list.map((c) => { const co = s.companies.find((x) => x.id === c.companyId); return <tr key={c.id}><td className="px-3 py-2 text-app-text">{c.name}</td><td className="px-3 py-2 text-app-muted">{c.title}</td><td className="px-3 py-2"><Link href={`/app/companies/${c.companyId}`} className="text-app-accent hover:underline">{co?.name}</Link></td><td className="px-3 py-2 text-app-muted">{c.role}</td><td className="px-3 py-2 text-app-muted">{c.email}</td><td className="px-3 py-2 text-app-muted">{c.phone}</td><td className="px-3 py-2"><button onClick={() => s.deleteContact(c.id)} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button></td></tr>; })}
      </Table>
      <p className="mt-3 text-xs text-app-dim">Add contacts from a company's page.</p>
    </div>
  );
}
