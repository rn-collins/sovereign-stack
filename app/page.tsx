"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Definitions from "./components/Definitions";
import EngagementProposal from "./components/EngagementProposal";
import LifecycleSimulation from "./components/LifecycleSimulation";
import ProductAnatomy from "./components/ProductAnatomy";
import { type View, VIEW_PATHS, viewFromPathname } from "./route-config";

type EvidenceType = "All" | "Public record" | "RN synthesis" | "Hypothesis" | "Proposed design" | "Unresolved";
type RecordKey = "purpose" | "authority" | "knowledge" | "dataFlow" | "dependencies" | "allowed" | "prohibited" | "conditions" | "review" | "challenge" | "incident" | "withdrawal" | "migration" | "retirement";
type Role = "Steward" | "Authority reviewer" | "Technical contributor" | "Observer";
type LogEntry = { id: string; kind: "Change" | "Decision" | "Review" | "Incident"; summary: string; actor: string; at: string };
type Snapshot = { id: string; label: string; at: string; fields: Record<RecordKey, string> };
type ProductionStatus = "Not examined" | "Discovery underway" | "Draft decision" | "Approved for prototype" | "Blocked";
type ProductionDecisionRecord = { status: ProductionStatus; owner: string; evidence: string; conditions: string };
type SessionRecord = { sponsor: string; participants: string; prework: string; boundaries: string; decisions: string; dissent: string; nextStep: string };
type CharterRecord = { useCase: string; sponsor: string; authority: string; scope: string; exclusions: string; participants: string; outputs: string; acceptance: string; ownership: string; risks: string; stopConditions: string; timeline: string; handoff: string };
type ReviewResponse = "I see a relevant constraint" | "Continue discovery" | "Revise the concept" | "Not useful now" | "Not mine to decide";
type GateEffect = "pass" | "condition" | "block";
type GateOption = { id: string; label: string; effect: GateEffect };
type GateQuestion = { id: string; title: string; prompt: string; options: GateOption[] };

const nav: { id: View; label: string; eyebrow: string }[] = [
  { id: "review", label: "Proposal", eyebrow: "00" },
  { id: "simulation", label: "Guided demonstration", eyebrow: "01" },
  { id: "proposal", label: "System design", eyebrow: "02" },
  { id: "pilot", label: "Engagement", eyebrow: "03" },
  { id: "evidence", label: "Evidence & status", eyebrow: "04" },
  { id: "overview", label: "The hypothesis", eyebrow: "05" },
  { id: "gate", label: "Decision Gate", eyebrow: "06" },
  { id: "record", label: "Authority Record", eyebrow: "07" },
  { id: "readiness", label: "Production architecture", eyebrow: "08" },
  { id: "definitions", label: "Operational definitions", eyebrow: "09" },
  { id: "session", label: "Co-design session", eyebrow: "10" },
  { id: "charter", label: "Pilot charter", eyebrow: "11" },
  { id: "learning", label: "Learning translation", eyebrow: "12" },
  { id: "meeting", label: "Seven-minute briefing", eyebrow: "13" },
];

const primaryNav = nav.filter(item => ["review", "simulation", "proposal", "pilot", "evidence"].includes(item.id));
const supportingNav = nav.filter(item => !primaryNav.some(primary => primary.id === item.id));
const STORAGE_KEY = "authority-layer:demo:v3";
const V2_STORAGE_KEY = "authority-layer-demo-record-v2";
const LEGACY_STORAGE_KEY = "sovereign-stack-demo-record";
const recordVisibilities = ["Internal", "Restricted", "Public excerpt"] as const;
const decisionStatuses = ["Draft — no authority decision", "Returned for revision", "Approved with conditions", "Declined", "Withdrawn", "Expired"] as const;
const productionStatuses: ProductionStatus[] = ["Not examined", "Discovery underway", "Draft decision", "Approved for prototype", "Blocked"];

const meetingSlides = [
  { label: "What changed", title: "ʻĀina Foundry has now publicly presented and described its Sovereign Stack.", body: "Its published event description names open models, local compute, AI coding agents, and an edge-hardware path. That public development makes the question behind this independent prototype more specific.", proof: "Public record, not internal knowledge. RN previously corresponded with Purple Maiʻa about the earlier proposal; no commission, endorsement, adoption, or validation is implied." },
  { label: "Open hypothesis", title: "Does authority remain operational as the technical stack changes?", body: "Local infrastructure can strengthen control while leaving a separate lifecycle question: how purpose, standing, knowledge boundaries, permissions, conditions, dissent, repair, withdrawal, migration, and retirement remain attached to changing systems.", proof: "This is RN’s hypothesis—not a finding that Purple Maiʻa lacks governance work. Purple Maiʻa may already address it, define another problem, or see no useful gap." },
  { label: "Working mechanism", title: "The prototype makes that hypothesis testable.", body: "A pre-build Decision Gate connects to a living Authority Record, review history, production decisions, co-design process, and pilot charter. Pause, refusal, withdrawal, and non-digitization are valid outcomes.", proof: "A working demonstration exists; its substance, language, decision-making roles, and rules have not been adopted or authorized." },
  { label: "Author’s role", title: "RN’s proposed role is legal-technical implementation—not cultural or community authority.", body: "RN’s contribution here is translating research, governance requirements, and implementation constraints into editable tools that can be tested and revised.", proof: "Purple Maiʻa and the relevant community or cultural authorities would define the substance, decision-making roles, language, and limits of any real work." },
  { label: "Bounded engagement", title: "If the premise survives review, begin with paid discovery—not a presumed pilot.", body: "A short engagement could identify the real constraint, map standing and documentation boundaries, trace one non-sensitive scenario, and end with stop, revise, continue discovery, or invite a separately chartered pilot.", proof: "Proposed container only: sponsor interview, preparation, one 90-minute co-design session, synthesis, and an editable decision brief. Scope, participants, confidentiality, ownership, timing, and fee require agreement." },
  { label: "Decision", title: "Does the Sovereign Stack need an authority layer—or would this duplicate work already in place?", body: "The immediate request is a pressure test, not adoption: identify whether the problem is real, already solved, framed at the wrong layer, or worth a bounded discovery conversation.", proof: "Valid answers include useful, revise, refer, redundant, not now, and stop. None authorizes implementation or access to protected information." },
] as const;

const evidenceItems: { type: Exclude<EvidenceType, "All">; claim: string; basis: string; boundary: string; source?: { label: string; url: string; accessed: string } }[] = [
  { type: "Public record", claim: "ʻĀina Foundry publicly presented “The Sovereign Stack” during Hawaiʻi Tech Week on 2 September 2026.", basis: "The published event description identifies open models, local compute, AI coding agents, and a path toward solar-powered edge hardware.", boundary: "An event description establishes public positioning, not the complete architecture, deployment state, governance process, or endorsement of this prototype.", source: { label: "ʻĀina Foundry · The Sovereign Stack", url: "https://luma.com/88dnl4w1", accessed: "Accessed 13 September 2026" } },
  { type: "Public record", claim: "ʻĀina Foundry identifies Indigenous Data Sovereignty and Sovereignty-First Technology Development among its current focus areas.", basis: "Purple Maiʻa's current ʻĀina Foundry program page.", boundary: "Public focus areas do not establish which operational controls, records, or internal practices already exist.", source: { label: "Purple Maiʻa · ʻĀina Foundry", url: "https://www.purplemaia.org/ainafoundry", accessed: "Accessed 13 September 2026" } },
  { type: "Public record", claim: "Purple Maiʻa publicly documents active prototyping with local models, routing, agents, local document search, and edge hardware.", basis: "The ʻĀina Foundry public prototype log.", boundary: "Prototype logs are selected public accounts; they do not disclose protected work or establish production readiness.", source: { label: "ʻĀina Foundry · Prototype log", url: "https://blog.labs.purplemaia.org/", accessed: "Accessed 13 September 2026" } },
  { type: "Public record", claim: "Purple Maiʻa describes locally controlled AI infrastructure and unresolved choices about routing, commercial dependencies, data sovereignty, and Hawaiian epistemology.", basis: "Purple Maiʻa's published 2026 AI update.", boundary: "The public description does not establish every present component, policy, authority relationship, or technical dependency.", source: { label: "Purple Maiʻa · 2026 update on AI", url: "https://www.purplemaia.org/purple-blog/eahou-fest-2026-update-on-ai", accessed: "Accessed 13 September 2026" } },
  { type: "Public record", claim: "KILO connects environmental observation with kānāwai-guided interpretation, community control, and stewardship.", basis: "Purple Maiʻa's public article on Data Guided by Kānāwai.", boundary: "This prototype claims no access to KILO's internal governance, data, architecture, or participating communities' decisions.", source: { label: "Purple Maiʻa · Data Guided by Kānāwai", url: "https://www.purplemaia.org/purple-blog/data-guided-by-k%C4%81n%C4%81wai", accessed: "Accessed 13 September 2026" } },
  { type: "Public record", claim: "Purple Maiʻa leaders and collaborators have publicly argued that island AI infrastructure requires community participation in how it is built and governed.", basis: "A May 2026 Civil Beat commentary by Kelsey Amos, Keoni DeFranco, Keolu Fox, and Josiah Hester.", boundary: "The commentary establishes a public governance position, not a complete operational record or agreement with RN's proposed mechanism.", source: { label: "Civil Beat · AI data centers and community governance", url: "https://www.civilbeat.org/2026/05/ai-data-centers-are-the-new-plantations-unless-we-build-them-differently/", accessed: "Accessed 13 September 2026" } },
  { type: "RN synthesis", claim: "The relevant seam may be the operational layer between sovereignty-first infrastructure and durable, reviewable authority decisions.", basis: "RN's synthesis of Purple Maiʻa's public technical, environmental, educational, and governance work.", boundary: "This synthesis does not establish a gap in Purple Maiʻa's current practice." },
  { type: "Hypothesis", claim: "A reusable authority record could reduce loss of purpose, conditions, dissent, and stopping power as systems, vendors, models, and personnel change.", basis: "A lifecycle-risk hypothesis made testable by this prototype.", boundary: "Only discovery with Purple Maiʻa and relevant authorities could show whether the risk exists, is already managed, or matters enough to address." },
  { type: "Hypothesis", claim: "One bounded, non-sensitive use could make the hypothesis concrete enough to accept, revise, or reject.", basis: "A narrow scenario can expose decision dependencies without requiring protected knowledge or a production build.", boundary: "No project—including KILO—is presumed to be the test case. Purple Maiʻa may identify another use or no useful pilot." },
  { type: "Proposed design", claim: "A pre-build gate should allow proceed, pause, redesign, defer, or refuse—and should preserve rationale, dissent, and unresolved conditions.", basis: "RN's governance and legal-technical design proposal.", boundary: "The options, language, standing, and valid decision process must be co-designed and approved before operational use." },
  { type: "Proposed design", claim: "A living system record could join authority, knowledge boundaries, custody, dependencies, use, review, challenge, repair, migration, and retirement.", basis: "The working prototype on this site.", boundary: "The prototype demonstrates a container. It is not an authoritative record, approved protocol, secure workspace, or Purple Maiʻa policy." },
  { type: "Proposed design", claim: "Engagement-specific records should remain under Purple Maiʻa's control, while ownership or licensing of reusable tooling is expressly negotiated.", basis: "RN's proposed custody and commercial boundary.", boundary: "Actual ownership, confidentiality, licensing, retention, attribution, and permitted portfolio use require an agreed charter or contract." },
  { type: "Unresolved", claim: "Whether Purple Maiʻa experiences a governance, documentation, learning, policy, or adoption constraint this product should address.", basis: "Not answerable from public materials.", boundary: "Only Purple Maiʻa and the authorities it identifies could answer this. Nothing in the public record answers it, and urgency must not be inferred from the existence of the public work." },
  { type: "Unresolved", claim: "Who has standing to define rules, authorize a pilot, classify knowledge, approve records, contest decisions, or stop work.", basis: "Not established by this proposal.", boundary: "Purple Maiʻa and relevant community or cultural authorities determine standing. RN cannot nominate authority through interface design." },
  { type: "Unresolved", claim: "What may be discussed, recorded, stored, demonstrated, shared with RN, or made public.", basis: "Requires explicit scope-setting before discovery.", boundary: "Least documentation is the default; protected knowledge need not be exposed to prove governance rigor." },
  { type: "Unresolved", claim: "Whether this authority-layer hypothesis is useful, redundant, or aimed at the wrong layer.", basis: "Not answerable from public materials.", boundary: "Purple Maiʻa may correct the premise, identify existing work, refer the question, or stop it." },
  { type: "Unresolved", claim: "Whether a paid discovery phase, bounded pilot, or no further work is appropriate.", basis: "This is the decision the executive review room is designed to support.", boundary: "Interest in a conversation is not approval, consent, a contract, data access, or permission to build." },
];

const sessionAgenda = [
  ["00–10", "Set standing and boundaries", "Confirm who convened the session, who may speak or decide, what is outside scope, and what must not be recorded."],
  ["10–25", "Name the real constraint", "Hear the problem in Purple Maiʻa’s language. Test whether a governance tool, another intervention, or no project is appropriate."],
  ["25–45", "Trace one bounded use", "Map purpose, knowledge class, custody, dependencies, decision points, burden, benefit, challenge, and exit without entering protected content."],
  ["45–65", "Work the six decisions", "Identify owners, required evidence, disagreements, and blockers. Do not force consensus or convert uncertainty into approval."],
  ["65–80", "Test a stop scenario", "Practice pause, refusal, withdrawal, incident, and repair. Confirm whether the controls work when interests conflict."],
  ["80–90", "Close with a real decision", "Choose stop, more discovery, revise, or invite a bounded prototype. Assign only authorized next actions and review dates."],
] as const;

const initialSessionRecord: SessionRecord = { sponsor: "", participants: "", prework: "", boundaries: "", decisions: "", dissent: "", nextStep: "" };
const initialCharterRecord: CharterRecord = { useCase: "", sponsor: "", authority: "", scope: "", exclusions: "", participants: "", outputs: "", acceptance: "", ownership: "", risks: "", stopConditions: "", timeline: "", handoff: "" };

const charterFields: { key: keyof CharterRecord; label: string; prompt: string; wide?: boolean }[] = [
  { key: "useCase", label: "Bounded use case", prompt: "What single, non-sensitive use or governance question is the pilot permitted to examine?", wide: true },
  { key: "sponsor", label: "Organizational sponsor", prompt: "Which role or body convenes the pilot, supplies resources, and can stop organizational work?" },
  { key: "authority", label: "Authority and standing", prompt: "Which roles or bodies may define boundaries, validate, condition, refuse, or withdraw the pilot?" },
  { key: "scope", label: "Work explicitly in scope", prompt: "Name the research, mapping, facilitation, prototyping, testing, and documentation actually invited." },
  { key: "exclusions", label: "Work explicitly out of scope", prompt: "Name protected knowledge, production operation, legal determinations, community-wide claims, or other excluded work." },
  { key: "participants", label: "Participants and responsibilities", prompt: "Who defines, advises, operates, experiences, challenges, decides, documents, and maintains?" },
  { key: "outputs", label: "Tangible outputs", prompt: "What editable records, prototype components, maps, findings, training, documentation, or recommendations are transferred?" },
  { key: "acceptance", label: "Acceptance and success criteria", prompt: "What observable tests show the work is usable, accurate enough, non-burdensome, governable, and ready to accept—or reject?" },
  { key: "ownership", label: "Ownership, custody, and publication", prompt: "Who owns source, artifacts, research notes, improvements, and approved excerpts? What may RN retain or reference?" },
  { key: "risks", label: "Dependencies and risks", prompt: "What access, availability, technical constraints, conflicts, missing voices, or external dependencies could invalidate the work?" },
  { key: "stopConditions", label: "Pause and stop conditions", prompt: "Which boundary crossings, missing authority, burden, disagreement, incident, or new fact automatically pauses or ends work?" },
  { key: "timeline", label: "Cadence and decision points", prompt: "Define phases, working sessions, review windows, compensation assumptions, and explicit stop/go gates—not an invented deadline." },
  { key: "handoff", label: "Transfer, aftercare, and close", prompt: "What must be documented, taught, exported, deleted, returned, reviewed, maintained, or retired when the engagement ends?", wide: true },
];

const productionDecisions = [
  ["Authority & membership", "Who may enter the workspace, who grants and revokes roles, and how identity and decision-making authority are verified separately."],
  ["Hosting & jurisdiction", "Where application, database, backups, logs, and subprocessors may operate—and which classes must remain locally controlled or offline."],
  ["Knowledge classes", "What may be public, internal, restricted, metadata-only, ephemeral, or never recorded in any digital system."],
  ["Retention & deletion", "How long each class survives, who can place a hold, what withdrawal can remove, and how deletion is verified across copies and backups."],
  ["Decision validity", "Which decisions require quorum, conditions, dissent, expiry, re-review, or more than one authority signature."],
  ["Incidents & repair", "Who is notified, who can contain or stop the system, how community direction governs remedy, and what remains in the audit record."],
] as const;

const initialProductionRecords: ProductionDecisionRecord[] = productionDecisions.map(() => ({ status: "Not examined", owner: "", evidence: "", conditions: "" }));

const questions: GateQuestion[] = [
  { id: "purpose", title: "Define the authorized purpose", prompt: "What legitimate need is this use permitted to serve—and who has standing to define it?", options: [{ id: "purpose-defined", label: "Purpose and standing are documented", effect: "pass" }, { id: "purpose-unresolved", label: "Purpose or standing needs confirmation", effect: "condition" }, { id: "purpose-external", label: "Purpose was imposed without relevant standing", effect: "block" }] },
  { id: "authority", title: "Identify standing for each decision", prompt: "Who may define boundaries, authorize collection and use, challenge operation, and withdraw permission?", options: [{ id: "authority-defined", label: "Decision functions and standing are documented", effect: "pass" }, { id: "authority-unresolved", label: "One or more authority functions are unresolved", effect: "condition" }, { id: "authority-absent", label: "No legitimate authority is involved", effect: "block" }] },
  { id: "intervention", title: "Test AI and non-AI alternatives", prompt: "Is AI necessary, or would people, policy, education, ordinary software, or no intervention work better?", options: [{ id: "intervention-justified", label: "The selected intervention is justified", effect: "pass" }, { id: "intervention-reconsider", label: "A non-AI path may be better", effect: "condition" }, { id: "intervention-unjustified", label: "The intervention is not justified", effect: "block" }] },
  { id: "knowledge", title: "Set knowledge and documentation boundaries", prompt: "Has the team identified what may be public, restricted, local-only, ephemeral, contextual, or never digitized?", options: [{ id: "knowledge-defined", label: "Boundaries are defined by appropriate authorities", effect: "pass" }, { id: "knowledge-unresolved", label: "Boundaries require further deliberation", effect: "condition" }, { id: "knowledge-crossed", label: "The proposed use would cross a prohibited boundary", effect: "block" }] },
  { id: "custody", title: "Trace custody and dependencies", prompt: "Can the team account for where information travels, which dependencies are involved, and what each may retain or reuse?", options: [{ id: "custody-known", label: "Custody and dependencies are documented", effect: "pass" }, { id: "custody-partial", label: "The route is only partly known", effect: "condition" }, { id: "custody-exposure", label: "The route creates prohibited exposure", effect: "block" }] },
  { id: "control", title: "Establish challenge and stopping power", prompt: "Can authorized people inspect, contest, change, migrate, pause, withdraw, and shut down the use?", options: [{ id: "control-operational", label: "Challenge and stopping paths are operational", effect: "pass" }, { id: "control-partial", label: "One or more control paths are incomplete", effect: "condition" }, { id: "control-outsourced", label: "Stopping power depends on an unaccountable outside party", effect: "block" }] },
  { id: "repair", title: "Define benefit, incident response, and repair", prompt: "Are expected benefit, accountable owners, containment, withdrawal, remedy, and recurrence prevention defined before use?", options: [{ id: "repair-defined", label: "Benefit and repair responsibilities are documented", effect: "pass" }, { id: "repair-incomplete", label: "Protections or owners remain unresolved", effect: "condition" }, { id: "repair-ownerless", label: "Potential harms have no accountable owner", effect: "block" }] },
];

const recordFields: { key: RecordKey; group: string; label: string; prompt: string; placeholder: string }[] = [
  { key: "purpose", group: "Mandate", label: "Authorized purpose", prompt: "What exact need is this use permitted to serve, and who has standing to define it?", placeholder: "Provisional purpose; identify who defined it, for whose claimed benefit, and what still requires confirmation." },
  { key: "authority", group: "Mandate", label: "Authority & standing", prompt: "Who may decide, participate, contest, and stop this use?", placeholder: "Name roles or bodies—not protected personal information—and the scope of each authority." },
  { key: "knowledge", group: "Boundaries", label: "Knowledge classification", prompt: "What is public, internal, restricted, local-only, ephemeral, seasonal, or never recorded?", placeholder: "Record categories and handling rules without entering the protected knowledge itself." },
  { key: "dataFlow", group: "Boundaries", label: "Data-flow map", prompt: "Where do collection, transfer, storage, inference, interpretation, sharing, and deletion occur?", placeholder: "Describe the route, locations, retention points, and prohibited flows." },
  { key: "dependencies", group: "Operation", label: "Vendors & dependencies", prompt: "Which outside systems, licenses, hardware, people, or services can affect control?", placeholder: "Name each dependency, purpose, retention or reuse rights, failure mode, and exit option." },
  { key: "allowed", group: "Operation", label: "Permitted uses", prompt: "What may happen, for whom, under which conditions?", placeholder: "List narrowly authorized uses; silence does not imply permission." },
  { key: "prohibited", group: "Operation", label: "Prohibited uses", prompt: "What must the system, its operators, and downstream users never do?", placeholder: "Include training, inference, publication, commercialization, surveillance, and secondary-use boundaries as relevant." },
  { key: "conditions", group: "Decision", label: "Decision conditions", prompt: "What must be true before launch, continued operation, change, or expansion?", placeholder: "Name the condition, owner, evidence needed, deadline, and consequence if unmet." },
  { key: "review", group: "Decision", label: "Review triggers", prompt: "What dates, changes, events, or failures force reconsideration?", placeholder: "Include expiry, model or vendor change, new data, new audience, incident, community request, and performance drift." },
  { key: "challenge", group: "Accountability", label: "Challenge & dissent", prompt: "How can a person or authority question a decision without retaliation or procedural burden?", placeholder: "Describe intake, standing, response time, independent review, escalation, and how dissent remains visible." },
  { key: "incident", group: "Accountability", label: "Incident & repair", prompt: "Who acts when a boundary is crossed or harm occurs?", placeholder: "Define containment, notice, investigation, community direction, remedy, learning, and recurrence prevention." },
  { key: "withdrawal", group: "Accountability", label: "Withdrawal & deletion", prompt: "How can permission be narrowed or withdrawn, and what can actually be deleted?", placeholder: "Distinguish future use, copies, derived data, models, backups, publications, and legal limits." },
  { key: "migration", group: "Exit", label: "Migration & continuity", prompt: "Can the community move the system, records, and know-how without losing control?", placeholder: "Record export formats, documentation, replacement dependencies, skills transfer, cost, and continuity owner." },
  { key: "retirement", group: "Exit", label: "Retirement & aftercare", prompt: "How is the system shut down, verified, archived, and remembered?", placeholder: "Define stop authority, shutdown sequence, deletion verification, surviving obligations, archive rules, and post-retirement review." },
];

const initialSystemRecord = Object.fromEntries(recordFields.map(field => [field.key, ""])) as Record<RecordKey, string>;

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.slice(0, 20_000) : fallback;
}

function normalizeStringRecord<T extends Record<string, string>>(base: T, candidate: unknown): T {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return base;
  return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, safeString((candidate as Record<string, unknown>)[key], fallback)])) as T;
}

function normalizeSnapshots(value: unknown): Snapshot[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    return [{ id: safeString(record.id, crypto.randomUUID()), label: safeString(record.label, "Imported version"), at: safeString(record.at), fields: normalizeStringRecord(initialSystemRecord, record.fields) }];
  });
}

function normalizeLogEntries(value: unknown): LogEntry[] {
  if (!Array.isArray(value)) return [];
  const kinds: LogEntry["kind"][] = ["Change", "Decision", "Review", "Incident"];
  return value.slice(0, 100).flatMap(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    if (!kinds.includes(record.kind as LogEntry["kind"])) return [];
    return [{ id: safeString(record.id, crypto.randomUUID()), kind: record.kind as LogEntry["kind"], summary: safeString(record.summary), actor: safeString(record.actor, "Imported demonstration entry"), at: safeString(record.at) }];
  });
}

function normalizeProductionRecords(value: unknown): ProductionDecisionRecord[] {
  if (!Array.isArray(value) || value.length !== productionDecisions.length) return initialProductionRecords;
  return value.map(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { status: "Not examined", owner: "", evidence: "", conditions: "" };
    const record = item as Record<string, unknown>;
    const status = productionStatuses.includes(record.status as ProductionStatus) ? record.status as ProductionStatus : "Not examined";
    return { status, owner: safeString(record.owner), evidence: safeString(record.evidence), conditions: safeString(record.conditions) };
  });
}

function Mark({ children }: { children: React.ReactNode }) { return <span className="mark">{children}</span>; }

function artifactEnvelope(artifactType: string, status: string) {
  return {
    artifactType,
    artifactSchemaVersion: "1.0",
    prototypeVersion: "1.2.1",
    generatedAt: new Date().toISOString(),
    canonicalUrl: "https://sovereign-stack-psi.vercel.app/",
    status,
    authorship: "Independent prototype by Rayven-Nikkita (RN) Collins",
    relationshipBoundary: "RN previously corresponded with Purple Maiʻa about the earlier proposal. Purple Maiʻa has not commissioned, adopted, endorsed, or validated this prototype.",
    nonAuthorization: "This artifact does not create consent, approval, community authority, a contract, or permission to access protected information or deploy a production system.",
  };
}

export function AuthorityLayerApp({ initialView = "review" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [meetingStep, setMeetingStep] = useState(0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [gateProjectName, setGateProjectName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectPurpose, setProjectPurpose] = useState("");
  const [recordValues, setRecordValues] = useState(initialSystemRecord);
  const [recordField, setRecordField] = useState<RecordKey>("purpose");
  const [recordVisibility, setRecordVisibility] = useState<"Internal" | "Restricted" | "Public excerpt">("Internal");
  const [activeRole, setActiveRole] = useState<Role>("Steward");
  const [recordOwner, setRecordOwner] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [decisionStatus, setDecisionStatus] = useState("Draft — no authority decision");
  const [decisionNote, setDecisionNote] = useState("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logDraft, setLogDraft] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [productionRecords, setProductionRecords] = useState<ProductionDecisionRecord[]>(initialProductionRecords);
  const [productionDecision, setProductionDecision] = useState(0);
  const [sessionRecord, setSessionRecord] = useState<SessionRecord>(initialSessionRecord);
  const [charterRecord, setCharterRecord] = useState<CharterRecord>(initialCharterRecord);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | "">("");
  const [reviewConstraint, setReviewConstraint] = useState("");
  const [reviewPeople, setReviewPeople] = useState("");
  const [reviewBoundary, setReviewBoundary] = useState("");
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceType>("All");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [eraseConfirmed, setEraseConfirmed] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLElement>(null);
  const privacyOpenerRef = useRef<HTMLElement | null>(null);
  const skipNextSaveRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect -- browser-local draft hydration is a one-time external-store read */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(V2_STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;
        setRecordValues(normalizeStringRecord(initialSystemRecord, data?.recordValues));
        setProjectName(safeString(data?.projectName));
        setRecordVisibility(recordVisibilities.includes(data?.recordVisibility) ? data.recordVisibility : "Internal");
        setRecordOwner(safeString(data?.recordOwner)); setReviewDate(safeString(data?.reviewDate));
        setDecisionStatus(decisionStatuses.includes(data?.decisionStatus) ? data.decisionStatus : "Draft — no authority decision"); setDecisionNote(safeString(data?.decisionNote));
        setSnapshots(normalizeSnapshots(data?.snapshots)); setLogEntries(normalizeLogEntries(data?.logEntries));
        setProductionRecords(normalizeProductionRecords(data?.productionRecords));
        setSessionRecord(normalizeStringRecord(initialSessionRecord, data?.sessionRecord));
        setCharterRecord(normalizeStringRecord(initialCharterRecord, data?.charterRecord));
      }
    } catch { /* A corrupt browser draft is ignored. */ }
    setStorageReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!storageReady) return;
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, data: { recordValues, projectName, recordVisibility, recordOwner, reviewDate, decisionStatus, decisionNote, snapshots: snapshots.slice(0, 20), logEntries: logEntries.slice(0, 100), productionRecords, sessionRecord, charterRecord } }));
        window.localStorage.removeItem(V2_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch { /* Browser storage may be unavailable or full; the in-memory demonstration remains usable. */ }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [storageReady, recordValues, projectName, recordVisibility, recordOwner, reviewDate, decisionStatus, decisionNote, snapshots, logEntries, productionRecords, sessionRecord, charterRecord]);

  useEffect(() => {
    if (!privacyOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const backgroundElements = Array.from(document.querySelectorAll<HTMLElement>("main > :not(.privacy-panel)"));
    backgroundElements.forEach(element => element.setAttribute("inert", ""));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePrivacy();
      if (event.key !== "Tab" || !privacyRef.current) return;
      const focusable = Array.from(privacyRef.current.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(element => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; backgroundElements.forEach(element => element.removeAttribute("inert")); document.removeEventListener("keydown", onKeyDown); };
  }, [privacyOpen]);

  useEffect(() => {
    const onPopState = () => {
      const restoredView = viewFromPathname(window.location.pathname);
      if (restoredView) setView(restoredView);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const canEdit = activeRole === "Steward" || activeRole === "Technical contributor";
  const canDecide = activeRole === "Authority reviewer";
  function addLog(kind: LogEntry["kind"], summary: string) {
    if (!summary.trim()) return;
    setLogEntries(current => [{ id: crypto.randomUUID(), kind, summary: summary.trim(), actor: `${activeRole} (demonstration)`, at: new Date().toISOString() }, ...current].slice(0, 100));
  }
  function saveSnapshot() {
    const next = { id: crypto.randomUUID(), label: `Version ${snapshots.length + 1}`, at: new Date().toISOString(), fields: { ...recordValues } };
    setSnapshots(current => [next, ...current].slice(0, 20)); addLog("Change", `${next.label} preserved as a read-only demonstration snapshot.`);
  }
  function recordDecision() {
    if (!canDecide || !decisionNote.trim()) return;
    addLog("Decision", `${decisionStatus}: ${decisionNote}`); setDecisionNote("");
  }

  const result = useMemo(() => {
    const selected = questions.map((question, index) => question.options.find(option => option.id === answers[index]));
    if (selected.some(option => !option)) return null;
    const stop = selected.some(option => option?.effect === "block");
    const pause = selected.some(option => option?.effect === "condition");
    if (stop) return { label: "Do not proceed", note: "A foundational condition is absent or a prohibited exposure is present. Stop the proposed activity, preserve no new data, and return the question to the relevant authority." };
    if (pause) return { label: "Pause and redesign", note: "The proposal may have value, but it is not ready. Name an owner and resolution path for every open authority, boundary, custody, control, or repair question." };
    return { label: "Eligible for authority review", note: "The proposal may move to the designated authority for deliberation. Passing this gate is not consent, approval, or proof that the project should be built." };
  }, [answers]);

  const openConditions = useMemo(() => questions.flatMap((question, index) => {
    const option = question.options.find(candidate => candidate.id === answers[index]);
    if (!option || option.effect === "pass") return [];
    return [{ area: question.title, answer: option.label, note: notes[index] || "No rationale recorded" }];
  }), [answers, notes]);

  function choose(answer: string) {
    const next = [...answers]; next[step] = answer; setAnswers(next.slice(0, step + 1));
    setNotes(current => current.slice(0, step + 1));
    if (step < questions.length - 1) setStep(step + 1);
    else window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }
  function selectView(id: View) {
    setView(id);
    const nextPath = VIEW_PATHS[id];
    if (window.location.pathname !== nextPath) window.history.pushState({ authorityLayerView: id }, "", nextPath);
    window.setTimeout(() => {
      const destination = document.getElementById(`${id}-content`);
      destination?.scrollIntoView({ behavior: "smooth", block: "start" });
      destination?.focus({ preventScroll: true });
    }, 0);
  }
  function returnToBeginning() {
    setView("review");
    if (window.location.pathname !== VIEW_PATHS.review) window.history.pushState({ authorityLayerView: "review" }, "", VIEW_PATHS.review);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function copyResponsePrompt() {
    const prompt = "My reaction to Authority Layer: [relevant constraint / already addressed / revise / not useful now / refer]. The person or role best placed to assess it is: [role or team]. The most important correction or boundary is: [note].";
    try {
      await navigator.clipboard.writeText(prompt);
      setResponseCopied(true);
      window.setTimeout(() => setResponseCopied(false), 3000);
    } catch {
      setResponseCopied(false);
    }
  }
  function clearGate() { setAnswers([]); setNotes([]); setStep(0); setGateProjectName(""); setProjectPurpose(""); }
  function downloadText(filename: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
  }
  function exportMeetingBrief() {
    downloadText("authority-layer-executive-brief.md", `# Authority Layer\n\n**Independent prototype by Rayven-Nikkita (RN) Collins**  \n**Version 1.2.1 · 13 September 2026**\n\nPurple Maiʻa has publicly described a technical Sovereign Stack in terms of local compute, open models, AI coding agents, edge systems, and sovereignty-first technology development.\n\nAuthority Layer explores a narrower operational question:\n\n**How could the decision governing one specific use remain attached as its models, data flows, vendors, people, purposes, and operating conditions change?**\n\nThe prototype demonstrates:\n\n- a complete fictional lifecycle simulation;\n- a pre-build Decision Gate;\n- a living Authority Record;\n- implementation binding and material-change review;\n- versioned permissions, conditions, dissent, and review;\n- challenge, incident, withdrawal, migration, and retirement paths; and\n- a staged engagement process that can stop before implementation.\n\nRN is not claiming that Purple Maiʻa lacks governance practices or proposing to define Hawaiian values, community authority, or kānāwai. Public information cannot establish whether the proposed layer is useful, redundant, or misframed.\n\n## Immediate request\n\nA 20–25-minute pressure test—not approval or adoption. Useful determinations include:\n\n1. a real operational constraint exists;\n2. Purple Maiʻa already addresses it;\n3. the concept should be revised or referred; or\n4. the proposed layer is not useful.\n\nOnly if Purple Maiʻa identifies a genuine gap would RN propose a separately scoped, compensated discovery engagement using one fictional or approved non-sensitive scenario.\n\n## Boundaries\n\n- Purple Maiʻa and relevant community and cultural authorities define substance and decision-making roles.\n- Protected knowledge does not belong in this public browser demonstration.\n- Public excerpts require separate review and approval.\n- Interest, attendance, form completion, or download does not create authority or consent.\n- Revision, referral, redundancy, deferral, and stopping are useful findings.\n\n## Primary public sources\n\n- ʻĀina Foundry, “The Sovereign Stack” event description: https://luma.com/88dnl4w1\n- Purple Maiʻa, ʻĀina Foundry: https://www.purplemaia.org/ainafoundry\n- ʻĀina Foundry prototype log: https://blog.labs.purplemaia.org/\n\n**Prepared by Rayven-Nikkita (RN) Collins**  \nGovernance and legal-technical implementation  \nhttps://sovereign-stack-psi.vercel.app/\n\nRN previously corresponded with Purple Maiʻa about the earlier proposal. Purple Maiʻa has not commissioned, adopted, endorsed, or validated this prototype.\n`);
  }
  function eraseAllDrafts() {
    skipNextSaveRef.current = true;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(V2_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setRecordValues(initialSystemRecord); setGateProjectName(""); setProjectName(""); setProjectPurpose(""); setRecordVisibility("Internal");
    setRecordOwner(""); setReviewDate(""); setDecisionStatus("Draft — no authority decision"); setDecisionNote("");
    setSnapshots([]); setLogEntries([]); setProductionRecords(initialProductionRecords); setSessionRecord(initialSessionRecord);
    setCharterRecord(initialCharterRecord); setReviewResponse(""); setReviewConstraint(""); setReviewPeople(""); setReviewBoundary("");
    setAnswers([]); setNotes([]); setStep(0); setEraseConfirmed(true);
  }
  function openPrivacy() {
    privacyOpenerRef.current = document.activeElement as HTMLElement | null;
    setEraseConfirmed(false);
    setPrivacyOpen(true);
  }
  function closePrivacy() {
    setPrivacyOpen(false);
    window.setTimeout(() => privacyOpenerRef.current?.focus(), 0);
  }
  function carryToRecord() {
    const incomingConditions = openConditions.map(condition => `${condition.area}: ${condition.answer} — ${condition.note}`).join("\n");
    const wouldReplace = (projectPurpose.trim() && recordValues.purpose.trim()) || (incomingConditions && recordValues.conditions.trim());
    if (wouldReplace && !window.confirm("The Authority Record already contains a purpose or conditions. Replace those fields with this Decision Gate result?")) return;
    if (gateProjectName.trim()) setProjectName(gateProjectName.trim());
    setRecordValues(current => ({ ...current, purpose: projectPurpose || current.purpose, conditions: incomingConditions || current.conditions }));
    setRecordField("purpose");
    selectView("record");
  }
  function exportRecord() {
    if (!result) return;
    const payload = {
      ...artifactEnvelope("decision-gate-review", "UNVALIDATED DEMONSTRATION"),
      project: gateProjectName || "Unnamed proposed use",
      statedPurpose: projectPurpose || "Not recorded",
      outcome: result.label,
      outcomeNote: result.note,
      reviewedAt: new Date().toISOString(),
      responses: questions.map((question, index) => { const option = question.options.find(candidate => candidate.id === answers[index]); return { id: question.id, area: question.title, question: question.prompt, responseId: option?.id || "unanswered", response: option?.label || "Unanswered", effect: option?.effect || "block", rationale: notes[index] || "Not recorded" }; }),
      openConditions,
      caveat: "This demonstration is not consent, approval, Purple Maiʻa policy, or a substitute for the designated authority's deliberation."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${(gateProjectName || "authority-layer-review").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "authority-layer-review"}.json`; link.click(); URL.revokeObjectURL(url);
  }
  function exportProductionBrief() {
    const approved = productionRecords.filter(record => record.status === "Approved for prototype").length;
    const blocked = productionRecords.filter(record => record.status === "Blocked").length;
    const payload = {
      ...artifactEnvelope("production-decision-brief", "PROVISIONAL — REQUIRES REVIEW BY DESIGNATED DECISION-MAKERS"),
      document: "Authority Layer production decision brief",
      purpose: "Decisions required before protected or authoritative records move beyond the browser demonstration.",
      readiness: { approved, total: productionDecisions.length, blocked, demonstrationCriteriaMarkedComplete: approved === productionDecisions.length && blocked === 0, backendActivationPermitted: false, determination: approved === productionDecisions.length && blocked === 0 ? "Eligible for a separately authorized technical prototype; not authorization to store protected knowledge." : "Backend activation remains blocked." },
      requiredDecisions: productionDecisions.map(([decision, question], index) => ({ decision, question, ...productionRecords[index] })),
      nonNegotiableControls: [
        "Authentication never substitutes for community authority.",
        "Authorization is enforced on the server for every read, write, export, and administrative action.",
        "Public excerpts are separately approved records, not live views of internal records.",
        "Sensitive values are excluded from logs, analytics, notifications, URLs, and client storage.",
        "Authority decisions bind verified identity, authority scope, record version, conditions, dissent, expiry, and timestamp.",
        "Every record has retention, review, withdrawal, export, migration, and retirement rules before activation.",
      ],
      candidateArchitectureForReview: {
        publicSurface: "Public proposal and separately approved public excerpts",
        protectedWorkspace: "Authenticated, invitation-only workspace with server-enforced least privilege",
        authoritativeStore: "Encrypted relational records with append-only event history and version hashes",
        notifications: "Metadata-minimized review and incident notices; protected content stays inside the workspace",
        exports: "Authorized, watermarked, logged, and classified; public exports require separate approval",
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "authority-layer-production-decision-brief.json"; a.click(); URL.revokeObjectURL(url);
  }
  function updateProductionRecord(patch: Partial<ProductionDecisionRecord>) {
    setProductionRecords(current => current.map((record, index) => index === productionDecision ? { ...record, ...patch } : record));
  }
  function updateSessionRecord(key: keyof SessionRecord, value: string) {
    setSessionRecord(current => ({ ...current, [key]: value }));
  }
  function exportSessionBrief() {
    const payload = {
      ...artifactEnvelope("co-design-session-brief", "PROVISIONAL — NON-SENSITIVE DISCOVERY RECORD"),
      document: "Authority Layer co-design session brief",
      purpose: "Facilitate a discovery session convened by Purple Maiʻa and governed by the decision-makers it identifies, without presuming authority, scope, or a decision to build.",
      session: sessionRecord,
      agenda: sessionAgenda.map(([time, stage, purpose]) => ({ time, stage, purpose })),
      decisionRule: "The close must record one of four outcomes: stop; continue discovery; revise the proposal; or invite a bounded prototype. Silence is not consent and attendance is not authority.",
      requiredOutputs: ["Standing and participation map", "Recording and knowledge boundaries", "Bounded use-case map", "Decision owners and evidence needs", "Dissent and unresolved questions", "Stop/go determination with authorized next actions"],
      caveat: "This brief does not establish authority, consent, Purple Maiʻa policy, or permission to record protected knowledge. Purple Maiʻa determines participation, language, documentation, ownership, compensation, confidentiality, and whether the session occurs at all."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "authority-layer-codesign-session-brief.json"; link.click(); URL.revokeObjectURL(url);
  }
  function updateCharterRecord(key: keyof CharterRecord, value: string) {
    setCharterRecord(current => ({ ...current, [key]: value }));
  }
  function exportPilotCharter() {
    const drafted = Object.values(charterRecord).filter(value => value.trim()).length;
    const payload = {
      ...artifactEnvelope("pilot-charter", "DRAFT — INVITATION AND AUTHORITY REQUIRED"),
      document: "Authority Layer pilot charter",
      readiness: { drafted, total: charterFields.length, determination: drafted === charterFields.length ? "Complete enough for authority review; not approved." : "Incomplete draft; unresolved fields remain visible." },
      charter: charterRecord,
      requiredGates: [
        "The relevant authority confirms standing, knowledge boundaries, and the permitted use case.",
        "Purple Maiʻa confirms scope, compensation, confidentiality, ownership, participants, and organizational sponsor.",
        "Protected information remains outside the demonstration unless separately authorized production controls exist.",
        "A named stop/go decision occurs after discovery and again before any implementation or public learning output.",
        "Transfer, deletion, retention, maintenance, and retirement obligations are agreed before work begins."
      ],
      nonAuthorization: "Completing or downloading this charter does not create a contract, consent, community authority, Purple Maiʻa approval, permission to access protected knowledge, or permission to build or deploy a production system."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "authority-layer-bounded-pilot-charter.json"; link.click(); URL.revokeObjectURL(url);
  }
  function exportSystemRecord() {
    const payload = { ...artifactEnvelope("authority-record", "UNVALIDATED DEMONSTRATION"), recordType: "Authority Layer living authority record", project: projectName || "Unnamed proposed use", visibility: recordVisibility, steward: recordOwner || "Not established", nextReview: reviewDate || "Not scheduled", authorityDecision: decisionStatus, exportedAt: new Date().toISOString(), fields: Object.fromEntries(recordFields.map(field => [field.label, recordValues[field.key] || "Unresolved — no entry recorded"])), versionHistory: snapshots, activityLog: logEntries, completeness: `${recordFields.filter(field => recordValues[field.key].trim()).length} of ${recordFields.length} fields contain demonstration entries`, caveat: "This record is a browser-local, unvalidated demonstration. Its roles and signatures are not identity-verified. It is not consent, approval, Purple Maiʻa policy, or a factual account of any Purple Maiʻa system or governance practice." };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${(projectName || "authority-layer-record").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "authority-layer-record"}-authority-record.json`; link.click(); URL.revokeObjectURL(url);
  }
  function exportExecutiveBrief() {
    const payload = {
      ...artifactEnvelope("executive-review", "CONVERSATION RECORD — NOT AUTHORIZATION"),
      document: "Authority Layer executive review brief",
      proposition: "Pressure-test whether Purple Maiʻa's Sovereign Stack would benefit from an operational authority layer—or whether existing work makes the proposal redundant.",
      response: reviewResponse || "No response selected",
      constraint: reviewConstraint || "Not recorded",
      peopleOrAuthoritiesToInclude: reviewPeople || "Not recorded",
      boundaryOrExistingWorkToProtect: reviewBoundary || "Not recorded",
      possibleNextStep: reviewResponse === "Continue discovery" || reviewResponse === "I see a relevant constraint" ? "Purple Maiʻa identifies a sponsor and appropriate participants for a separately scoped, compensated discovery conversation." : reviewResponse === "Revise the concept" ? "RN revises only against the specific constraint and boundaries Purple Maiʻa chooses to share." : reviewResponse === "Not mine to decide" ? "If appropriate, identify the role or body with decision-making authority. No further work proceeds unless that person or body chooses to engage." : "No work proceeds unless Purple Maiʻa later reopens the question.",
      nonAuthorization: "This brief is not consent, approval, a pilot invitation, a contract, permission to document KILO, or permission to access or store protected information."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "authority-layer-executive-review.json"; link.click(); URL.revokeObjectURL(url);
  }

  function exportEvidenceRegister() {
    const payload = {
      ...artifactEnvelope("assumption-ledger", "WORKING PROPOSAL — NOT PURPLE MAIʻA POLICY"),
      document: "Authority Layer Assumption Ledger",
      entries: evidenceItems,
      reviewRule: "Public records, RN synthesis, hypotheses, proposed designs, and unresolved questions must remain distinguishable. Purple Maiʻa may correct, reject, restrict, or replace any entry.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "authority-layer-assumption-ledger.json"; link.click(); URL.revokeObjectURL(url);
  }

  return <main>
    <a className="skip-link" href="#section-navigation">Skip to section navigation</a>
    <div className="print-meta"><b>Authority Layer · Independent prototype by Rayven-Nikkita (RN) Collins</b><span>Version 1.2.1 · https://sovereign-stack-psi.vercel.app/</span><span>Not commissioned, adopted, endorsed, or validated by Purple Maiʻa. Nothing printed from this demonstration creates authority or authorization.</span></div>
    <header className="topbar">
      <button className="wordmark" onClick={returnToBeginning} aria-label="Return to beginning"><span className="knot" aria-hidden="true">◈</span><span>Authority Layer</span></button>
      <button className="ownership status-control" onClick={openPrivacy} aria-expanded={privacyOpen}><span />Independent prototype · status &amp; privacy</button>
    </header>

    {privacyOpen && <aside id="status-privacy-panel" ref={privacyRef} className="privacy-panel" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <button autoFocus className="privacy-close" onClick={closePrivacy} aria-label="Close status and privacy panel">×</button>
      <p className="overline">Status, privacy &amp; local drafts</p><h2 id="privacy-title">Know what this prototype does—and does not do.</h2>
      <div className="privacy-grid"><article><b>Authorship and status</b><p>Independent prototype by Rayven-Nikkita Collins, developed from the publicly available sources listed in the Assumption Ledger. RN previously corresponded with Purple Maiʻa about the earlier proposal. This prototype was not commissioned, adopted, endorsed, or validated by Purple Maiʻa. It is not a Purple Maiʻa product, policy, approved protocol, or community-authorized framework.</p></article><article><b>What this browser stores</b><p>Draft authority-record, production-readiness, session, and charter entries are saved only in this browser&apos;s local storage so they can survive refresh.</p></article><article><b>What is transmitted</b><p>This application has no account, database, form-submission endpoint, or configured analytics. The hosting provider necessarily processes ordinary request metadata, but text entered into these workspaces is not submitted to RN or an application database.</p></article><article><b>What must never be entered</b><p>Do not enter protected cultural knowledge, personal data, credentials, confidential organizational information, authority decisions, or anything requiring secure retention.</p></article></div>
      <div className="privacy-actions"><div><b>Version 1.2.1 · updated 13 September 2026</b><span>Public demonstration · browser-local drafting only</span></div><button onClick={eraseAllDrafts}>Erase all browser drafts</button></div>
      {eraseConfirmed&&<p className="erase-confirm" role="status">All Authority Layer drafts stored by this site in this browser have been erased.</p>}
    </aside>}

    <section className="hero">
      <div className="hero-copy">
        <p className="overline">Independent proposal + high-fidelity product simulation</p>
        <h1>Infrastructure can be local.<br/><em>Authority must travel through it.</em></h1>
        <p className="authority-definition"><strong>Authority Layer prevents a use from quietly outgrowing the decision that authorized it.</strong></p>
        <p className="lede">Purple Maiʻa has publicly described the technical Sovereign Stack. <strong>Authority Layer</strong> is RN Collins’s independent prototype for testing a narrower operational question: how could the decision governing one specific use remain attached as its models, data flows, vendors, people, purposes, and operating conditions change?</p>
        <p className="authority-definition">Here, authority means documented decision-making power held by identified roles or bodies for a specific use. It is not inferred from ownership, expertise, employment, participation, or account access.</p>
        <div className="hero-actions"><button className="primary light" onClick={() => selectView("simulation")}>Walk one fictional use <span>→</span></button><button className="text-link" onClick={() => selectView("review")}>Pressure-test the premise</button><button className="text-link" onClick={() => selectView("evidence")}>Inspect the evidence</button></div>
      </div>
      <div className="hero-orbit" role="img" aria-label="Purpose, authority, knowledge, and control surrounding one authorized use throughout its lifecycle"><div className="orbit orbit-a"><span>Purpose</span><span>Authority</span></div><div className="orbit orbit-b"><span>Knowledge</span><span>Control</span></div><div className="orbit-core">Authorized<br/><small>use</small></div></div>
    </section>

    <div className="scope-strip"><b>Independent prototype. Proposed basis for conversation—not a request for adoption.</b><span>RN previously corresponded with Purple Maiʻa about the earlier proposal. Purple Maiʻa has not commissioned, adopted, endorsed, or validated this prototype. Any further work would begin by testing whether the hypothesized need is real, already addressed, or framed at the wrong layer.</span></div>

    <section id="what-changed" className="update-panel" aria-labelledby="update-title">
      <div><p className="overline">Why this is being resurfaced now</p><h2 id="update-title">Purple Maiʻa’s public Sovereign Stack work made the original question more specific.</h2><p>On 2 September 2026, ʻĀina Foundry publicly presented a Sovereign Stack described in terms of open models, local compute, AI coding agents, and a path toward edge hardware. That public description does not establish an internal governance gap. It makes a narrower lifecycle question possible to test: <strong>when an authorized use changes technically, what makes its original authority decision continue, expire, narrow, or return for review?</strong></p></div>
      <div className="precision-grid"><article><span>Public record</span><b>Purple Maiʻa has publicly described sovereignty-first technical work.</b></article><article><span>RN synthesis</span><b>Technical control and decision-making authority are related, but not necessarily identical.</b></article><article><span>Hypothesis</span><b>A use-specific, versioned authority record may keep decisions operational as systems change.</b></article><article><span>Unresolved</span><b>Purple Maiʻa may already address this, define another problem, or see no useful need.</b></article></div>
    </section>

    <nav id="section-navigation" className="section-nav" aria-label="Authority Layer sections"><div className="nav-primary">{primaryNav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => selectView(item.id)}><span>{item.eyebrow}</span>{item.label}</button>)}</div><details className="nav-support"><summary>Supporting tools <span>{supportingNav.length}</span></summary><div>{supportingNav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => selectView(item.id)}><span>{item.eyebrow}</span>{item.label}</button>)}</div></details></nav>

    {view === "meeting" && <section id="meeting-content" className="content meeting-mode" tabIndex={-1}>
      <div className="meeting-top"><div><p className="overline">Short walkthrough · six steps · approximately seven minutes</p><h2>A seven-minute overview of the revised proposal.</h2></div><p>Detailed evidence and working tools remain available in the numbered sections.</p></div>
      <div className="meeting-progress" aria-label={`Walkthrough step ${meetingStep + 1} of ${meetingSlides.length}`}>{meetingSlides.map((slide,index)=><button key={slide.label} className={index===meetingStep?"active":index<meetingStep?"complete":""} onClick={()=>setMeetingStep(index)} aria-current={index===meetingStep?"step":undefined} aria-label={`Go to ${slide.label}`}><span>{String(index+1).padStart(2,"0")}</span><b>{slide.label}</b></button>)}</div>
      <article className="meeting-card" aria-live="polite">
        <div className="meeting-number">{String(meetingStep+1).padStart(2,"0")}<small>/ {String(meetingSlides.length).padStart(2,"0")}</small></div>
        <div><p className="overline">{meetingSlides[meetingStep].label}</p><h3>{meetingSlides[meetingStep].title}</h3><p className="meeting-body">{meetingSlides[meetingStep].body}</p><div className="meeting-proof"><b>Limits of this claim</b><span>{meetingSlides[meetingStep].proof}</span></div></div>
      </article>
      {meetingStep===3 && <div className="rn-proof"><div><span>Build</span><b>Interactive AI and governance products</b></div><div><span>Translate</span><b>Law, evidence, systems, and implementation</b></div><div><span>Design</span><b>Human-centered learning and decision tools</b></div><div><span>Transfer</span><b>Editable systems the client can maintain</b></div></div>}
      {meetingStep===4 && <div className="engagement-scope"><article><span>Inputs</span><b>Sponsor context, approved public or non-sensitive materials, participation and recording boundaries</b></article><article><span>Working sequence</span><b>60-minute sponsor interview → preparation → 90-minute governed session → synthesis</b></article><article><span>Outputs</span><b>Constraint definition, authority/standing map, boundary register, scenario trace, and stop/revise/pilot recommendation</b></article><article><span>Not included</span><b>Protected-data access, production system, community-wide claims, public materials, or a presumed pilot</b></article></div>}
      <div className="meeting-controls"><button disabled={meetingStep===0} onClick={()=>setMeetingStep(step=>Math.max(0,step-1))}>← Previous</button><span>{meetingSlides[meetingStep].label}</span>{meetingStep<meetingSlides.length-1?<button className="primary" onClick={()=>setMeetingStep(step=>Math.min(meetingSlides.length-1,step+1))}>Next <span>→</span></button>:<button className="primary" onClick={()=>selectView("review")}>Record a response <span>→</span></button>}</div>
      <div className="meeting-links"><button onClick={exportMeetingBrief}>Download the one-page brief</button><button onClick={()=>window.print()}>Print / save as PDF</button><button onClick={()=>selectView("evidence")}>Inspect the Assumption Ledger</button><button onClick={()=>selectView("session")}>Inspect the co-design session</button><button onClick={()=>selectView("charter")}>Inspect the pilot boundary</button></div>
    </section>}

    {view === "simulation" && <section id="simulation-content" className="content simulation-view" tabIndex={-1}>
      <LifecycleSimulation />
      <div className="simulation-next"><div><p className="overline">The product claim this demonstrates</p><h3>The interface did not make the decision. It kept the decision, its scope, its conditions, and its limits visible when the technology changed.</h3></div><div><button onClick={() => selectView("proposal")}>Inspect the system design →</button><button onClick={() => selectView("gate")}>Open the editable Decision Gate →</button><button onClick={() => selectView("record")}>Open the editable Authority Record →</button></div></div>
    </section>}

    {view === "overview" && <section id="overview-content" className="content overview" tabIndex={-1}>
      <div className="section-intro"><p className="overline">The hypothesis</p><h2>Purple Maiʻa has publicly described specific technical components and directions. How might authority remain attached to one use over time?</h2><p>Purple Maiʻa already articulates sovereignty, community governance, and responsibility. This prototype does not supply those principles. It tests whether a use-specific operational layer could help carry legitimate decisions through changing models, vendors, people, purposes, incidents, and eventual exit.</p></div>
      <div className="evidence-band"><div><b>Public record</b><span>Purple Maiʻa’s published Sovereign Stack, ʻĀina Foundry, KILO, Kānāwai, Kula, and prototype work.</span></div><div><b>Proposed by RN</b><span>The decision gate, authority record, lifecycle controls, discovery sequence, and optional learning translation shown here.</span></div><div><b>Not yet known</b><span>Whether this solves a real constraint, duplicates existing work, points to the right layer, or should proceed at all.</span></div></div>
      <div className="principles">
        <article><Mark>01</Mark><h3>Relevant authorities define the purpose</h3><p>No project begins with a model. It begins with a legitimate need and people or bodies with standing to define the purpose, scope, and claimed benefit.</p></article>
        <article><Mark>02</Mark><h3>Not everything becomes data</h3><p>The process must make room for knowledge that is restricted, contextual, ephemeral, seasonal, sacred, or never appropriate to digitize.</p></article>
        <article><Mark>03</Mark><h3>Refusal is an operating capability</h3><p>This proposed design treats approve, limit, redesign, defer, challenge, withdraw, and refuse as valid outcomes. “No” is not a technical failure.</p></article>
      </div>
      <div className="callout"><p>Designed under authority, never in place of it.</p><span>RN’s proposed role is governance and legal-technical translation: listening, mapping, documenting, prototyping, testing, and transferring the implementation. RN would not define Hawaiian values, decide who speaks for a community, validate kānāwai, or authorize a use of knowledge or data.</span></div>
      <button className="primary" onClick={() => selectView("proposal")}>Inspect the proposed mechanism <span>→</span></button>
    </section>}

    {view === "proposal" && <section id="proposal-content" className="content proposal" tabIndex={-1}>
      <ProductAnatomy />
      <div className="ownership-grid"><article><p className="label">Purple Maiʻa would determine for its materials</p><ul><li>Access to and use of its organization-created records, decisions, configurations, language, and approved outputs</li><li>What remains internal, restricted, publishable, revisable, or retired</li><li>Community-defined material remains subject to the rights, restrictions, and authority identified by its holders</li></ul></article><article><p className="label">The license and agreement would define</p><ul><li>The existing Authority Layer prototype source is available under Apache-2.0; a future agreement would address project-specific implementation work, configurations, services, maintenance, and deliverables</li><li>Confidentiality, retention, attribution, publication, and portfolio rights</li><li>Transfer, maintenance, deletion, migration, and closeout obligations</li></ul></article><article><p className="label">The tool would never do</p><ul><li>Decide who holds cultural or community authority</li><li>Convert consent into a one-time checkbox</li><li>Treat passage through a form as approval</li><li>Expose protected knowledge to prove accountability</li></ul></article></div>
      <div className="proposal-actions"><button className="primary" onClick={() => selectView("simulation")}>Walk the complete lifecycle <span>→</span></button><button onClick={() => selectView("definitions")}>Read operational definitions</button><button onClick={() => selectView("readiness")}>Inspect production requirements</button></div>
    </section>}

    {view === "gate" && <section id="gate-content" className="content gate" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Pre-build protocol · demonstration</p><h2>Should this enter the stack?</h2><p>Gate responses and rationales are not retained after refresh. Other demonstration workspaces store drafts locally in this browser, as described under Status &amp; Privacy. Nothing is submitted to RN or a server. In practice, deliberation, evidence, named roles, conditions, dissent, and review dates would sit behind each response.</p></div>
      <div className="gate-intake" aria-label="Proposed use context"><label><span>Proposed use or project</span><input value={gateProjectName} onChange={event=>setGateProjectName(event.target.value)} placeholder="e.g., a fictional internal drafting assistant" /></label><label><span>Authorized purpose—as currently understood</span><textarea value={projectPurpose} onChange={event=>setProjectPurpose(event.target.value)} placeholder="State the proposed purpose and who may define it without entering restricted or sensitive knowledge." rows={2} /></label><p><b>Privacy boundary</b> · Use a hypothetical or non-sensitive scenario. Gate answers, rationales, the proposed-use name, and purpose clear on refresh. If you choose “Continue to Authority Record,” the name and relevant entries are copied into that browser-local workspace.</p></div>
      <div className="gate-shell"><aside>{questions.map((q,i)=><button key={q.title} className={`${i===step?"current":""} ${answers[i]?"done":""}`} onClick={()=>setStep(i)} aria-current={i===step?"step":undefined}><span>{answers[i]?"✓":i+1}</span>{q.title}</button>)}</aside><div className="question-panel">
        <p className="counter">Question {step+1} of {questions.length}</p><h3>{questions[step].title}</h3><p>{questions[step].prompt}</p>
        <fieldset className="options"><legend className="sr-only">{questions[step].title}</legend>{questions[step].options.map(option=><label key={option.id} className={answers[step]===option.id?"selected":""}><input type="radio" name={`gate-${questions[step].id}`} checked={answers[step]===option.id} onChange={()=>choose(option.id)} /><span aria-hidden="true"/>{option.label}</label>)}</fieldset>
        <label className="rationale"><span>Rationale, evidence, dissent, or unresolved question <i>optional in this demonstration</i></span><textarea value={notes[step] || ""} onChange={event=>{const next=[...notes];next[step]=event.target.value;setNotes(next)}} placeholder="Record why this response was chosen without entering protected content." rows={3}/></label>
        {result && step===questions.length-1 && <div ref={resultRef} className="result" role="status" aria-live="polite"><p>Unvalidated demonstration result</p><h4>{result.label}</h4><span>{result.note}</span><div className="result-meta"><b>{gateProjectName || "Unnamed proposed use"}</b><span>{openConditions.length} open or blocking condition{openConditions.length===1?"":"s"}</span></div>{openConditions.length>0&&<div className="condition-list">{openConditions.map(condition=><div key={condition.area}><b>{condition.area}</b><span>{condition.answer}</span><small>{condition.note}</small></div>)}</div>}<div className="result-actions"><button onClick={carryToRecord}>Continue to authority record →</button><button onClick={exportRecord}>Download review record</button><button onClick={()=>window.print()}>Print / save as PDF</button><button onClick={clearGate}>Clear demonstration</button></div></div>}
        <div className="gate-footer"><button disabled={step===0} onClick={()=>setStep(step-1)}>← Previous</button><span>Decision belongs to the designated authority</span><button disabled={step===questions.length-1 || !questions[step].options.some(option=>option.id===answers[step])} onClick={()=>setStep(step+1)}>Next →</button></div>
      </div></div>
      <div className="gate-after"><b>A production version would add:</b><span>Named roles and standing · evidence and rationale · approval conditions · dissent and unresolved questions · risk and benefit owners · review triggers and expiry · access controls · change history · challenge, incident, withdrawal, and repair paths.</span></div>
    </section>}

    {view === "record" && <section id="record-content" className="content record" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Living authority record · working demonstration</p><h2>Carry a decision through the system’s life.</h2><p>This editable record demonstrates a container—not any Purple Maiʻa system or governance practice. Enter only hypothetical or non-sensitive material. The working draft persists only in this browser until you erase it; nothing is sent to a server.</p></div>
      <div className="status-row"><span className="status">Unvalidated demonstration</span><span>{recordFields.filter(field=>recordValues[field.key].trim()).length} of {recordFields.length} fields drafted · Decision-making authority remains unvalidated{recordOwner.trim() ? ` · steward: ${recordOwner}` : " · record steward not established"}{reviewDate ? ` · review: ${reviewDate}` : " · review date not established"}</span></div>
      <div className="record-toolbar"><div><label>Record name<input disabled={!canEdit} value={projectName} onChange={event=>setProjectName(event.target.value)} placeholder="e.g., fictional public-information drafting assistant" /></label><label>Demonstration visibility<select disabled={!canEdit} value={recordVisibility} onChange={event=>setRecordVisibility(event.target.value as typeof recordVisibility)}><option>Internal</option><option>Restricted</option><option>Public excerpt</option></select></label></div><p><b>Classification is a governance decision, not a publishing toggle.</b> A production system would enforce access, approval, redaction, and separate public/internal records. This selector only demonstrates the required distinction.</p></div>
      <div className="record-workspace"><aside aria-label="Authority record fields">{[...new Set(recordFields.map(field=>field.group))].map(group=><div key={group}><p>{group}</p>{recordFields.filter(field=>field.group===group).map(field=><button key={field.key} className={recordField===field.key?"active":""} aria-current={recordField===field.key?"page":undefined} onClick={()=>setRecordField(field.key)}><span>{recordValues[field.key].trim()?"✓":"○"}</span>{field.label}</button>)}</div>)}</aside><div className="record-editor">{recordFields.filter(field=>field.key===recordField).map(field=><div key={field.key}><p className="overline">{field.group} · editable field</p><h3>{field.label}</h3><p>{field.prompt}</p><label><span>Demonstration entry</span><textarea disabled={!canEdit} rows={11} value={recordValues[field.key]} onChange={event=>setRecordValues(current=>({...current,[field.key]:event.target.value}))} placeholder={canEdit ? field.placeholder : "Switch to Steward or Technical contributor to edit this illustrative field."}/></label><div className="record-guidance"><b>Evidence status must remain visible</b><span>In production, each entry would identify whether it is a community-defined rule, public record, authority-validated record, technical observation, interpretation, proposal, dissent, or unresolved question—plus its source, authority, date, and review trigger.</span></div><div className="record-pagination"><button disabled={recordFields.findIndex(item=>item.key===recordField)===0} onClick={()=>setRecordField(recordFields[recordFields.findIndex(item=>item.key===recordField)-1].key)}>← Previous field</button><span>{recordFields.findIndex(item=>item.key===recordField)+1} of {recordFields.length}</span><button disabled={recordFields.findIndex(item=>item.key===recordField)===recordFields.length-1} onClick={()=>setRecordField(recordFields[recordFields.findIndex(item=>item.key===recordField)+1].key)}>Next field →</button></div></div>)}</div></div>
      <div className="governance-console">
        <div className="console-head"><div><p className="overline">Governed persistence · browser demonstration</p><h3>Control the record around the record.</h3></div><label>Preview a role<select value={activeRole} onChange={event=>setActiveRole(event.target.value as Role)}><option>Steward</option><option>Authority reviewer</option><option>Technical contributor</option><option>Observer</option></select></label></div>
        <div className="security-boundary"><b>This is durable only in this browser—not secure organizational storage.</b><span>The draft now survives refresh on this device so the workflow can be tested. Roles are a preview, not identity verification. Do not enter protected information. A production release requires Purple Maiʻa-approved authentication, encrypted storage, server-enforced permissions, retention rules, backups, and an incident plan.</span></div>
        <div className="control-grid">
          <section><p className="label">Custody &amp; review</p><label>Record steward<input disabled={!canEdit} value={recordOwner} onChange={event=>setRecordOwner(event.target.value)} placeholder="Role or body; avoid personal data" /></label><label>Next mandatory review<input disabled={!canEdit} type="date" value={reviewDate} onChange={event=>setReviewDate(event.target.value)} /></label><button disabled={!canEdit} onClick={()=>{addLog("Review", `Review scheduled for ${reviewDate || "an unresolved date"}.`);}}>Record review schedule</button></section>
          <section><p className="label">Authority decision</p><label>Status<select disabled={!canDecide} value={decisionStatus} onChange={event=>setDecisionStatus(event.target.value)}><option>Draft — no authority decision</option><option>Returned for revision</option><option>Approved with conditions</option><option>Declined</option><option>Withdrawn</option><option>Expired</option></select></label><label>Rationale / conditions<textarea disabled={!canDecide} rows={3} value={decisionNote} onChange={event=>setDecisionNote(event.target.value)} placeholder={canDecide?"Record a non-sensitive rationale and conditions.":"Switch to Authority reviewer to demonstrate this control."}/></label><button disabled={!canDecide || !decisionNote.trim()} onClick={recordDecision}>Record illustrative decision</button><small>A production signature would bind a verified identity, authority scope, timestamp, record hash, expiry, and dissent—not merely a typed name.</small></section>
          <section><p className="label">Version history</p><button disabled={!canEdit} onClick={saveSnapshot}>Preserve current version</button>{snapshots.length===0?<p>No preserved versions yet.</p>:snapshots.slice(0,3).map(snapshot=><div className="mini-record" key={snapshot.id}><b>{snapshot.label}</b><span>{new Date(snapshot.at).toLocaleString()} · {Object.values(snapshot.fields).filter(Boolean).length}/{recordFields.length} drafted</span><button disabled={!canEdit} onClick={()=>setRecordValues(snapshot.fields)}>Restore as working draft</button></div>)}</section>
          <section><p className="label">Change / incident log</p><label>Non-sensitive log entry<textarea disabled={!canEdit} rows={3} value={logDraft} onChange={event=>setLogDraft(event.target.value)} placeholder="What changed, happened, or requires attention?" /></label><div className="log-buttons"><button disabled={!canEdit} onClick={()=>{addLog("Change",logDraft);setLogDraft("")}}>Add change</button><button disabled={!canEdit} onClick={()=>{addLog("Incident",logDraft);setLogDraft("")}}>Add incident</button></div>{logEntries.slice(0,4).map(entry=><div className="mini-record" key={entry.id}><b>{entry.kind} · {entry.actor}</b><span>{entry.summary}</span><small>{new Date(entry.at).toLocaleString()}</small></div>)}</section>
        </div>
      </div>
      <div className="record-actions"><button className="primary" onClick={exportSystemRecord}>Download authority record <span>↓</span></button><button onClick={()=>window.print()}>Print / save current view</button><button disabled={!canEdit} onClick={()=>{setRecordValues(initialSystemRecord);setRecordField("purpose")}}>Clear Authority Record fields</button><button onClick={eraseAllDrafts}>Erase all browser drafts</button></div>
      <div className="record-note"><b>Hard boundary:</b> completeness never requires protected content. A field may say “restricted,” “not recorded,” “authority not established,” or “decision deferred.” Those are legitimate governance states—not missing data to be filled by an outsider.</div>
    </section>}

    {view === "pilot" && <section id="pilot-content" className="content pilot" tabIndex={-1}>
      <EngagementProposal />
      <div className="proposal-actions"><button className="primary" onClick={() => selectView("review")}>Review the immediate request <span>→</span></button><button onClick={() => selectView("session")}>Inspect the 90-minute session</button><button onClick={() => selectView("charter")}>Inspect the pilot charter</button></div>
    </section>}

    {view === "definitions" && <section id="definitions-content" className="content definitions-view" tabIndex={-1}>
      <Definitions />
      <div className="proposal-actions"><button className="primary" onClick={() => selectView("proposal")}>Return to system design <span>→</span></button><button onClick={() => selectView("evidence")}>Inspect evidence statuses</button></div>
    </section>}

    {view === "learning" && <section id="learning-content" className="content learning" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">After validation—not before</p><h2>Translate approved practice into learning.</h2><p>The educational and public layer should emerge from something Purple Maiʻa has tested and chosen to share. It should teach judgment and power—not merely vocabulary—and never expose what the governance layer exists to protect.</p></div>
      <div className="learning-grid">
        <article><span>Workshop simulation</span><h3>Who gets to decide?</h3><p>Participants identify missing authority, competing interests, hidden burdens, and whether to proceed, redesign, defer, or refuse.</p><b>Possible audience · youth, educators, community teams</b></article>
        <article><span>Technical lab</span><h3>Where does the data go?</h3><p>Trace one task through local and commercial routes. Compare custody, retention, latency, energy, dependency, control, and exit.</p><b>Possible audience · builders, students, funders</b></article>
        <article><span>Facilitation canvas</span><h3>Should we build this?</h3><p>A reusable, non-digital-first version of the gate that preserves uncertainty and discussion rather than turning deliberation into compliance theater.</p><b>Possible audience · project teams, partners</b></article>
        <article><span>Public field guide</span><h3>What did this practice teach?</h3><p>A Purple Maiʻa-controlled account of an approved process, its tradeoffs, limits, failures, and learning—without presenting one implementation as universally transferable.</p><b>Possible audience · policymakers, peer organizations</b></article>
      </div>
      <div className="sequence"><p className="overline">The sequence matters</p>{["Listen","Govern","Pilot","Validate","Choose what to teach"].map((x,i)=><div key={x}><span>{i+1}</span><b>{x}</b></div>)}</div>
      <div className="sources"><p className="label">Public context informing this proposal</p><a href="https://luma.com/88dnl4w1" target="_blank" rel="noopener noreferrer">ʻĀina Foundry · The Sovereign Stack ↗</a><a href="https://www.purplemaia.org/ainafoundry" target="_blank" rel="noopener noreferrer">Purple Maiʻa · ʻĀina Foundry ↗</a><a href="https://blog.labs.purplemaia.org/" target="_blank" rel="noopener noreferrer">ʻĀina Foundry · Prototype log ↗</a><a href="https://www.purplemaia.org/purple-blog/eahou-fest-2026-update-on-ai" target="_blank" rel="noopener noreferrer">Purple Maiʻa · 2026 update on AI ↗</a><a href="https://www.purplemaia.org/purple-blog/data-guided-by-k%C4%81n%C4%81wai" target="_blank" rel="noopener noreferrer">Purple Maiʻa · Data Guided by Kānāwai ↗</a><a href="https://www.civilbeat.org/2026/05/ai-data-centers-are-the-new-plantations-unless-we-build-them-differently/" target="_blank" rel="noopener noreferrer">Civil Beat · Community governance of AI infrastructure ↗</a><a href="https://www.purplemaia.org/kula" target="_blank" rel="noopener noreferrer">Purple Maiʻa · Kula ↗</a><a href="https://www.gida-global.org/careprinciples" target="_blank" rel="noopener noreferrer">Global Indigenous Data Alliance · CARE Principles ↗</a><a href="https://localcontexts.org/labels/traditional-knowledge-labels/" target="_blank" rel="noopener noreferrer">Local Contexts · TK Labels ↗</a></div>
    </section>}

    {view === "readiness" && <section id="readiness-content" className="content readiness" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Production path · decisions before infrastructure</p><h2>Secure the authority model before securing the software.</h2><p>The working prototype demonstrates the proposed workflow. A production system should begin only after Purple Maiʻa determines who governs it, what may enter it, where it may operate, and how power can be challenged or withdrawn.</p></div>
      <div className="readiness-state"><div><span>Current state</span><strong>Non-production workflow demonstration</strong><p>Useful for discussion with hypothetical or non-sensitive material. Not an authoritative record system.</p></div><i>→</i><div><span>Decision gate</span><strong>Authority-approved production governance specification</strong><p>Identity, authority, knowledge classes, hosting, retention, incident response, and ownership resolved.</p></div><i>→</i><div><span>Future state</span><strong>Protected operating workspace</strong><p>Server-enforced access, durable records, verified decisions, and separately approved public excerpts.</p></div></div>
      <div className="architecture-map"><article><span>Public surface</span><h3>Proposal + approved excerpts</h3><p>No internal record is made public by changing a dropdown. Publication creates a separately reviewed, redacted, and approved artifact.</p></article><article><span>Protected workspace</span><h3>Invitation + least privilege</h3><p>Identity establishes who signed in. A Purple Maiʻa-governed membership registry establishes what that person may see or do.</p></article><article><span>Authoritative record</span><h3>Versions + append-only events</h3><p>Every material change preserves who acted, under which role and authority, against which version, and with what review or expiry requirement.</p></article><article><span>Exit and repair</span><h3>Withdrawal + migration + retirement</h3><p>The system is incomplete unless authority can pause use, narrow permissions, export records, verify deletion, migrate dependencies, and end the system.</p></article></div>
      <div className="production-contract"><div><p className="overline">Six governance decisions to resolve before production</p><h3>The platform cannot answer these on their behalf.</h3><p>Each unresolved item blocks storage of protected or authoritative records. Discovery should produce decisions, named owners, evidence, dissent, and review dates—not simply vendor selections.</p></div><ol>{productionDecisions.map(([decision,question])=><li key={decision}><span>Unresolved</span><div><b>{decision}</b><p>{question}</p></div></li>)}</ol></div>
      <div className="activation-workspace">
        <div className="activation-head"><div><p className="overline">Discovery &amp; activation workspace · browser demonstration</p><h3>Turn unresolved choices into governed decisions.</h3><p>Use hypothetical or non-sensitive notes only. A status describes discovery progress; it does not prove authority or authorize infrastructure.</p></div><div className="readiness-score"><strong>{productionRecords.filter(record=>record.status==="Approved for prototype").length}/{productionDecisions.length}</strong><span>approved for prototype</span><small>{productionRecords.some(record=>record.status==="Blocked")?"A recorded block is active":"Backend remains off until all six qualify"}</small></div></div>
        <div className="activation-body"><aside aria-label="Production decisions">{productionDecisions.map(([decision],index)=><button key={decision} className={productionDecision===index?"active":""} aria-current={productionDecision===index?"step":undefined} onClick={()=>setProductionDecision(index)}><span>{productionRecords[index].status==="Approved for prototype"?"✓":productionRecords[index].status==="Blocked"?"!":"○"}</span><div><b>{decision}</b><small>{productionRecords[index].status}</small></div></button>)}</aside><div className="activation-editor"><p className="overline">Decision {productionDecision+1} of {productionDecisions.length}</p><h3>{productionDecisions[productionDecision][0]}</h3><p>{productionDecisions[productionDecision][1]}</p><div className="activation-fields"><label>Status<select value={productionRecords[productionDecision].status} onChange={event=>updateProductionRecord({status:event.target.value as ProductionStatus})}><option>Not examined</option><option>Discovery underway</option><option>Draft decision</option><option>Approved for prototype</option><option>Blocked</option></select></label><label>Accountable owner or authority body<input value={productionRecords[productionDecision].owner} onChange={event=>updateProductionRecord({owner:event.target.value})} placeholder="Role or body; avoid personal information" /></label><label>Evidence required to resolve this decision<textarea rows={4} value={productionRecords[productionDecision].evidence} onChange={event=>updateProductionRecord({evidence:event.target.value})} placeholder="What must be reviewed, tested, documented, or decided—and by whom?" /></label><label>Conditions, dissent, or remaining questions<textarea rows={4} value={productionRecords[productionDecision].conditions} onChange={event=>updateProductionRecord({conditions:event.target.value})} placeholder="Preserve disagreement and unknowns; do not enter protected content." /></label></div><div className="activation-guidance"><b>“Approved for prototype” is deliberately narrow.</b><span>It means the decision has enough legitimate direction to design or test the corresponding control. It does not authorize protected data, production launch, publication, or use by another project or community.</span></div><div className="record-pagination"><button disabled={productionDecision===0} onClick={()=>setProductionDecision(productionDecision-1)}>← Previous decision</button><span>{productionDecision+1} of {productionDecisions.length}</span><button disabled={productionDecision===productionDecisions.length-1} onClick={()=>setProductionDecision(productionDecision+1)}>Next decision →</button></div></div></div>
      </div>
      <div className="control-matrix"><p className="overline">Minimum production controls</p><div><article><b>Every request</b><span>Authenticate identity</span><span>Verify membership</span><span>Enforce role + record scope</span><span>Apply classification rule</span></article><article><b>Every decision</b><span>Bind exact record version</span><span>Capture authority scope</span><span>Preserve conditions + dissent</span><span>Set expiry or review trigger</span></article><article><b>Every disclosure</b><span>Create separate excerpt</span><span>Redact by default</span><span>Require publication approval</span><span>Log export without content</span></article><article><b>Every lifecycle</b><span>Schedule review</span><span>Enable challenge + pause</span><span>Test recovery + migration</span><span>Verify retirement obligations</span></article></div></div>
      <div className="security-boundary production-warning"><b>Hard stop before backend activation</b><span>{productionRecords.every(record=>record.status==="Approved for prototype") ? "All six areas are marked ready for a technical prototype in this browser demonstration. That still requires verified authority, documented approval, and a separate activation decision before any real backend or protected information is introduced." : "No real protected knowledge, community records, or authority decisions should enter a hosted database until all six production decisions are legitimately resolved. Encryption and login screens cannot cure an unresolved authority or knowledge-boundary question."}</span></div>
      <div className="readiness-actions"><button className="primary" onClick={exportProductionBrief}>Download production decision brief <span>↓</span></button><button onClick={()=>selectView("pilot")}>Return to pilot path</button></div>
    </section>}

    {view === "session" && <section id="session-content" className="content session" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Co-design session · executable discovery</p><h2>Make the next conversation capable of producing a real decision.</h2><p>This is a facilitation architecture—not a prewritten answer. Purple Maiʻa chooses whether to convene, who has standing, what may be discussed or recorded, and whether the work stops, continues, changes shape, or becomes a bounded prototype.</p></div>
      <div className="session-guardrails"><article><span>Before invitation</span><h3>Confirm purpose and sponsor.</h3><p>A sponsor’s interest could open discovery; it would not identify every relevant authority. Any real session would first confirm the actual organizational question, who should convene, and whether compensation or confidentiality must precede participation.</p></article><article><span>Before recording</span><h3>Set the knowledge boundary.</h3><p>Decide what may be written, attributed, photographed, exported, or retained. The safest valid outcome may be an oral process with only non-sensitive decisions recorded.</p></article><article><span>Before closing</span><h3>Name who can decide.</h3><p>Distinguish contributors, affected people, technical operators, advisors, sponsors, and authorities. Attendance, expertise, employment, or account access alone does not create standing.</p></article></div>
      <div className="session-agenda"><div className="session-agenda-head"><p className="overline">A 90-minute first working session</p><h3>Each segment ends with a decision to continue, revise, pause, or stop.</h3><p>The facilitator may pause or end the process at any point. Timeboxes protect attention; they do not override deliberation or require consensus.</p></div>{sessionAgenda.map(([time,stage,purpose],index)=><article key={stage}><b>{time}</b><span>{String(index+1).padStart(2,"0")}</span><div><h3>{stage}</h3><p>{purpose}</p></div></article>)}</div>
      <div className="session-workspace">
        <div className="session-workspace-head"><div><p className="overline">Facilitation brief · browser demonstration</p><h3>Prepare the conditions, not the conclusion.</h3></div><p>Use roles or bodies rather than personal or protected information. These notes stay in this browser and are not a secure organizational record.</p></div>
        <div className="session-fields">
          <label>Provisional sponsor or convener<textarea rows={3} value={sessionRecord.sponsor} onChange={event=>updateSessionRecord("sponsor",event.target.value)} placeholder="Who is asking for this session, and what authority do they have to convene it?" /></label>
          <label>Participation and standing map<textarea rows={3} value={sessionRecord.participants} onChange={event=>updateSessionRecord("participants",event.target.value)} placeholder="Which roles or bodies must define, advise, operate, experience, challenge, or decide? Who is still missing?" /></label>
          <label>Pre-work and evidence<textarea rows={3} value={sessionRecord.prework} onChange={event=>updateSessionRecord("prework",event.target.value)} placeholder="What existing policy, architecture, practice, failure, agreement, or non-sensitive scenario should participants review?" /></label>
          <label>Recording and knowledge boundaries<textarea rows={3} value={sessionRecord.boundaries} onChange={event=>updateSessionRecord("boundaries",event.target.value)} placeholder="What may be discussed, recorded, attributed, retained, exported, or never documented?" /></label>
          <label>Decisions this session may make<textarea rows={3} value={sessionRecord.decisions} onChange={event=>updateSessionRecord("decisions",event.target.value)} placeholder="Name the narrow decisions within scope—and who may make each one." /></label>
          <label>Dissent, conflicts, and missing voices<textarea rows={3} value={sessionRecord.dissent} onChange={event=>updateSessionRecord("dissent",event.target.value)} placeholder="How will disagreement remain visible? What conflict or absence prevents a valid decision?" /></label>
          <label className="wide">Authorized close and next step<textarea rows={3} value={sessionRecord.nextStep} onChange={event=>updateSessionRecord("nextStep",event.target.value)} placeholder="Stop, continue discovery, revise, or invite a bounded prototype. Name owner, limit, evidence, review date, and what is expressly not authorized." /></label>
        </div>
        <div className="session-output"><div><b>{Object.values(sessionRecord).filter(value=>value.trim()).length}/7</b><span>preparation fields drafted</span></div><p><strong>A complete form is not a valid session.</strong> Validity depends on legitimate participation, boundaries, preserved dissent, and an authorized close—not on filling every box.</p><button className="primary" onClick={exportSessionBrief}>Download facilitation brief <span>↓</span></button></div>
      </div>
      <div className="decision-box"><div><p className="overline">The first discovery question</p><h3>Is there a real operational constraint worth exploring—and who should be in the room to define it?</h3></div><p>Not whether to approve this framework. Not whether KILO becomes the pilot. Not whether a backend should be activated. The first question is whether a properly scoped, appropriately governed discovery process would be useful at all.</p></div>
    </section>}

    {view === "charter" && <section id="charter-content" className="content charter" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Bounded pilot charter · invitation before implementation</p><h2>Turn a useful discovery into a precise, governable engagement.</h2><p>This charter exists for the moment after discovery identifies a real need. It prevents enthusiasm from silently expanding into authority, access, production, publication, or an indefinite consulting relationship.</p></div>
      <div className="charter-gates"><article><span>Gate 01</span><h3>Need confirmed</h3><p>Purple Maiʻa names the actual constraint and determines that a pilot—not another intervention or stopping—is worth considering.</p></article><article><span>Gate 02</span><h3>Standing confirmed</h3><p>The relevant roles or bodies define what may be examined, recorded, decided, challenged, and refused.</p></article><article><span>Gate 03</span><h3>Invitation bounded</h3><p>Scope, resources, compensation, confidentiality, ownership, outputs, tests, stop conditions, and transfer are explicit.</p></article></div>
      <div className="charter-workspace">
        <div className="charter-head"><div><p className="overline">Pilot charter builder · browser demonstration</p><h3>Define the container before doing the work.</h3></div><div className="charter-score"><strong>{Object.values(charterRecord).filter(value=>value.trim()).length}/{charterFields.length}</strong><span>fields drafted</span><small>Completion permits review, never approval</small></div></div>
        <div className="charter-fields">{charterFields.map(field=><label key={field.key} className={field.wide?"wide":""}><span>{field.label}</span><small>{field.prompt}</small><textarea rows={4} value={charterRecord[field.key]} onChange={event=>updateCharterRecord(field.key,event.target.value)} placeholder="Use provisional roles and non-sensitive information. Preserve unresolved questions rather than guessing." /></label>)}</div>
        <div className="charter-output"><div><b>Review before invitation</b><span>A complete charter is still a draft.</span></div><p>The pilot begins only when the appropriate authorities and organizational sponsor accept the exact scope and conditions through a separately valid process. No checkbox or download on this site can do that.</p><button className="primary" onClick={exportPilotCharter}>Download pilot charter <span>↓</span></button></div>
      </div>
      <div className="decision-box"><div><p className="overline">The engagement boundary</p><h3>Discovery may invite a pilot. A pilot may produce evidence. Neither authorizes production.</h3></div><p>Production, protected-data storage, public learning materials, reuse, or expansion each return to their own authority and decision gates. The engagement remains valid even if the final recommendation is to stop or use a non-AI path.</p></div>
    </section>}

    {view === "review" && <section id="review-content" className="content executive-review" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">60–90 second executive read</p><h2>Authority Layer keeps a use inside the decision that authorized it—even as the technical system changes.</h2><p>Purple Maiʻa has publicly described the technical Sovereign Stack. RN independently built this high-fidelity interaction simulation and product requirements model to test whether purpose, standing, knowledge boundaries, conditions, dissent, review, withdrawal, and exit need a durable operational layer across that stack.</p></div>
      <div className="executive-grid">
        <article><span>Why now</span><h3>The technical work makes the lifecycle question concrete.</h3><p>Local models, infrastructure, agents, data flows, dependencies, people, and purposes can change after an initial decision.</p></article>
        <article><span>What this does</span><h3>It binds one authorized use to its governing record.</h3><p>The demonstration connects pre-build review, scoped permission, material-change triggers, challenge, repair, migration, and retirement.</p></article>
        <article><span>The decision requested</span><h3>Relevant, redundant, misframed, or not useful now?</h3><p>A short pressure test can correct the premise, identify existing work, refer the question, or determine that it should stop.</p></article>
        <article><span>Fastest review path</span><h3>See the claim, then test one change event.</h3><p>Open the guided demonstration, inspect the evidence if needed, and reply in the existing email thread with one direction.</p></article>
      </div>
      <div className="meeting-links"><button className="primary" onClick={()=>selectView("simulation")}>Walk the fictional use →</button><button onClick={()=>selectView("meeting")}>Open the seven-minute briefing</button><button onClick={()=>selectView("evidence")}>Inspect the Assumption Ledger</button></div>
      <div className="decision-box"><div><p className="overline">Direct response</p><h3>Reply in the existing email thread with one direction and, if appropriate, the role best placed to assess it.</h3></div><div><p>Relevant constraint · Already addressed · Revise · Not useful now · Refer</p><button className="primary" onClick={copyResponsePrompt}>{responseCopied ? "Response prompt copied" : "Copy a concise response prompt"}</button><span role="status" className="sr-only">{responseCopied ? "Response prompt copied to clipboard." : ""}</span></div></div>
      <div className="section-intro compact"><p className="overline">Full decision context</p><h2>Is Authority Layer addressing a real operational constraint, duplicating work Purple Maiʻa already has, or aimed at the wrong layer?</h2><p>The immediate request is a 20–25-minute pressure test. Donavan can correct the premise, identify existing work, refer the question to someone closer to it, or say it is not useful. None of those responses approves the framework, authorizes a build, selects a pilot, or invites access to protected information.</p></div>
      <div className="executive-grid">
        <article><span>Public record</span><h3>Purple Maiʻa has publicly described a technical Sovereign Stack.</h3><p>Its public materials describe local infrastructure, open models, coding agents, edge systems, education, place-based practice, and sovereignty-first technology development.</p></article>
        <article><span>RN hypothesis</span><h3>The seam may be durable authority—not another sovereignty principle.</h3><p>Purpose, standing, knowledge boundaries, permissions, dissent, review, withdrawal, repair, migration, and retirement may need to remain operational as systems change.</p></article>
        <article><span>Current state</span><h3>Inspectable product requirements plus a high-fidelity interaction simulation.</h3><p>The site makes the intended workflow tangible: Decision Gate, Authority Record, implementation questions, co-design agenda, and pilot charter. These tools illustrate a connected authority system; they do not yet implement one.</p></article>
        <article><span>What remains unanswered</span><h3>Useful, redundant, or aimed at the wrong layer?</h3><p>Public material cannot settle that. A short pressure-test conversation could determine whether the premise is relevant, redundant, or misframed. Only if a real constraint is identified would RN propose a separately scoped, compensated discovery engagement.</p></article>
      </div>
      <div className="executive-boundaries"><p className="overline">Current scope</p><div><span>Public, fictional product simulation</span><span>Relevant authorities define any real use</span><span>Correction, referral, discovery, or stop are valid outcomes</span></div></div>
      <div className="review-room">
        <div className="review-room-head"><div><p className="overline">Reviewer response path · illustrative browser demonstration</p><h3>Record direction without accidentally granting permission.</h3></div><p>This form contains no prefilled response. Use only non-sensitive notes. Download creates a discussion brief, not an authorization record.</p></div>
        <fieldset className="response-options"><legend className="sr-only">Executive response</legend>{(["I see a relevant constraint", "Continue discovery", "Revise the concept", "Not useful now", "Not mine to decide"] as ReviewResponse[]).map(response=><label key={response} className={reviewResponse===response?"selected":""}><input type="radio" name="executive-response" checked={reviewResponse===response} onChange={()=>setReviewResponse(response)} /><span aria-hidden="true">{reviewResponse===response?"●":"○"}</span>{response}</label>)}</fieldset>
        <div className="review-fields">
          <label>What constraint, if any, is worth defining?<textarea rows={3} value={reviewConstraint} onChange={event=>setReviewConstraint(event.target.value)} placeholder="A non-sensitive description in Purple Maiʻa’s own terms." /></label>
          <label>Who should shape or decide the question?<textarea rows={3} value={reviewPeople} onChange={event=>setReviewPeople(event.target.value)} placeholder="Roles or bodies—not private personal information." /></label>
          <label>What existing work should not be duplicated, and what boundaries should govern any follow-up?<textarea rows={3} value={reviewBoundary} onChange={event=>setReviewBoundary(event.target.value)} placeholder="Work not to duplicate; topics not to document; assumptions to remove." /></label>
        </div>
        <div className="review-close"><div><b>{reviewResponse || "No direction selected"}</b><span>{reviewResponse === "Continue discovery" || reviewResponse === "I see a relevant constraint" ? "Possible next step: define a bounded discovery invitation." : reviewResponse === "Revise the concept" ? "Possible next step: revise only against the direction provided." : reviewResponse === "Not mine to decide" ? "Possible next step: referral to the appropriate role or body, if the reviewer chooses." : reviewResponse ? "No work proceeds from this response." : "Reviewing the proposal does not imply interest or consent."}</span></div><button className="primary" disabled={!reviewResponse} onClick={exportExecutiveBrief}>Download executive review <span>↓</span></button></div>
      </div>
      <div className="decision-box"><div><p className="overline">The one-sentence proposition</p><h3>Purple Maiʻa has publicly described the technical Sovereign Stack. I independently built a prototype for carrying authority decisions through a use’s lifecycle. Is there anything useful at that seam?</h3></div><p>The prototype demonstrates RN&apos;s legal-technical implementation thinking. Purple Maiʻa determines whether the seam is real, already addressed, or irrelevant.</p></div>
    </section>}

    {view === "evidence" && <section id="evidence-content" className="content evidence-room" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Assumption Ledger · provenance before persuasion</p><h2>Let every claim carry its own status and boundary.</h2><p>The ledger separates public record, RN synthesis, hypotheses, proposed designs, and unresolved questions. It makes the argument auditable without converting public evidence into permission or organizational fact.</p></div>
      <div className="evidence-rule"><div><span>01</span><b>A public record is not permission.</b><p>A published description can ground context. It cannot authorize access, reuse, representation, or a pilot.</p></div><div><span>02</span><b>A proposal is not a finding.</b><p>RN&apos;s system designs are offered for correction and testing; their completeness does not prove organizational need.</p></div><div><span>03</span><b>Unresolved is a valid state.</b><p>The ledger keeps unresolved questions visible until the right people answer—or decide the question should not be recorded.</p></div></div>
      <div className="evidence-toolbar"><div role="group" aria-label="Filter assumption ledger">{(["All", "Public record", "RN synthesis", "Hypothesis", "Proposed design", "Unresolved"] as EvidenceType[]).map(type=><button key={type} className={evidenceFilter===type?"active":""} aria-pressed={evidenceFilter===type} onClick={()=>setEvidenceFilter(type)}>{type}<span>{type==="All"?evidenceItems.length:evidenceItems.filter(item=>item.type===type).length}</span></button>)}</div><button onClick={exportEvidenceRegister}>Download ledger ↓</button></div>
      <div className="evidence-register">{evidenceItems.filter(item=>evidenceFilter==="All"||item.type===evidenceFilter).map((item,index)=><article key={`${item.type}-${item.claim}`}><div className="evidence-kind"><span>{String(index+1).padStart(2,"0")}</span><b>{item.type}</b></div><div className="evidence-claim"><h3>{item.claim}</h3><p><b>Basis</b>{item.basis}</p></div><div className="evidence-boundary"><p><b>Evidence boundary</b>{item.boundary}</p>{item.source&&<><a href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.label} ↗</a><small>{item.source.accessed}</small></>}</div></article>)}</div>
      <div className="evidence-close"><div><p className="overline">Discovery correction protocol</p><h3>Correct the record before expanding the work.</h3></div><ol><li>Identify the statement, missing context, or category error.</li><li>Mark whether it should be corrected, restricted, removed, or left unresolved.</li><li>Name who may validate the replacement and what evidence may be retained.</li><li>Propagate the correction through the proposal, prototype, charter, and any approved public excerpt.</li></ol></div>
      <div className="decision-box"><div><p className="overline">What this room asks</p><h3>Not “Did RN research enough?” but “Is the proposition accurately bounded enough to begin listening?”</h3></div><p>A successful review may produce a correction, a referral to someone with standing, a narrower question, a discovery invitation, or a decision to stop. Each is a useful result.</p></div>
    </section>}

    <footer><div><span className="knot">◈</span><b>Authority Layer</b><small>Version 1.2.1 · 13 September 2026 · executive routing, response path, copy precision, evidence dating, security, and automated release checks</small></div><p>Independent prototype by Rayven-Nikkita (RN) Collins, developed from the publicly available sources listed in the Assumption Ledger. RN previously corresponded with Purple Maiʻa about the earlier proposal. Purple Maiʻa has not commissioned, adopted, endorsed, or validated this prototype. Not a Purple Maiʻa product, policy, approved protocol, or community-authorized framework. <button onClick={openPrivacy}>Status, privacy &amp; erase drafts</button></p></footer>
  </main>;
}

export default function Home() {
  return <AuthorityLayerApp />;
}
