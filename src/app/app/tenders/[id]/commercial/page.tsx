"use client";
import { useParams } from "next/navigation";
import { ProposalEditor } from "@/components/app/ProposalEditor";
import { commercialSections } from "@/lib/industries";
export default function Page() { const { id } = useParams<{ id: string }>(); return <ProposalEditor tenderId={id} kind="commercial" title="Commercial Proposal" templateSections={commercialSections} />; }
