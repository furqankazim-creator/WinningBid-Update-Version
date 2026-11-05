/**
 * Industry templates. The core app never branches on an industry name — it reads these templates.
 * Adding an industry = adding an entry here (or, at runtime, via Administration → Industry Templates).
 */
export interface IndustryTemplate {
  id: string; name: string; icon: string;
  services: string[];
  compliance: string[];          // compliance checklist items
  costCategories: string[];
  riskCategories: string[];
  engineeringSections: string[];
  proposalSections: string[];    // technical proposal sections (appended to common ones)
  documentTypes: string[];
  requirementFocus: string[];    // requirement categories emphasised for this industry
  customFields?: string[];       // extra tender metadata fields shown on the workspace Overview
  questionTemplates?: string[];  // standard clarification questions for this industry
}

const commonCompliance = ["Company registration", "Tax clearance", "Insurance certificate", "Financial statements (3 yrs)", "Bid bond", "Signed forms"];
const commonCost = ["Labor", "Materials", "Equipment", "Transportation", "Subcontractors", "Engineering", "Procurement", "Insurance", "Overheads", "Mobilization", "Demobilization", "Contingency", "Other"];
const commonRisk = ["Technical", "Commercial", "Financial", "Legal", "Contract", "Procurement", "Schedule", "Operational", "HSE", "Environmental", "Cybersecurity", "Resource", "Reputation", "Supply Chain"];
const commonDocs = ["Tender document", "RFP", "RFQ", "Scope of Work", "Specifications", "BOQ", "Contract", "Terms & Conditions", "Addendum", "Clarification", "Annex", "Pricing sheet", "Vendor quotation", "Company document", "Client correspondence"];

const t = (p: Partial<IndustryTemplate> & Pick<IndustryTemplate, "id" | "name" | "icon" | "services">): IndustryTemplate => ({
  compliance: commonCompliance, costCategories: commonCost, riskCategories: commonRisk, engineeringSections: ["Scope", "Method statement", "Schedule", "Resources"],
  proposalSections: [], documentTypes: commonDocs, requirementFocus: ["Technical", "Commercial", "Legal", "Experience"], customFields: [], questionTemplates: [], ...p,
});

export const industries: IndustryTemplate[] = [
  t({ id: "oil-gas", name: "Oil & Gas", icon: "🛢️", services: ["Upstream", "Midstream", "Downstream", "EPC / EPCI", "Pipeline Maintenance", "Drilling", "Subsea", "Engineering"],
    compliance: [...commonCompliance, "ISO 9001", "ISO 45001", "API certifications", "HSE management system", "Client vendor registration", "Technical pre-qualification"],
    engineeringSections: ["Pipeline", "Mechanical", "Process", "Electrical", "Instrumentation", "Subsea", "Marine spread"], proposalSections: ["HSE plan", "Vessel & equipment spread", "Local content plan"], requirementFocus: ["Technical", "HSE", "Experience", "Equipment", "Local content"], customFields: ["Water depth (m)", "Field / block", "Operator", "Vessel spread"], questionTemplates: ["Confirm applicable design code edition", "Confirm metocean data provision", "Confirm mobilisation cost basis"] }),
  t({ id: "infrastructure", name: "Infrastructure", icon: "🌉", services: ["Roads", "Bridges", "Buildings", "Railways", "Airports", "Ports", "Tunnels"],
    compliance: [...commonCompliance, "Contractor licence (grade)", "Building permits", "HSE certification", "Equipment fleet list", "Key personnel CVs", "Similar project references"],
    costCategories: [...commonCost, "Earthworks", "Concrete", "Steel", "Asphalt", "Traffic management"], engineeringSections: ["Drawings", "BOQ", "Civil works", "Structural", "Geotechnical", "Method statements", "Traffic management"], proposalSections: ["Construction methodology", "Site organisation", "Environmental & social plan"], requirementFocus: ["Experience", "Equipment", "Personnel", "HSE", "Schedule"], customFields: ["Contractor licence grade required", "In-country value %", "Site handover date", "Defects liability period"], questionTemplates: ["Confirm BOQ quantities are re-measurable", "Confirm utility diversions responsibility", "Confirm traffic management scope"] }),
  t({ id: "construction", name: "Construction", icon: "🏗️", services: ["Civil", "Structural", "MEP", "Fit-out", "Facades", "Design & Build"],
    compliance: [...commonCompliance, "Contractor licence", "Building permits", "Safety certifications", "Equipment list", "Experience certificates"],
    engineeringSections: ["Drawings", "BOQ", "Civil works", "Structural", "MEP", "Method statements"], proposalSections: ["Construction methodology", "Quality plan", "Site HSE plan"], requirementFocus: ["Experience", "Equipment", "Personnel", "HSE", "Warranty"] }),
  t({ id: "manufacturing", name: "Manufacturing", icon: "🏭", services: ["Industrial Equipment", "Machinery", "Production Lines", "Automotive", "Fabrication"],
    compliance: [...commonCompliance, "ISO 9001", "Factory certifications", "Product standards (CE/UL)", "Type test reports", "Production capacity statement"],
    costCategories: [...commonCost, "Raw materials", "Tooling", "Testing", "Packaging", "Warranty reserve"], engineeringSections: ["Product specifications", "Production plan", "Quality control", "Materials", "Testing & FAT"], proposalSections: ["Manufacturing plan", "Quality assurance", "Testing & inspection", "Delivery & logistics"], requirementFocus: ["Technical", "Quality", "Delivery", "Warranty", "Certification"] }),
  t({ id: "engineering", name: "Engineering", icon: "📐", services: ["Design", "FEED", "Detailed Engineering", "Owner's Engineer", "Studies"], engineeringSections: ["Design basis", "Deliverables list", "Software & tools", "QA/QC"], requirementFocus: ["Personnel", "Experience", "Technical", "Schedule"] }),
  t({ id: "energy", name: "Energy", icon: "⚡", services: ["Power Generation", "Transmission", "Distribution", "Energy Storage", "O&M"], compliance: [...commonCompliance, "Grid code compliance", "Electrical safety certification", "ISO 14001"], engineeringSections: ["Electrical", "Civil", "Grid connection", "Protection & control"], requirementFocus: ["Technical", "Experience", "HSE", "Warranty"] }),
  t({ id: "renewables", name: "Renewable Energy", icon: "🌱", services: ["Solar PV", "Wind", "Hydro", "BESS", "Green Hydrogen"], compliance: [...commonCompliance, "IEC module/turbine certification", "Environmental impact approval", "Grid code compliance"], engineeringSections: ["Yield assessment", "Layout", "Electrical", "Civil", "Grid connection"], requirementFocus: ["Technical", "Environmental", "Warranty", "Experience"] }),
  t({ id: "utilities", name: "Power & Utilities", icon: "🔌", services: ["Substations", "Metering", "Network O&M", "Smart Grid"], requirementFocus: ["Technical", "HSE", "Experience", "Schedule"] }),
  t({ id: "telecom", name: "Telecom", icon: "📡", services: ["Fibre Rollout", "Towers", "Core Network", "Managed Services"], compliance: [...commonCompliance, "Telecom regulator licence", "ISO 27001", "Type approvals"], engineeringSections: ["Network design", "RF planning", "Civil works", "Integration"], requirementFocus: ["Technical", "Security", "Schedule", "Experience"] }),
  t({ id: "it", name: "IT & Software", icon: "💻", services: ["Software Development", "Cloud Services", "Cybersecurity", "ERP Implementation", "Managed Services", "Data & AI"],
    compliance: [...commonCompliance, "ISO 27001", "SOC 2", "Data protection registration", "Data residency statement", "Partner certifications (cloud vendor)"],
    costCategories: ["Labor", "Software licences", "Cloud infrastructure", "Hardware", "Subcontractors", "Training", "Support & maintenance", "Travel", "Overheads", "Contingency", "Other"],
    riskCategories: [...commonRisk, "Data privacy", "Integration", "Vendor lock-in"], engineeringSections: ["Solution architecture", "Technical design", "Infrastructure", "Security", "Integration", "Migration", "Testing"], proposalSections: ["Solution overview", "Architecture", "Implementation approach", "Security & data protection", "Support & SLA"], requirementFocus: ["Technical", "Security", "Data/privacy", "Personnel", "Schedule"], customFields: ["Users / licences", "Data residency", "Hosting model", "SLA availability %", "Support term (years)"], questionTemplates: ["Confirm legacy data volumes for migration", "Confirm acceptable hosting jurisdiction", "Confirm integration endpoints and standards"] }),
  t({ id: "government", name: "Government", icon: "🏛️", services: ["Public Works", "Public Services", "Supply Contracts", "Consulting"], compliance: [...commonCompliance, "Public procurement registration", "Anti-corruption declaration", "Beneficial ownership disclosure", "Local content certificate"], requirementFocus: ["Administrative", "Compliance", "Legal", "Local content"] }),
  t({ id: "healthcare", name: "Healthcare", icon: "🏥", services: ["Medical Equipment", "Hospital Services", "Facilities", "Health IT"], compliance: [...commonCompliance, "Regulatory approvals (FDA/CE/MoH)", "Product registrations", "ISO 13485", "Distributor licence"], requirementFocus: ["Certification", "Quality", "Warranty", "Delivery"] }),
  t({ id: "pharma", name: "Pharmaceuticals", icon: "💊", services: ["Drug Supply", "Cold Chain", "Clinical Services"], compliance: [...commonCompliance, "GMP certificate", "Product registrations", "Cold-chain validation", "Pharmacovigilance"], requirementFocus: ["Certification", "Quality", "Delivery"] }),
  t({ id: "transport", name: "Transportation", icon: "🚆", services: ["Rail", "Bus Systems", "Fleet", "Traffic Systems"], requirementFocus: ["Technical", "Experience", "Schedule", "HSE"] }),
  t({ id: "logistics", name: "Logistics", icon: "🚚", services: ["Freight", "Warehousing", "Customs", "Last Mile"], compliance: [...commonCompliance, "Freight forwarder licence", "Customs broker licence", "Fleet insurance"], requirementFocus: ["Delivery", "Insurance", "Experience"] }),
  t({ id: "mining", name: "Mining", icon: "⛏️", services: ["Contract Mining", "Mineral Processing", "Mine Services", "Exploration"], compliance: [...commonCompliance, "Mining licence", "HSE management system", "Environmental approvals"], requirementFocus: ["HSE", "Equipment", "Experience", "Environmental"] }),
  t({ id: "real-estate", name: "Real Estate", icon: "🏢", services: ["Development", "Property Management", "Leasing"], requirementFocus: ["Financial", "Legal", "Experience"] }),
  t({ id: "fm", name: "Facilities Management", icon: "🧰", services: ["Hard FM", "Soft FM", "Integrated FM", "Cleaning", "Security"], requirementFocus: ["Personnel", "HSE", "Experience", "Insurance"] }),
  t({ id: "industrial", name: "Industrial Services", icon: "🔧", services: ["Maintenance", "Shutdowns", "Inspection", "Scaffolding", "Insulation"], requirementFocus: ["HSE", "Personnel", "Equipment", "Experience"] }),
  t({ id: "water", name: "Water & Wastewater", icon: "💧", services: ["Treatment Plants", "Networks", "Desalination", "Metering (AMI/AMR)", "O&M"], compliance: [...commonCompliance, "Client vendor registration (GSC)", "HSE / Construction Safety Manual compliance", "Certified pipe fitters & welders", "Work-permit receiver certification", "Approved equipment & scaffolding", "Local content (IKTVA) declaration"], costCategories: [...commonCost, "Meters & modules", "Meter boxes & fittings", "Testing & commissioning"], customFields: ["Number of connections", "Meter sizes", "Communication technology", "Data platform / MDM"], questionTemplates: ["Confirm smart-meter communication technology and data platform", "Confirm water shutdown and resident notification procedure", "Confirm applicable SAES/SAMSS for meters and piping"], engineeringSections: ["Process", "Civil", "Mechanical", "Electrical & control"], requirementFocus: ["Technical", "Environmental", "Experience", "Warranty"] }),
  t({ id: "defense", name: "Defense & Aerospace", icon: "🛡️", services: ["MRO", "Systems Integration", "Support Services"], compliance: [...commonCompliance, "Security clearance", "Export control compliance", "AS9100"], requirementFocus: ["Security", "Certification", "Personnel"] }),
  t({ id: "education", name: "Education", icon: "🎓", services: ["Training", "E-learning", "School Construction", "Supplies"], requirementFocus: ["Experience", "Personnel", "Delivery"] }),
  t({ id: "consulting", name: "Consulting", icon: "📊", services: ["Strategy", "Management", "Technical Advisory", "PMO"], costCategories: ["Labor", "Travel", "Subcontractors", "Software", "Overheads", "Contingency", "Other"], requirementFocus: ["Personnel", "Experience", "Schedule"] }),
  t({ id: "professional", name: "Professional Services", icon: "💼", services: ["Legal", "Audit", "HR", "Marketing"], costCategories: ["Labor", "Travel", "Subcontractors", "Overheads", "Contingency"], requirementFocus: ["Personnel", "Experience", "Insurance"] }),
  t({ id: "trading", name: "Trading & Supply", icon: "📦", services: ["Equipment Supply", "Spare Parts", "Consumables", "Distribution"], requirementFocus: ["Delivery", "Warranty", "Certification", "Financial"] }),
  t({ id: "other", name: "Other", icon: "◻️", services: ["General"] }),
];

export const industryById = (id: string) => industries.find((i) => i.id === id) || industries[industries.length - 1];

export const tenderTypes = ["Tender", "RFP", "RFQ", "RFI", "ITT", "EOI", "Prequalification", "Framework Agreement", "Government Procurement", "Private Procurement", "Direct Opportunity", "Subcontract Opportunity", "Vendor Registration", "Partner Opportunity"] as const;
export type TenderType = (typeof tenderTypes)[number];

export const requirementCategories = ["Technical", "Commercial", "Legal", "Financial", "Administrative", "Compliance", "HSE", "Quality", "Experience", "Personnel", "Equipment", "Material", "Delivery", "Schedule", "Warranty", "Insurance", "Licensing", "Certification", "Local content", "Security", "Data/privacy", "Environmental", "Sustainability", "Other"] as const;

export const contractTerms = ["Payment Terms", "Payment Milestones", "Retention", "Warranty", "Liability", "Indemnity", "Insurance", "Performance Bond", "Advance Payment", "Liquidated Damages", "Termination", "Dispute Resolution", "Governing Law", "Intellectual Property", "Confidentiality", "Change Orders", "Force Majeure", "Subcontracting", "Penalty Clauses", "Delivery Obligations", "Acceptance Criteria"];

export const commonProposalSections = ["Executive Summary", "Company Profile", "Understanding of Requirement", "Methodology", "Execution Plan", "Resources", "Team", "Equipment", "Quality", "HSE", "Schedule", "Risk Management", "Experience", "Technical Compliance", "Assumptions", "Qualifications"];
export const commercialSections = ["Commercial Summary", "Pricing", "Currency", "Taxes", "Payment Terms", "Validity", "Delivery", "Warranty", "Assumptions", "Exclusions", "Qualifications", "Commercial Deviations", "Approvals"];

export const goNoGoCriteria = ["Strategic fit", "Technical capability", "Experience", "Compliance", "Financial attractiveness", "Expected margin", "Resource availability", "Schedule", "Location", "Competition", "Client relationship", "Contract risk", "Payment terms", "Probability of winning", "Required investment"];

export const reviewStages = ["Technical Review", "Commercial Review", "Legal Review", "Compliance Review", "Procurement Review", "Financial Review", "Management Review"] as const;

export const roles = ["Super Admin", "Business Development", "Tender Manager", "Technical Manager", "Engineer", "Procurement Manager", "Commercial Manager", "Finance", "Legal", "Compliance", "Project Manager", "Reviewer", "Executive", "Viewer", "Contractor/Vendor", "Bidder"] as const;

export const partnerTypes = ["Contractor", "Supplier", "Manufacturer", "Consultant", "Service Provider", "Distributor", "Subcontractor", "Technology Partner", "JV Partner", "Other"] as const;

export const regions = ["North America", "South America", "Europe", "Middle East", "Africa", "Asia Pacific", "Global"];
