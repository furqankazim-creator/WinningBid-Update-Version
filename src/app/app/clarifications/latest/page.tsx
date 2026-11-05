"use client";
import { ClarificationRegister } from "@/components/app/ClarificationRegister";
export default function Page() { return <ClarificationRegister title="Clarifications · Latest" filter={(c) => ["Approved", "Answered", "Closed"].includes(c.status)} />; }
