"use client";
import { useParams } from "next/navigation";
import { ProposalEditor } from "@/components/app/ProposalEditor";
import { useStore } from "@/store/useStore";
import { useIndustry } from "@/lib/useIndustries";
import { commonProposalSections } from "@/lib/industries";
export default function Page() { const { id } = useParams<{ id: string }>(); const t = useStore((s) => s.tenders.find((x) => x.id === id)); const ind = useIndustry(t?.industry || "other"); return <ProposalEditor tenderId={id} kind="technical" title="Technical Proposal" templateSections={[...commonProposalSections, ...ind.proposalSections]} />; }
