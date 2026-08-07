"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type View = "meeting" | "overview" | "proposal" | "gate" | "record" | "pilot" | "learning" | "readiness" | "session" | "charter" | "review" | "evidence";
type EvidenceType = "All" | "Verified public context" | "RN interpretation" | "Proposed design" | "Unresolved";
type RecordKey = "purpose" | "authority" | "knowledge" | "dataFlow" | "dependencies" | "allowed" | "prohibited" | "conditions" | "review" | "challenge" | "incident" | "withdrawal" | "migration" | "retirement";
type Role = "Steward" | "Authority reviewer" | "Technical contributor" | "Observer";
type LogEntry = { id: string; kind: "Change" | "Decision" | "Review" | "Incident"; summary: string; actor: string; at: string };
type Snapshot = { id: string; label: string; at: string; fields: Record<RecordKey, string> };
type ProductionStatus = "Not examined" | "Discovery underway" | "Draft decision" | "Approved for prototype" | "Blocked";
type ProductionDecisionRecord = { status: ProductionStatus; owner: string; evidence: string; conditions: string };
type SessionRecord = { sponsor: string; participants: string; prework: string; boundaries: string; decisions: string; dissent: string; nextStep: string };
type CharterRecord = { useCase: string; sponsor: string; authority: string; scope: string; exclusions: string; participants: string; outputs: string; acceptance: string; ownership: string; risks: string; stopConditions: string; timeline: string; handoff: string };
type ReviewResponse = "I see a relevant constraint" | "Continue discovery" | "Revise the concept" | "Not useful now" | "Not mine to decide";

const nav: { id: View; label: string; eyebrow: string }[] = [
  { id: "meeting", label: "Meeting mode", eyebrow: "00" },
  { id: "overview", label: "Why this layer", eyebrow: "01" },
  { id: "proposal", label: "The proposal", eyebrow: "02" },
  { id: "gate", label: "Decision gate", eyebrow: "03" },
  { id: "record", label: "System record", eyebrow: "04" },
  { id: "pilot", label: "Pilot path", eyebrow: "05" },
  { id: "learning", label: "Learning layer", eyebrow: "06" },
  { id: "readiness", label: "Production path", eyebrow: "07" },
  { id: "session", label: "Co-design session", eyebrow: "08" },
  { id: "charter", label: "Pilot charter", eyebrow: "09" },
  { id: "review", label: "Executive review", eyebrow: "10" },
  { id: "evidence", label: "Evidence room", eyebrow: "11" },
];

const meetingSlides = [
  { label: "Observed context", title: "Purple Maiʻa has already built the technical embodiment.", body: "Its public work joins local compute, open models, edge hardware, place-based observation, and Indigenous approaches to technology. RN is not proposing to explain sovereignty back to Purple Maiʻa.", proof: "Public context only—not permission, internal knowledge, or a finding about current operations." },
  { label: "Possible constraint", title: "The open question is whether authority remains operational as systems change.", body: "A technical stack can be locally controlled while decisions about purpose, knowledge, custody, use, dissent, repair, and exit remain difficult to carry through the full lifecycle.", proof: "This is RN’s discovery hypothesis. Purple Maiʻa may correct it, narrow it, identify existing work, or reject it." },
  { label: "Working mechanism", title: "The prototype makes that hypothesis testable.", body: "A sovereign-use gate connects to a living system record, review history, production decisions, co-design process, and bounded pilot charter. Pause, refusal, withdrawal, and non-digitization are designed as valid outcomes.", proof: "The mechanism is built; its substance, language, standing, and rules are not adopted or community-authorized." },
  { label: "Why RN", title: "RN can translate governance into working legal-technical infrastructure.", body: "RN combines AI product building, evidence architecture, governance and legal research, learning design, neuroscience, and human-systems analysis—and can transfer editable tools instead of leaving Purple Maiʻa with a static report.", proof: "Role boundary: implementation architect working under designated authority—not Indigenous authority or the source of Hawaiian values." },
  { label: "Bounded engagement", title: "Begin with paid discovery, not a presumed pilot.", body: "A short engagement would confirm the real constraint, map standing and documentation boundaries, trace one non-sensitive scenario, and determine whether to stop, revise, continue discovery, or invite a separately chartered pilot.", proof: "Proposed container: sponsor interview, preparation, one 90-minute co-design session, synthesis, and editable decision brief. Timing, participants, confidentiality, and fee are agreed only after fit." },
  { label: "Decision", title: "Is this a useful problem to define with the right people?", body: "Donavan is not being asked to approve a framework, choose KILO, disclose protected knowledge, or authorize production. The immediate question is whether governed discovery would create enough value to justify scoping it.", proof: "A valid answer may be yes, revise, refer, not now, or stop." },
] as const;

const evidenceItems: { type: Exclude<EvidenceType, "All">; claim: string; basis: string; boundary: string; source?: { label: string; url: string } }[] = [
  { type: "Verified public context", claim: "Purple Maiʻa publicly describes a locally controlled AI stack using open models, local compute, coding agents, and edge hardware.", basis: "Purple Maiʻa's published 2026 AI update.", boundary: "The public description does not establish every present component, operating rule, or technical dependency.", source: { label: "Purple Maiʻa · 2026 update on AI", url: "https://www.purplemaia.org/purple-blog/eahou-fest-2026-update-on-ai" } },
  { type: "Verified public context", claim: "KILO connects environmental observation with kānāwai-guided interpretation and stewardship.", basis: "Purple Maiʻa's public article on Data Guided by Kānāwai.", boundary: "This proposal does not claim access to KILO's internal governance, data, architecture, or participating communities' decisions.", source: { label: "Purple Maiʻa · Data Guided by Kānāwai", url: "https://www.purplemaia.org/purple-blog/data-guided-by-k%C4%81n%C4%81wai" } },
  { type: "Verified public context", claim: "Purple Maiʻa already operates place-based learning and Indigenous innovation programs.", basis: "Purple Maiʻa's public Kula program materials.", boundary: "A learning translation is relevant only if Purple Maiʻa validates the underlying practice and chooses to teach or publish it.", source: { label: "Purple Maiʻa · Kula", url: "https://www.purplemaia.org/kula" } },
  { type: "RN interpretation", claim: "The likely open layer is not a sovereignty explainer, but a way to carry authority through operational decisions over time.", basis: "RN's synthesis of Purple Maiʻa's public technical, environmental, and educational work.", boundary: "This is a hypothesis for discovery—not a finding about Purple Maiʻa's actual constraint." },
  { type: "RN interpretation", claim: "A bounded use such as KILO could make governance requirements concrete enough to test.", basis: "KILO publicly spans purpose, observation, infrastructure, interpretation, and stewardship decisions.", boundary: "KILO is an example candidate only. Purple Maiʻa may identify another use, existing solution, or no need for a pilot." },
  { type: "Proposed design", claim: "A pre-build gate should allow proceed, pause, redesign, defer, or refuse—and should preserve rationale, dissent, and unresolved conditions.", basis: "RN's governance and legal-technical design proposal.", boundary: "The options, language, standing, and valid decision process must be co-designed and approved before operational use." },
  { type: "Proposed design", claim: "A living system record could join authority, knowledge boundaries, custody, dependencies, use, review, challenge, repair, migration, and retirement.", basis: "The working prototype on this site.", boundary: "The prototype demonstrates a container. It is not an authoritative record, approved protocol, secure workspace, or Purple Maiʻa policy." },
  { type: "Proposed design", claim: "Purple Maiʻa should receive editable source and control whether the work remains internal, changes, is taught, is published, or is retired.", basis: "RN's proposed ownership and transfer posture.", boundary: "Actual ownership, confidentiality, licensing, retention, and attribution require an agreed charter or contract." },
  { type: "Unresolved", claim: "Whether Purple Maiʻa experiences a governance, documentation, learning, policy, or adoption constraint this product should address.", basis: "Not answerable from public materials.", boundary: "Ask Donavan and the people he identifies; do not infer urgency from the existence of the public work." },
  { type: "Unresolved", claim: "Who has standing to define rules, authorize a pilot, classify knowledge, approve records, contest decisions, or stop work.", basis: "Not established by this proposal.", boundary: "Purple Maiʻa and relevant community or cultural authorities determine standing. RN cannot nominate authority through interface design." },
  { type: "Unresolved", claim: "What may be discussed, recorded, stored, demonstrated, shared with RN, or made public.", basis: "Requires explicit scope-setting before discovery.", boundary: "Least documentation is the default; protected knowledge need not be exposed to prove governance rigor." },
  { type: "Unresolved", claim: "Whether a paid discovery phase, bounded pilot, or no further work is the appropriate next step.", basis: "This is the decision the executive review room is designed to support.", boundary: "Interest in a conversation is not approval, consent, a contract, data access, or permission to build." },
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
  ["Authority & membership", "Who may enter the workspace, who grants and revokes roles, and how authority is verified beyond ordinary account ownership."],
  ["Hosting & jurisdiction", "Where application, database, backups, logs, and subprocessors may operate—and which classes must remain locally controlled or offline."],
  ["Knowledge classes", "What may be public, internal, restricted, metadata-only, ephemeral, or never recorded in any digital system."],
  ["Retention & deletion", "How long each class survives, who can place a hold, what withdrawal can remove, and how deletion is verified across copies and backups."],
  ["Decision validity", "Which decisions require quorum, conditions, dissent, expiry, re-review, or more than one authority signature."],
  ["Incidents & repair", "Who is notified, who can contain or stop the system, how community direction governs remedy, and what remains in the audit record."],
] as const;

const initialProductionRecords: ProductionDecisionRecord[] = productionDecisions.map(() => ({ status: "Not examined", owner: "", evidence: "", conditions: "" }));

const questions = [
  { title: "Name the community purpose", prompt: "What collective need does this project serve—and who defined that need?", options: ["Purpose is community-defined", "Purpose needs confirmation", "Purpose is externally defined"] },
  { title: "Locate authority", prompt: "Who has standing to authorize collection, use, interpretation, and future reuse?", options: ["Authority is named and involved", "Authority is unclear", "No legitimate authority is involved"] },
  { title: "Test the intervention", prompt: "Is AI necessary, or would people, policy, education, or ordinary software work better?", options: ["AI adds necessary capability", "A non-AI path may be better", "The intervention is not justified"] },
  { title: "Set knowledge boundaries", prompt: "Has the team identified what may be public, restricted, local-only, ephemeral, seasonal, or never digitized?", options: ["Boundaries are defined", "Boundaries require deliberation", "The project would cross a boundary"] },
  { title: "Trace custody and dependencies", prompt: "Can the team account for where data travels, which vendors are involved, and what each dependency can retain or reuse?", options: ["Custody and dependencies are known", "The route is partly known", "The route creates unacceptable exposure"] },
  { title: "Prove durable control", prompt: "Can the community inspect, contest, change, migrate, pause, and shut down the system?", options: ["Control is operational", "Control is partial", "Control depends on an outside party"] },
  { title: "Define benefit and repair", prompt: "Are collective benefit, accountability, incident response, withdrawal, and repair defined before use?", options: ["Benefit and repair are defined", "Protections are incomplete", "Harms have no accountable owner"] },
];

const pilotPhases = [
  ["Listen", "Confirm whether a governance layer is useful, who has standing, what work already exists, and what must remain undocumented."],
  ["Map", "Document one bounded use case: purpose, authority, data path, dependencies, decisions, limits, review, and exit."],
  ["Co-design", "Adapt the gate and record in Purple Maiʻa’s language. Establish roles, access levels, challenge paths, and stopping rules."],
  ["Test", "Use real—not sensitive—scenarios. Test comprehension, burden, false confidence, exceptions, and refusal outcomes."],
  ["Validate", "Relevant authorities review every field. Contradictions and unresolved questions remain visible rather than being smoothed away."],
  ["Transfer", "Purple Maiʻa receives the editable system, documentation, governance record, and the choice to keep it internal, teach from it, publish it, or retire it."],
];

const recordFields: { key: RecordKey; group: string; label: string; prompt: string; placeholder: string }[] = [
  { key: "purpose", group: "Mandate", label: "Community purpose", prompt: "What collective need is this system permitted to serve?", placeholder: "Provisional purpose; identify who defined it and what still requires confirmation." },
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

function Mark({ children }: { children: React.ReactNode }) { return <span className="mark">{children}</span>; }

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [meetingStep, setMeetingStep] = useState(0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
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
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sovereign-stack-demo-record");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecordValues({ ...initialSystemRecord, ...parsed.recordValues });
        setProjectName(parsed.projectName || ""); setRecordVisibility(parsed.recordVisibility || "Internal");
        setRecordOwner(parsed.recordOwner || ""); setReviewDate(parsed.reviewDate || "");
        setDecisionStatus(parsed.decisionStatus || "Draft — no authority decision"); setDecisionNote(parsed.decisionNote || "");
        setSnapshots(parsed.snapshots || []); setLogEntries(parsed.logEntries || []);
        setProductionRecords(parsed.productionRecords?.length === productionDecisions.length ? parsed.productionRecords : initialProductionRecords);
        setSessionRecord({ ...initialSessionRecord, ...parsed.sessionRecord });
        setCharterRecord({ ...initialCharterRecord, ...parsed.charterRecord });
      }
    } catch { /* A corrupt browser draft is ignored. */ }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("sovereign-stack-demo-record", JSON.stringify({ recordValues, projectName, recordVisibility, recordOwner, reviewDate, decisionStatus, decisionNote, snapshots, logEntries, productionRecords, sessionRecord, charterRecord }));
  }, [storageReady, recordValues, projectName, recordVisibility, recordOwner, reviewDate, decisionStatus, decisionNote, snapshots, logEntries, productionRecords, sessionRecord, charterRecord]);

  const canEdit = activeRole === "Steward" || activeRole === "Technical contributor";
  const canDecide = activeRole === "Authority reviewer";
  function addLog(kind: LogEntry["kind"], summary: string) {
    if (!summary.trim()) return;
    setLogEntries(current => [{ id: crypto.randomUUID(), kind, summary: summary.trim(), actor: `${activeRole} (demonstration)`, at: new Date().toISOString() }, ...current]);
  }
  function saveSnapshot() {
    const next = { id: crypto.randomUUID(), label: `Version ${snapshots.length + 1}`, at: new Date().toISOString(), fields: { ...recordValues } };
    setSnapshots(current => [next, ...current]); addLog("Change", `${next.label} preserved as a read-only demonstration snapshot.`);
  }
  function recordDecision() {
    if (!canDecide || !decisionNote.trim()) return;
    addLog("Decision", `${decisionStatus}: ${decisionNote}`); setDecisionNote("");
  }

  const result = useMemo(() => {
    if (answers.length < questions.length) return null;
    const stop = answers.some((a) => /externally|No legitimate|not justified|cross a boundary|unacceptable exposure|no accountable owner/.test(a));
    const pause = answers.some((a) => /confirmation|unclear|may be better|deliberation|partly known|partial|outside|incomplete/.test(a));
    if (stop) return { label: "Do not proceed", note: "A foundational condition is absent or a prohibited exposure is present. Stop the proposed activity, preserve no new data, and return the question to the relevant authority." };
    if (pause) return { label: "Pause and redesign", note: "The proposal may have value, but it is not ready. Name an owner and resolution path for every open authority, boundary, custody, control, or repair question." };
    return { label: "Eligible for authority review", note: "The proposal may move to the designated authority for deliberation. Passing this gate is not consent, approval, or proof that the project should be built." };
  }, [answers]);

  const openConditions = useMemo(() => questions.flatMap((question, index) => {
    const answer = answers[index];
    if (!answer || /community-defined|named and involved|adds necessary|are defined|are known|is operational|are defined/.test(answer)) return [];
    return [{ area: question.title, answer, note: notes[index] || "No rationale recorded" }];
  }), [answers, notes]);

  function choose(answer: string) {
    const next = [...answers]; next[step] = answer; setAnswers(next.slice(0, step + 1));
    if (step < questions.length - 1) setStep(step + 1);
    else window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }
  function selectView(id: View) {
    setView(id);
    window.setTimeout(() => document.getElementById(`${id}-content`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function returnToBeginning() { setView("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function clearGate() { setAnswers([]); setNotes([]); setStep(0); setProjectName(""); setProjectPurpose(""); }
  function downloadText(filename: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
  }
  function exportMeetingBrief() {
    downloadText("sovereign-stack-executive-meeting-brief.md", `# The Sovereign Stack\n\n**Independent working concept prepared by Rayven-Nikkita (RN) Collins for discussion with Purple Maiʻa**  \n**Version 1.0 · 6 August 2026 · Not a Purple Maiʻa product, policy, endorsement, or community-authorized framework**\n\n## The proposition\n\nPurple Maiʻa has already built public-facing technical, environmental, and educational work joining local infrastructure, place-based observation, and Indigenous approaches to technology. RN proposes one question for discovery: would a practical governance layer help authority travel through a system's full lifecycle—purpose, knowledge boundaries, custody, use, dissent, repair, exit, and retirement?\n\n## What is already built\n\nA working demonstration connects a sovereign-use decision gate, living system record, review history, production decisions, co-design process, and bounded pilot charter. Pause, refusal, withdrawal, and non-digitization are valid outcomes. This is a conversation object—not an adopted protocol or secure production system.\n\n## Why RN\n\nRN combines AI product building, governance and legal-technical translation, evidence architecture, learning design, neuroscience, and human-systems analysis. Her role would be implementation architect working under designated authority—not Indigenous authority or the source of Hawaiian values.\n\n## Proposed first engagement\n\nA bounded, compensated discovery engagement: sponsor interview and preparation; one 90-minute governed co-design session; synthesis; and an editable decision brief. It would identify the real constraint, map standing and documentation boundaries, trace one non-sensitive scenario, and end with one legitimate outcome: stop, revise, continue discovery, or invite a separately chartered pilot.\n\n## Decision requested now\n\nIs this a useful problem to define with the right people? This is not a request to approve a framework, select KILO, disclose protected knowledge, authorize production, or consent to publication.\n\n## Non-negotiable boundaries\n\n- Purple Maiʻa and relevant community and cultural authorities define substance and standing.\n- Protected knowledge does not belong in this public browser demonstration.\n- Public excerpts require separate review and approval.\n- Interest, attendance, form completion, or download does not create authority or consent.\n- Revision, referral, deferral, and stopping are successful outcomes.\n\nPrepared for conversation only. Source claims and their limits are documented in the site's Evidence room.\n`);
  }
  function eraseAllDrafts() {
    setStorageReady(false);
    window.localStorage.removeItem("sovereign-stack-demo-record");
    setRecordValues(initialSystemRecord); setProjectName(""); setProjectPurpose(""); setRecordVisibility("Internal");
    setRecordOwner(""); setReviewDate(""); setDecisionStatus("Draft — no authority decision"); setDecisionNote("");
    setSnapshots([]); setLogEntries([]); setProductionRecords(initialProductionRecords); setSessionRecord(initialSessionRecord);
    setCharterRecord(initialCharterRecord); setReviewResponse(""); setReviewConstraint(""); setReviewPeople(""); setReviewBoundary("");
    setAnswers([]); setNotes([]); setStep(0); setEraseConfirmed(true);
  }
  function carryToRecord() {
    setRecordValues(current => ({ ...current, purpose: projectPurpose || current.purpose, conditions: openConditions.map(condition => `${condition.area}: ${condition.answer} — ${condition.note}`).join("\n") || current.conditions }));
    setRecordField("purpose");
    selectView("record");
  }
  function exportRecord() {
    if (!result) return;
    const payload = {
      status: "UNVALIDATED DEMONSTRATION",
      project: projectName || "Unnamed proposed use",
      statedPurpose: projectPurpose || "Not recorded",
      outcome: result.label,
      outcomeNote: result.note,
      reviewedAt: new Date().toISOString(),
      responses: questions.map((question, index) => ({ area: question.title, question: question.prompt, response: answers[index], rationale: notes[index] || "Not recorded" })),
      openConditions,
      caveat: "This demonstration is not consent, approval, Purple Maiʻa policy, or a substitute for the designated authority's deliberation."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${(projectName || "sovereign-stack-review").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sovereign-stack-review"}.json`; link.click(); URL.revokeObjectURL(url);
  }
  function exportProductionBrief() {
    const approved = productionRecords.filter(record => record.status === "Approved for prototype").length;
    const blocked = productionRecords.filter(record => record.status === "Blocked").length;
    const payload = {
      document: "Sovereign Stack production decision brief",
      status: "PROVISIONAL — REQUIRES PURPLE MAIʻA AUTHORITY",
      generatedAt: new Date().toISOString(),
      purpose: "Decisions required before protected or authoritative records move beyond the browser demonstration.",
      readiness: { approved, total: productionDecisions.length, blocked, backendActivationPermitted: approved === productionDecisions.length && blocked === 0, determination: approved === productionDecisions.length && blocked === 0 ? "Eligible for a separately authorized technical prototype; not authorization to store protected knowledge." : "Backend activation remains blocked." },
      requiredDecisions: productionDecisions.map(([decision, question], index) => ({ decision, question, ...productionRecords[index] })),
      nonNegotiableControls: [
        "Authentication never substitutes for community authority.",
        "Authorization is enforced on the server for every read, write, export, and administrative action.",
        "Public excerpts are separately approved records, not live views of internal records.",
        "Sensitive values are excluded from logs, analytics, notifications, URLs, and client storage.",
        "Authority decisions bind verified identity, authority scope, record version, conditions, dissent, expiry, and timestamp.",
        "Every record has retention, review, withdrawal, export, migration, and retirement rules before activation.",
      ],
      proposedArchitecture: {
        publicSurface: "Public proposal and separately approved public excerpts",
        protectedWorkspace: "Authenticated, invitation-only workspace with server-enforced least privilege",
        authoritativeStore: "Encrypted relational records with append-only event history and version hashes",
        notifications: "Metadata-minimized review and incident notices; protected content stays inside the workspace",
        exports: "Authorized, watermarked, logged, and classified; public exports require separate approval",
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "sovereign-stack-production-decision-brief.json"; a.click(); URL.revokeObjectURL(url);
  }
  function updateProductionRecord(patch: Partial<ProductionDecisionRecord>) {
    setProductionRecords(current => current.map((record, index) => index === productionDecision ? { ...record, ...patch } : record));
  }
  function updateSessionRecord(key: keyof SessionRecord, value: string) {
    setSessionRecord(current => ({ ...current, [key]: value }));
  }
  function exportSessionBrief() {
    const payload = {
      document: "Sovereign Stack co-design session brief",
      status: "PROVISIONAL — NON-SENSITIVE DISCOVERY RECORD",
      generatedAt: new Date().toISOString(),
      purpose: "Facilitate a Purple Maiʻa-governed discovery session without presuming authority, scope, or a decision to build.",
      session: sessionRecord,
      agenda: sessionAgenda.map(([time, stage, purpose]) => ({ time, stage, purpose })),
      decisionRule: "The close must record one of four outcomes: stop; continue discovery; revise the proposal; or invite a bounded prototype. Silence is not consent and attendance is not authority.",
      requiredOutputs: ["Standing and participation map", "Recording and knowledge boundaries", "Bounded use-case map", "Decision owners and evidence needs", "Dissent and unresolved questions", "Stop/go determination with authorized next actions"],
      caveat: "This brief does not establish authority, consent, Purple Maiʻa policy, or permission to record protected knowledge. Purple Maiʻa determines participation, language, documentation, ownership, compensation, confidentiality, and whether the session occurs at all."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "sovereign-stack-codesign-session-brief.json"; link.click(); URL.revokeObjectURL(url);
  }
  function updateCharterRecord(key: keyof CharterRecord, value: string) {
    setCharterRecord(current => ({ ...current, [key]: value }));
  }
  function exportPilotCharter() {
    const drafted = Object.values(charterRecord).filter(value => value.trim()).length;
    const payload = {
      document: "Sovereign Stack bounded pilot charter",
      status: "DRAFT — INVITATION AND AUTHORITY REQUIRED",
      generatedAt: new Date().toISOString(),
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
    const link = document.createElement("a"); link.href = url; link.download = "sovereign-stack-bounded-pilot-charter.json"; link.click(); URL.revokeObjectURL(url);
  }
  function exportSystemRecord() {
    const payload = { status: "UNVALIDATED DEMONSTRATION", recordType: "Sovereign Stack living system record", project: projectName || "KILO example / unnamed proposed use", visibility: recordVisibility, steward: recordOwner || "Not established", nextReview: reviewDate || "Not scheduled", authorityDecision: decisionStatus, exportedAt: new Date().toISOString(), fields: Object.fromEntries(recordFields.map(field => [field.label, recordValues[field.key] || "Unresolved — no entry recorded"])), versionHistory: snapshots, activityLog: logEntries, completeness: `${recordFields.filter(field => recordValues[field.key].trim()).length} of ${recordFields.length} fields contain demonstration entries`, caveat: "This record is a browser-local, unvalidated demonstration. Its roles and signatures are not identity-verified. It is not consent, approval, Purple Maiʻa policy, or a factual account of KILO governance." };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${(projectName || "sovereign-stack-system-record").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sovereign-stack-system-record"}-system-record.json`; link.click(); URL.revokeObjectURL(url);
  }
  function exportExecutiveBrief() {
    const payload = {
      document: "Sovereign Stack executive review brief",
      status: "CONVERSATION RECORD — NOT AUTHORIZATION",
      generatedAt: new Date().toISOString(),
      proposition: "Explore whether Purple Maiʻa would benefit from a community-owned governance and learning layer that carries authority through the lifecycle of a technical system.",
      response: reviewResponse || "No response selected",
      constraint: reviewConstraint || "Not recorded",
      peopleOrAuthoritiesToInclude: reviewPeople || "Not recorded",
      boundaryOrExistingWorkToProtect: reviewBoundary || "Not recorded",
      possibleNextStep: reviewResponse === "Continue discovery" || reviewResponse === "I see a relevant constraint" ? "Purple Maiʻa identifies a sponsor and appropriate participants for a bounded, compensated discovery conversation." : reviewResponse === "Revise the concept" ? "RN revises only against the specific constraint and boundaries Purple Maiʻa chooses to share." : "No work proceeds unless Purple Maiʻa later reopens the question.",
      nonAuthorization: "This brief is not consent, approval, a pilot invitation, a contract, permission to document KILO, or permission to access or store protected information."
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "sovereign-stack-executive-review.json"; link.click(); URL.revokeObjectURL(url);
  }

  function exportEvidenceRegister() {
    const payload = {
      document: "Sovereign Stack evidence and assumptions register",
      preparedAt: new Date().toISOString(),
      status: "WORKING PROPOSAL — NOT PURPLE MAIʻA POLICY",
      entries: evidenceItems,
      reviewRule: "Public facts, RN interpretations, proposed designs, and unresolved questions must remain distinguishable. Purple Maiʻa may correct, reject, restrict, or replace any entry.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "sovereign-stack-evidence-register.json"; link.click(); URL.revokeObjectURL(url);
  }

  return <main>
    <header className="topbar">
      <button className="wordmark" onClick={returnToBeginning} aria-label="Return to beginning"><span className="knot" aria-hidden="true">◈</span><span>The Sovereign Stack</span></button>
      <button className="ownership status-control" onClick={()=>setPrivacyOpen(true)} aria-expanded={privacyOpen}><span />Independent proposal · status &amp; privacy</button>
    </header>

    {privacyOpen && <aside className="privacy-panel" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <button className="privacy-close" onClick={()=>setPrivacyOpen(false)} aria-label="Close status and privacy panel">×</button>
      <p className="overline">Status, privacy &amp; local drafts</p><h2 id="privacy-title">Know what this prototype does—and does not do.</h2>
      <div className="privacy-grid"><article><b>Authorship and status</b><p>Independent working concept prepared by RN Collins for discussion with Purple Maiʻa. It is not a Purple Maiʻa product, policy, endorsement, approved protocol, or community-authorized framework.</p></article><article><b>What this browser stores</b><p>Draft system-record, production-readiness, session, and charter entries are saved only in this browser's local storage so they can survive refresh.</p></article><article><b>What is transmitted</b><p>The prototype has no account, database, submission endpoint, or configured analytics. Draft entries are not sent to RN or stored by this application on a server.</p></article><article><b>What must never be entered</b><p>Do not enter protected cultural knowledge, personal data, credentials, confidential organizational information, authority decisions, or anything requiring secure retention.</p></article></div>
      <div className="privacy-actions"><div><b>Version 1.0 · effective 6 August 2026</b><span>Public demonstration · browser-local drafting only</span></div><button onClick={eraseAllDrafts}>Erase all browser drafts</button></div>
      {eraseConfirmed&&<p className="erase-confirm" role="status">All Sovereign Stack drafts stored by this site in this browser have been erased.</p>}
    </aside>}

    <section className="hero">
      <div className="hero-copy">
        <p className="overline">A proposed governance &amp; learning layer</p>
        <h1>Infrastructure can be local.<br/><em>Authority must travel through it.</em></h1>
        <p className="lede">A Purple Maiʻa-owned way to carry community purpose, authority, knowledge boundaries, accountability, and the right to refuse through the life of an AI system.</p>
        <div className="hero-actions"><button className="primary light" onClick={() => selectView("meeting")}>Start 7-minute meeting <span>→</span></button><button className="text-link" onClick={() => selectView("review")}>Executive review</button></div>
      </div>
      <div className="hero-orbit" aria-label="Illustration of governance surrounding a technical system"><div className="orbit orbit-a"><span>Purpose</span><span>Authority</span></div><div className="orbit orbit-b"><span>Knowledge</span><span>Control</span></div><div className="orbit-core">Use case<br/><small>under review</small></div></div>
    </section>

    <div className="scope-strip"><b>This is a proposal, not Purple Maiʻa policy.</b><span>Purple Maiʻa and the relevant community and cultural authorities would define the substance. This prototype demonstrates a possible structure for their review.</span></div>

    <nav className="section-nav" aria-label="Proposal sections">{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)}><span>{item.eyebrow}</span>{item.label}</button>)}</nav>

    {view === "meeting" && <section id="meeting-content" className="content meeting-mode" tabIndex={-1}>
      <div className="meeting-top"><div><p className="overline">Meeting mode · six decisions · approximately seven minutes</p><h2>A short path through the full proposition.</h2></div><p>Use this in conversation. The complete product remains available in the numbered rooms as the evidence and working layer beneath it.</p></div>
      <div className="meeting-progress" aria-label={`Meeting step ${meetingStep + 1} of ${meetingSlides.length}`}>{meetingSlides.map((slide,index)=><button key={slide.label} className={index===meetingStep?"active":index<meetingStep?"complete":""} onClick={()=>setMeetingStep(index)} aria-label={`Go to ${slide.label}`}><span>{String(index+1).padStart(2,"0")}</span><b>{slide.label}</b></button>)}</div>
      <article className="meeting-card" aria-live="polite">
        <div className="meeting-number">{String(meetingStep+1).padStart(2,"0")}<small>/ {String(meetingSlides.length).padStart(2,"0")}</small></div>
        <div><p className="overline">{meetingSlides[meetingStep].label}</p><h3>{meetingSlides[meetingStep].title}</h3><p className="meeting-body">{meetingSlides[meetingStep].body}</p><div className="meeting-proof"><b>Keep the boundary visible</b><span>{meetingSlides[meetingStep].proof}</span></div></div>
      </article>
      {meetingStep===3 && <div className="rn-proof"><div><span>Build</span><b>Interactive AI and governance products</b></div><div><span>Translate</span><b>Law, evidence, systems, and implementation</b></div><div><span>Design</span><b>Human-centered learning and decision tools</b></div><div><span>Transfer</span><b>Editable infrastructure the client can own</b></div></div>}
      {meetingStep===4 && <div className="engagement-scope"><article><span>Inputs</span><b>Sponsor context, approved public or non-sensitive materials, participation and recording boundaries</b></article><article><span>Working sequence</span><b>60-minute sponsor interview → preparation → 90-minute governed session → synthesis</b></article><article><span>Outputs</span><b>Constraint definition, authority/standing map, boundary register, scenario trace, and stop/revise/pilot recommendation</b></article><article><span>Not included</span><b>Protected-data access, production system, community-wide claims, public materials, or a presumed pilot</b></article></div>}
      <div className="meeting-controls"><button disabled={meetingStep===0} onClick={()=>setMeetingStep(step=>Math.max(0,step-1))}>← Previous</button><span>{meetingSlides[meetingStep].label}</span>{meetingStep<meetingSlides.length-1?<button className="primary" onClick={()=>setMeetingStep(step=>Math.min(meetingSlides.length-1,step+1))}>Next <span>→</span></button>:<button className="primary" onClick={()=>selectView("review")}>Record a response <span>→</span></button>}</div>
      <div className="meeting-links"><button onClick={exportMeetingBrief}>Download one-page meeting brief</button><button onClick={()=>window.print()}>Print / save as PDF</button><button onClick={()=>selectView("evidence")}>Inspect the evidence register</button><button onClick={()=>selectView("session")}>Inspect the co-design session</button><button onClick={()=>selectView("charter")}>Inspect the pilot boundary</button></div>
    </section>}

    {view === "overview" && <section id="overview-content" className="content overview" tabIndex={-1}>
      <div className="section-intro"><p className="overline">The opportunity</p><h2>The stack already has a technical body. This is a possible way to give its decisions a durable form.</h2><p>Purple Maiʻa’s public work describes local compute, open models, edge hardware, place-based environmental observation, and Indigenous approaches to technology. The open question this proposal explores is whether a reusable governance layer would help carry authority through those systems without reducing sovereignty to a checklist.</p></div>
      <div className="evidence-band"><div><b>Publicly grounded</b><span>Purple Maiʻa’s published work on the Sovereign Stack, KILO, Kānāwai, Kula, Waiw.AI, and Rooted Futures.</span></div><div><b>Proposed by RN</b><span>The decision gate, system record, pilot sequence, governance roles, and learning translations shown here.</span></div><div><b>Not yet known</b><span>Whether this solves a real constraint, who should govern it, whether KILO is the right pilot, and what may be documented.</span></div></div>
      <div className="principles">
        <article><Mark>01</Mark><h3>Community defines the purpose</h3><p>No project begins with a model. It begins with a collectively recognized need and people with standing to define it.</p></article>
        <article><Mark>02</Mark><h3>Not everything becomes data</h3><p>The process must make room for knowledge that is restricted, contextual, ephemeral, seasonal, sacred, or never appropriate to digitize.</p></article>
        <article><Mark>03</Mark><h3>Refusal is an operating capability</h3><p>A sovereign process can approve, limit, redesign, defer, contest, withdraw, or refuse. “No” is not a technical failure.</p></article>
      </div>
      <div className="callout"><p>Designed under authority, never in place of it.</p><span>RN’s proposed role is governance and legal-technical translation: listening, mapping, documenting, prototyping, testing, and transferring the implementation. RN would not define Hawaiian values, decide who speaks for a community, validate kānāwai, or authorize a use of knowledge or data.</span></div>
      <button className="primary" onClick={() => selectView("proposal")}>What would we build? <span>→</span></button>
    </section>}

    {view === "proposal" && <section id="proposal-content" className="content proposal" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">The proposed product</p><h2>A governed pathway—not another statement of principles.</h2><p>The working system would connect a proposal to an authority decision, preserve its conditions, make dependencies legible, and keep review, withdrawal, repair, and retirement available over time.</p></div>
      <div className="journey"><p className="overline">One connected record</p><div className="journey-line">{["Purpose","Authority","Boundaries","Custody","Decision","Use & review","Exit & repair"].map((item,i)=><div key={item}><b>{String(i+1).padStart(2,"0")}</b><span>{item}</span></div>)}</div></div>
      <div className="proposal-grid">
        <article><span>01</span><h3>Decision protocol</h3><p>A facilitated gate that makes missing authority, non-AI alternatives, prohibited boundaries, custody, collective benefit, stopping power, and repair visible before build or adoption.</p></article>
        <article><span>02</span><h3>Living system record</h3><p>A versioned record of the approved purpose, decision-makers, permissions, restrictions, dependencies, review triggers, incidents, changes, challenges, and exit plan.</p></article>
        <article><span>03</span><h3>Bounded implementation pilot</h3><p>One use case—KILO only if Purple Maiʻa identifies it as appropriate—used to test the structure without claiming to represent every project or community.</p></article>
        <article><span>04</span><h3>Optional learning translation</h3><p>Only after validation: workshops, technical labs, educator materials, a community canvas, or a public field guide derived from what authorities approve for sharing.</p></article>
      </div>
      <div className="ownership-grid"><article><p className="label">Purple Maiʻa would own</p><ul><li>All approved deliverables and editable source materials</li><li>Its language, rules, records, configurations, and future revisions</li><li>The decision to keep, publish, license, adapt, restrict, or retire the work</li></ul></article><article><p className="label">The process would protect</p><ul><li>Least documentation and least access by default</li><li>Separate public, internal, restricted, and never-recorded layers</li><li>Community review before representation or educational reuse</li></ul></article><article><p className="label">The tool would never do</p><ul><li>Decide who holds cultural or community authority</li><li>Convert consent into a one-time checkbox</li><li>Treat passage through a form as approval</li><li>Expose protected knowledge to prove accountability</li></ul></article></div>
      <div className="decision-box"><div><p className="overline">The decision requested now</p><h3>Is there a real governance or learning constraint here worth exploring together?</h3></div><p>Not approval of this prototype. Not permission to document KILO. The first conversation should identify whether the problem is real, what existing work must not be duplicated, who else must be present, and whether a small discovery phase would be useful.</p></div>
      <button className="primary" onClick={() => selectView("gate")}>Experience the gate <span>→</span></button>
    </section>}

    {view === "gate" && <section id="gate-content" className="content gate" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Pre-build protocol · demonstration</p><h2>Should this enter the stack?</h2><p>No answers leave this page or persist after refresh. This simplified gate shows how a project can stop before technology outruns authority. In practice, deliberation, evidence, named roles, conditions, dissent, and review dates would sit behind each response.</p></div>
      <div className="gate-intake" aria-label="Proposed use context"><label><span>Proposed use or project</span><input value={projectName} onChange={event=>setProjectName(event.target.value)} placeholder="e.g., a local environmental observation tool" /></label><label><span>Community purpose—as currently understood</span><textarea value={projectPurpose} onChange={event=>setProjectPurpose(event.target.value)} placeholder="State the need without entering restricted or sensitive knowledge." rows={2} /></label><p><b>Privacy boundary</b> · Use a hypothetical or non-sensitive scenario. This demonstration stores nothing after refresh.</p></div>
      <div className="gate-shell"><aside>{questions.map((q,i)=><button key={q.title} className={`${i===step?"current":""} ${answers[i]?"done":""}`} onClick={()=>setStep(i)} aria-current={i===step?"step":undefined}><span>{answers[i]?"✓":i+1}</span>{q.title}</button>)}</aside><div className="question-panel">
        <p className="counter">Question {step+1} of {questions.length}</p><h3>{questions[step].title}</h3><p>{questions[step].prompt}</p>
        <div className="options">{questions[step].options.map(option=><button key={option} className={answers[step]===option?"selected":""} onClick={()=>choose(option)}><span/>{option}</button>)}</div>
        <label className="rationale"><span>Rationale, evidence, dissent, or unresolved question <i>optional in this demonstration</i></span><textarea value={notes[step] || ""} onChange={event=>{const next=[...notes];next[step]=event.target.value;setNotes(next)}} placeholder="Record why this response was chosen without entering protected content." rows={3}/></label>
        {result && step===questions.length-1 && <div ref={resultRef} className="result" role="status" aria-live="polite"><p>Unvalidated demonstration result</p><h4>{result.label}</h4><span>{result.note}</span><div className="result-meta"><b>{projectName || "Unnamed proposed use"}</b><span>{openConditions.length} open or blocking condition{openConditions.length===1?"":"s"}</span></div>{openConditions.length>0&&<div className="condition-list">{openConditions.map(condition=><div key={condition.area}><b>{condition.area}</b><span>{condition.answer}</span><small>{condition.note}</small></div>)}</div>}<div className="result-actions"><button onClick={carryToRecord}>Continue to system record →</button><button onClick={exportRecord}>Download review record</button><button onClick={()=>window.print()}>Print / save as PDF</button><button onClick={clearGate}>Clear demonstration</button></div></div>}
        <div className="gate-footer"><button disabled={step===0} onClick={()=>setStep(step-1)}>← Previous</button><span>Decision belongs to the designated authority</span><button disabled={step===questions.length-1} onClick={()=>setStep(step+1)}>Next →</button></div>
      </div></div>
      <div className="gate-after"><b>A production version would add:</b><span>Named roles and standing · evidence and rationale · approval conditions · dissent and unresolved questions · risk and benefit owners · review triggers and expiry · access controls · change history · challenge, incident, withdrawal, and repair paths.</span></div>
    </section>}

    {view === "record" && <section id="record-content" className="content record" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Living system record · working demonstration</p><h2>Carry a decision through the system’s life.</h2><p>This editable record demonstrates the container—not KILO’s actual governance. Enter only hypothetical or non-sensitive material. The working draft persists only in this browser until you erase it; nothing is sent to a server.</p></div>
      <div className="status-row"><span className="status">Unvalidated demonstration</span><span>{recordFields.filter(field=>recordValues[field.key].trim()).length} of {recordFields.length} fields drafted · Authority, record owner, and review date not established</span></div>
      <div className="record-toolbar"><div><label>Record name<input value={projectName} onChange={event=>setProjectName(event.target.value)} placeholder="KILO example or another proposed use" /></label><label>Demonstration visibility<select value={recordVisibility} onChange={event=>setRecordVisibility(event.target.value as typeof recordVisibility)}><option>Internal</option><option>Restricted</option><option>Public excerpt</option></select></label></div><p><b>Classification is a governance decision, not a publishing toggle.</b> A production system would enforce access, approval, redaction, and separate public/internal records. This selector only demonstrates the required distinction.</p></div>
      <div className="record-workspace"><aside aria-label="System record fields">{[...new Set(recordFields.map(field=>field.group))].map(group=><div key={group}><p>{group}</p>{recordFields.filter(field=>field.group===group).map(field=><button key={field.key} className={recordField===field.key?"active":""} onClick={()=>setRecordField(field.key)}><span>{recordValues[field.key].trim()?"✓":"○"}</span>{field.label}</button>)}</div>)}</aside><div className="record-editor">{recordFields.filter(field=>field.key===recordField).map(field=><div key={field.key}><p className="overline">{field.group} · editable field</p><h3>{field.label}</h3><p>{field.prompt}</p><label><span>Demonstration entry</span><textarea rows={11} value={recordValues[field.key]} onChange={event=>setRecordValues(current=>({...current,[field.key]:event.target.value}))} placeholder={field.placeholder}/></label><div className="record-guidance"><b>Evidence status must remain visible</b><span>In production, each entry would identify whether it is a community-defined rule, approved fact, technical observation, interpretation, proposal, dissent, or unresolved question—plus its source, authority, date, and review trigger.</span></div><div className="record-pagination"><button disabled={recordFields.findIndex(item=>item.key===recordField)===0} onClick={()=>setRecordField(recordFields[recordFields.findIndex(item=>item.key===recordField)-1].key)}>← Previous field</button><span>{recordFields.findIndex(item=>item.key===recordField)+1} of {recordFields.length}</span><button disabled={recordFields.findIndex(item=>item.key===recordField)===recordFields.length-1} onClick={()=>setRecordField(recordFields[recordFields.findIndex(item=>item.key===recordField)+1].key)}>Next field →</button></div></div>)}</div></div>
      <div className="governance-console">
        <div className="console-head"><div><p className="overline">Governed persistence · browser demonstration</p><h3>Control the record around the record.</h3></div><label>Preview a role<select value={activeRole} onChange={event=>setActiveRole(event.target.value as Role)}><option>Steward</option><option>Authority reviewer</option><option>Technical contributor</option><option>Observer</option></select></label></div>
        <div className="security-boundary"><b>This is durable only in this browser—not secure organizational storage.</b><span>The draft now survives refresh on this device so the workflow can be tested. Roles are a preview, not identity verification. Do not enter protected information. A production release requires Purple Maiʻa-approved authentication, encrypted storage, server-enforced permissions, retention rules, backups, and an incident plan.</span></div>
        <div className="control-grid">
          <section><p className="label">Custody &amp; review</p><label>Record steward<input disabled={!canEdit} value={recordOwner} onChange={event=>setRecordOwner(event.target.value)} placeholder="Role or body; avoid personal data" /></label><label>Next mandatory review<input disabled={!canEdit} type="date" value={reviewDate} onChange={event=>setReviewDate(event.target.value)} /></label><button disabled={!canEdit} onClick={()=>{addLog("Review", `Review scheduled for ${reviewDate || "an unresolved date"}.`);}}>Record review schedule</button></section>
          <section><p className="label">Authority decision</p><label>Status<select disabled={!canDecide} value={decisionStatus} onChange={event=>setDecisionStatus(event.target.value)}><option>Draft — no authority decision</option><option>Returned for revision</option><option>Approved with conditions</option><option>Declined</option><option>Withdrawn</option><option>Expired</option></select></label><label>Rationale / conditions<textarea disabled={!canDecide} rows={3} value={decisionNote} onChange={event=>setDecisionNote(event.target.value)} placeholder={canDecide?"Record a non-sensitive rationale and conditions.":"Switch to Authority reviewer to demonstrate this control."}/></label><button disabled={!canDecide || !decisionNote.trim()} onClick={recordDecision}>Sign demonstration decision</button><small>A production signature would bind a verified identity, authority scope, timestamp, record hash, expiry, and dissent—not merely a typed name.</small></section>
          <section><p className="label">Version history</p><button disabled={!canEdit} onClick={saveSnapshot}>Preserve current version</button>{snapshots.length===0?<p>No preserved versions yet.</p>:snapshots.slice(0,3).map(snapshot=><div className="mini-record" key={snapshot.id}><b>{snapshot.label}</b><span>{new Date(snapshot.at).toLocaleString()} · {Object.values(snapshot.fields).filter(Boolean).length}/{recordFields.length} drafted</span><button onClick={()=>setRecordValues(snapshot.fields)}>Restore as working draft</button></div>)}</section>
          <section><p className="label">Change / incident log</p><label>Non-sensitive log entry<textarea rows={3} value={logDraft} onChange={event=>setLogDraft(event.target.value)} placeholder="What changed, happened, or requires attention?" /></label><div className="log-buttons"><button onClick={()=>{addLog("Change",logDraft);setLogDraft("")}}>Add change</button><button onClick={()=>{addLog("Incident",logDraft);setLogDraft("")}}>Add incident</button></div>{logEntries.slice(0,4).map(entry=><div className="mini-record" key={entry.id}><b>{entry.kind} · {entry.actor}</b><span>{entry.summary}</span><small>{new Date(entry.at).toLocaleString()}</small></div>)}</section>
        </div>
      </div>
      <div className="record-actions"><button className="primary" onClick={exportSystemRecord}>Download system record <span>↓</span></button><button onClick={()=>window.print()}>Print / save current view</button><button onClick={()=>{setRecordValues(initialSystemRecord);setRecordField("purpose")}}>Clear fields</button><button onClick={()=>{window.localStorage.removeItem("sovereign-stack-demo-record");setRecordValues(initialSystemRecord);setSnapshots([]);setLogEntries([]);setRecordOwner("");setReviewDate("");setDecisionStatus("Draft — no authority decision")}}>Erase browser draft</button></div>
      <div className="record-note"><b>Hard boundary:</b> completeness never requires protected content. A field may say “restricted,” “not recorded,” “authority not established,” or “decision deferred.” Those are legitimate governance states—not missing data to be filled by an outsider.</div>
    </section>}

    {view === "pilot" && <section id="pilot-content" className="content pilot" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">A bounded path to a real answer</p><h2>Begin with discovery. Earn the right to prototype.</h2><p>The work should narrow or stop whenever the relevant authority says it is unnecessary, duplicative, burdensome, unsafe, or outside RN’s role. KILO is an example candidate, not a presumed assignment.</p></div>
      <div className="pilot-list">{pilotPhases.map(([name,copy],i)=><article key={name}><Mark>{String(i+1).padStart(2,"0")}</Mark><h3>{name}</h3><p>{copy}</p><span>{i===0?"First conversation":i===5?"Ownership handoff":"Only if invited forward"}</span></article>)}</div>
      <div className="roles"><article><p className="label">Purple Maiʻa / designated authorities</p><h3>Define, decide, correct, restrict, approve, refuse.</h3><p>Identify standing; set language and boundaries; decide access and publication; validate or reject the resulting practice.</p></article><article><p className="label">RN</p><h3>Listen, translate, map, build, test, document, transfer.</h3><p>Hold process rigor and implementation detail without supplying cultural authority or treating legal analysis as community consent.</p></article><article><p className="label">Technical / program teams</p><h3>Explain, test, maintain, challenge, operate.</h3><p>Map real architecture and constraints; test whether controls work; identify operational burden; own only the responsibilities explicitly assigned.</p></article></div>
      <div className="success"><p className="overline">Success is not “a completed framework”</p><div><span>People can tell what requires authority—and whose.</span><span>Protected knowledge stays protected.</span><span>AI and non-AI alternatives remain visible.</span><span>Every dependency and accountable owner is legible.</span><span>Pause, challenge, withdrawal, repair, and exit work in practice.</span><span>Purple Maiʻa can maintain or retire the system without RN.</span></div></div>
      <div className="decision-box"><div><p className="overline">Possible first engagement</p><h3>A short, paid discovery and co-design phase—with a stop/go decision before any pilot.</h3></div><p>Scope, participants, duration, compensation, confidentiality, ownership terms, and deliverables should be defined only after Donavan identifies the actual need and the relevant authorities are invited into scope-setting.</p></div>
    </section>}

    {view === "learning" && <section id="learning-content" className="content learning" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">After validation—not before</p><h2>Translate approved practice into learning.</h2><p>The educational and public layer should emerge from something Purple Maiʻa has tested and chosen to share. It should teach judgment and power—not merely vocabulary—and never expose what the governance layer exists to protect.</p></div>
      <div className="learning-grid">
        <article><span>Workshop simulation</span><h3>Who gets to decide?</h3><p>Participants identify missing authority, competing interests, hidden burdens, and whether to proceed, redesign, defer, or refuse.</p><b>Possible audience · youth, educators, community teams</b></article>
        <article><span>Technical lab</span><h3>Where does the data go?</h3><p>Trace one task through local and commercial routes. Compare custody, retention, latency, energy, dependency, control, and exit.</p><b>Possible audience · builders, students, funders</b></article>
        <article><span>Facilitation canvas</span><h3>Should we build this?</h3><p>A reusable, non-digital-first version of the gate that preserves uncertainty and discussion rather than turning deliberation into compliance theater.</p><b>Possible audience · project teams, partners</b></article>
        <article><span>Public field guide</span><h3>What did this practice teach?</h3><p>A Purple Maiʻa-owned account of an approved process, its tradeoffs, limits, failures, and learning—without presenting one implementation as universally transferable.</p><b>Possible audience · policymakers, peer organizations</b></article>
      </div>
      <div className="sequence"><p className="overline">The sequence matters</p>{["Listen","Govern","Pilot","Validate","Choose what to teach"].map((x,i)=><div key={x}><span>{i+1}</span><b>{x}</b></div>)}</div>
      <div className="sources"><p className="label">Public context informing this proposal</p><a href="https://www.purplemaia.org/purple-blog/eahou-fest-2026-update-on-ai" target="_blank" rel="noreferrer">Purple Maiʻa · 2026 update on AI ↗</a><a href="https://www.purplemaia.org/purple-blog/data-guided-by-k%C4%81n%C4%81wai" target="_blank" rel="noreferrer">Purple Maiʻa · Data Guided by Kānāwai ↗</a><a href="https://www.purplemaia.org/kula" target="_blank" rel="noreferrer">Purple Maiʻa · Kula ↗</a><a href="https://www.gida-global.org/careprinciples" target="_blank" rel="noreferrer">Global Indigenous Data Alliance · CARE Principles ↗</a><a href="https://localcontexts.org/labels/traditional-knowledge-labels/" target="_blank" rel="noreferrer">Local Contexts · TK Labels ↗</a></div>
    </section>}

    {view === "readiness" && <section id="readiness-content" className="content readiness" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Production path · decisions before infrastructure</p><h2>Secure the authority model before securing the software.</h2><p>The working prototype proves the workflow. A production system should begin only after Purple Maiʻa determines who governs it, what may enter it, where it may operate, and how power can be challenged or withdrawn.</p></div>
      <div className="readiness-state"><div><span>Current state</span><strong>Safe workflow demonstration</strong><p>Useful for discussion with hypothetical or non-sensitive material. Not an authoritative record system.</p></div><i>→</i><div><span>Decision gate</span><strong>Community-approved production contract</strong><p>Identity, authority, knowledge classes, hosting, retention, incident response, and ownership resolved.</p></div><i>→</i><div><span>Future state</span><strong>Protected operating workspace</strong><p>Server-enforced access, durable records, verified decisions, and separately approved public excerpts.</p></div></div>
      <div className="architecture-map"><article><span>Public surface</span><h3>Proposal + approved excerpts</h3><p>No internal record is made public by changing a dropdown. Publication creates a separately reviewed, redacted, and approved artifact.</p></article><article><span>Protected workspace</span><h3>Invitation + least privilege</h3><p>Identity establishes who signed in. A Purple Maiʻa-governed membership registry establishes what that person may see or do.</p></article><article><span>Authoritative record</span><h3>Versions + append-only events</h3><p>Every material change preserves who acted, under which role and authority, against which version, and with what review or expiry requirement.</p></article><article><span>Exit and repair</span><h3>Withdrawal + migration + retirement</h3><p>The system is incomplete unless authority can pause use, narrow permissions, export records, verify deletion, migrate dependencies, and end the system.</p></article></div>
      <div className="production-contract"><div><p className="overline">Six decisions Purple Maiʻa must own</p><h3>The platform cannot answer these on their behalf.</h3><p>Each unresolved item blocks storage of protected or authoritative records. Discovery should produce decisions, named owners, evidence, dissent, and review dates—not simply vendor selections.</p></div><ol>{productionDecisions.map(([decision,question])=><li key={decision}><span>Unresolved</span><div><b>{decision}</b><p>{question}</p></div></li>)}</ol></div>
      <div className="activation-workspace">
        <div className="activation-head"><div><p className="overline">Discovery &amp; activation workspace · browser demonstration</p><h3>Turn unresolved choices into governed decisions.</h3><p>Use hypothetical or non-sensitive notes only. A status describes discovery progress; it does not prove authority or authorize infrastructure.</p></div><div className="readiness-score"><strong>{productionRecords.filter(record=>record.status==="Approved for prototype").length}/{productionDecisions.length}</strong><span>approved for prototype</span><small>{productionRecords.some(record=>record.status==="Blocked")?"A recorded block is active":"Backend remains off until all six qualify"}</small></div></div>
        <div className="activation-body"><aside aria-label="Production decisions">{productionDecisions.map(([decision],index)=><button key={decision} className={productionDecision===index?"active":""} onClick={()=>setProductionDecision(index)}><span>{productionRecords[index].status==="Approved for prototype"?"✓":productionRecords[index].status==="Blocked"?"!":"○"}</span><div><b>{decision}</b><small>{productionRecords[index].status}</small></div></button>)}</aside><div className="activation-editor"><p className="overline">Decision {productionDecision+1} of {productionDecisions.length}</p><h3>{productionDecisions[productionDecision][0]}</h3><p>{productionDecisions[productionDecision][1]}</p><div className="activation-fields"><label>Status<select value={productionRecords[productionDecision].status} onChange={event=>updateProductionRecord({status:event.target.value as ProductionStatus})}><option>Not examined</option><option>Discovery underway</option><option>Draft decision</option><option>Approved for prototype</option><option>Blocked</option></select></label><label>Accountable owner or authority body<input value={productionRecords[productionDecision].owner} onChange={event=>updateProductionRecord({owner:event.target.value})} placeholder="Role or body; avoid personal information" /></label><label>Evidence required to resolve this decision<textarea rows={4} value={productionRecords[productionDecision].evidence} onChange={event=>updateProductionRecord({evidence:event.target.value})} placeholder="What must be reviewed, tested, documented, or decided—and by whom?" /></label><label>Conditions, dissent, or remaining questions<textarea rows={4} value={productionRecords[productionDecision].conditions} onChange={event=>updateProductionRecord({conditions:event.target.value})} placeholder="Preserve disagreement and unknowns; do not enter protected content." /></label></div><div className="activation-guidance"><b>“Approved for prototype” is deliberately narrow.</b><span>It means the decision has enough legitimate direction to design or test the corresponding control. It does not authorize protected data, production launch, publication, or use by another project or community.</span></div><div className="record-pagination"><button disabled={productionDecision===0} onClick={()=>setProductionDecision(productionDecision-1)}>← Previous decision</button><span>{productionDecision+1} of {productionDecisions.length}</span><button disabled={productionDecision===productionDecisions.length-1} onClick={()=>setProductionDecision(productionDecision+1)}>Next decision →</button></div></div></div>
      </div>
      <div className="control-matrix"><p className="overline">Minimum production controls</p><div><article><b>Every request</b><span>Authenticate identity</span><span>Verify membership</span><span>Enforce role + record scope</span><span>Apply classification rule</span></article><article><b>Every decision</b><span>Bind exact record version</span><span>Capture authority scope</span><span>Preserve conditions + dissent</span><span>Set expiry or review trigger</span></article><article><b>Every disclosure</b><span>Create separate excerpt</span><span>Redact by default</span><span>Require publication approval</span><span>Log export without content</span></article><article><b>Every lifecycle</b><span>Schedule review</span><span>Enable challenge + pause</span><span>Test recovery + migration</span><span>Verify retirement obligations</span></article></div></div>
      <div className="security-boundary production-warning"><b>Hard stop before backend activation</b><span>{productionRecords.every(record=>record.status==="Approved for prototype") ? "All six areas are marked ready for a technical prototype in this browser demonstration. That still requires verified authority, documented approval, and a separate activation decision before any real backend or protected information is introduced." : "No real protected knowledge, community records, or authority decisions should enter a hosted database until all six production decisions are legitimately resolved. Encryption and login screens cannot cure an unresolved authority or knowledge-boundary question."}</span></div>
      <div className="readiness-actions"><button className="primary" onClick={exportProductionBrief}>Download production decision brief <span>↓</span></button><button onClick={()=>selectView("pilot")}>Return to pilot path</button></div>
    </section>}

    {view === "session" && <section id="session-content" className="content session" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Co-design session · executable discovery</p><h2>Make the next conversation capable of producing a real decision.</h2><p>This is a facilitation architecture—not a prewritten answer. Purple Maiʻa chooses whether to convene, who has standing, what may be discussed or recorded, and whether the work stops, continues, changes shape, or becomes a bounded prototype.</p></div>
      <div className="session-guardrails"><article><span>Before invitation</span><h3>Confirm purpose and sponsor.</h3><p>Donavan’s interest can open discovery; it does not identify every relevant authority. Confirm the actual organizational question, who should convene, and whether compensation or confidentiality must precede participation.</p></article><article><span>Before recording</span><h3>Set the knowledge boundary.</h3><p>Decide what may be written, attributed, photographed, exported, or retained. The safest valid outcome may be an oral process with only non-sensitive decisions recorded.</p></article><article><span>Before closing</span><h3>Name who can decide.</h3><p>Distinguish contributors, affected people, technical operators, advisors, sponsors, and authorities. Attendance, expertise, employment, or account access alone does not create standing.</p></article></div>
      <div className="session-agenda"><div className="session-agenda-head"><p className="overline">A 90-minute first working session</p><h3>Every segment earns the next one.</h3><p>The facilitator may pause or end the process at any point. Timeboxes protect attention; they do not override deliberation or require consensus.</p></div>{sessionAgenda.map(([time,stage,purpose],index)=><article key={stage}><b>{time}</b><span>{String(index+1).padStart(2,"0")}</span><div><h3>{stage}</h3><p>{purpose}</p></div></article>)}</div>
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
      <div className="decision-box"><div><p className="overline">What Donavan is asked to decide first</p><h3>Is there a real governance or learning constraint worth exploring—and who should be in the room to define it?</h3></div><p>Not whether to approve this framework. Not whether KILO becomes the pilot. Not whether a backend should be activated. The first decision is simply whether a properly scoped, appropriately governed discovery process would be useful.</p></div>
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
      <div className="section-intro compact"><p className="overline">Executive review · the whole proposition in one room</p><h2>Is there enough here to justify a governed discovery conversation?</h2><p>This is the shortest path through the proposal. It does not ask Purple Maiʻa to approve the framework, disclose protected knowledge, select KILO, or authorize a build. It asks whether RN has identified a real constraint worth defining with the right people.</p></div>
      <div className="executive-grid">
        <article><span>What RN observed</span><h3>The technical stack is only part of sovereignty.</h3><p>Purple Maiʻa’s public work already demonstrates local infrastructure, models, edge systems, education, and place-based practice. The possible unresolved layer is how authority, boundaries, review, refusal, repair, and exit remain operational as systems change.</p></article>
        <article><span>What RN proposes</span><h3>A governance pathway Purple Maiʻa would own.</h3><p>A decision protocol, living system record, bounded pilot, and optional learning translation—co-designed only if Purple Maiʻa identifies a need and the relevant authorities define the rules.</p></article>
        <article><span>What exists now</span><h3>A working demonstration, not an adopted system.</h3><p>The prototype makes the workflow tangible: gate, record, production choices, co-design agenda, and pilot charter. It intentionally stores no protected organizational data and creates no authority.</p></article>
        <article><span>What RN is asking</span><h3>Permission to learn whether the problem is real.</h3><p>The immediate decision is whether a bounded, appropriately compensated discovery conversation would be useful—and who must be involved to define the question correctly.</p></article>
      </div>
      <div className="executive-boundaries"><p className="overline">Non-negotiable boundaries</p><div><span>No claim to Indigenous authority</span><span>No presumption that KILO is the pilot</span><span>No protected data in this prototype</span><span>No publication without separate approval</span><span>No production by momentum</span><span>Stop is a successful outcome</span></div></div>
      <div className="review-room">
        <div className="review-room-head"><div><p className="overline">CEO response path · browser demonstration</p><h3>Record direction without accidentally granting permission.</h3></div><p>Use only non-sensitive notes. Download creates a conversation brief, not an authorization record.</p></div>
        <div className="response-options">{(["I see a relevant constraint", "Continue discovery", "Revise the concept", "Not useful now", "Not mine to decide"] as ReviewResponse[]).map(response=><button key={response} className={reviewResponse===response?"selected":""} onClick={()=>setReviewResponse(response)}><span>{reviewResponse===response?"✓":"○"}</span>{response}</button>)}</div>
        <div className="review-fields">
          <label>What constraint, if any, is worth defining?<textarea rows={3} value={reviewConstraint} onChange={event=>setReviewConstraint(event.target.value)} placeholder="A non-sensitive description in Purple Maiʻa’s own terms." /></label>
          <label>Who should shape or decide the question?<textarea rows={3} value={reviewPeople} onChange={event=>setReviewPeople(event.target.value)} placeholder="Roles or bodies—not private personal information." /></label>
          <label>What existing work or boundary must RN protect?<textarea rows={3} value={reviewBoundary} onChange={event=>setReviewBoundary(event.target.value)} placeholder="Work not to duplicate; topics not to document; assumptions to remove." /></label>
        </div>
        <div className="review-close"><div><b>{reviewResponse || "No direction selected"}</b><span>{reviewResponse === "Continue discovery" || reviewResponse === "I see a relevant constraint" ? "Possible next step: define a bounded discovery invitation." : reviewResponse === "Revise the concept" ? "Possible next step: revise only against the direction provided." : reviewResponse ? "No work proceeds from this response." : "Reviewing the proposal does not imply interest or consent."}</span></div><button className="primary" disabled={!reviewResponse} onClick={exportExecutiveBrief}>Download executive review <span>↓</span></button></div>
      </div>
      <div className="decision-box"><div><p className="overline">The one-sentence proposition</p><h3>Purple Maiʻa has built sovereign technical capacity; RN may be useful in helping operationalize the governance and learning layer around it.</h3></div><p>The site is evidence that RN can think and build at this level. Whether the proposed layer is actually useful remains Purple Maiʻa’s question to define.</p></div>
    </section>}

    {view === "evidence" && <section id="evidence-content" className="content evidence-room" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Evidence room · what is known, inferred, proposed, and open</p><h2>Let every claim carry its own boundary.</h2><p>This register makes the proposal auditable without creating false certainty. It separates Purple Maiʻa's public record from RN's interpretation and design work, then names the questions that only Purple Maiʻa and the relevant authorities can answer.</p></div>
      <div className="evidence-rule"><div><span>01</span><b>Public fact is not permission.</b><p>A published description can ground context. It cannot authorize access, reuse, representation, or a pilot.</p></div><div><span>02</span><b>A proposal is not a finding.</b><p>RN's system designs are offered for correction and testing; their completeness does not prove organizational need.</p></div><div><span>03</span><b>Unresolved is a valid state.</b><p>The register keeps gaps visible until the right people answer—or decide the question should not be recorded.</p></div></div>
      <div className="evidence-toolbar"><div role="group" aria-label="Filter evidence register">{(["All", "Verified public context", "RN interpretation", "Proposed design", "Unresolved"] as EvidenceType[]).map(type=><button key={type} className={evidenceFilter===type?"active":""} onClick={()=>setEvidenceFilter(type)}>{type}<span>{type==="All"?evidenceItems.length:evidenceItems.filter(item=>item.type===type).length}</span></button>)}</div><button onClick={exportEvidenceRegister}>Download register ↓</button></div>
      <div className="evidence-register">{evidenceItems.filter(item=>evidenceFilter==="All"||item.type===evidenceFilter).map((item,index)=><article key={`${item.type}-${item.claim}`}><div className="evidence-kind"><span>{String(index+1).padStart(2,"0")}</span><b>{item.type}</b></div><div className="evidence-claim"><h3>{item.claim}</h3><p><b>Basis</b>{item.basis}</p></div><div className="evidence-boundary"><p><b>Evidence boundary</b>{item.boundary}</p>{item.source&&<a href={item.source.url} target="_blank" rel="noreferrer">{item.source.label} ↗</a>}</div></article>)}</div>
      <div className="evidence-close"><div><p className="overline">Discovery correction protocol</p><h3>Correct the record before expanding the work.</h3></div><ol><li>Identify the statement, missing context, or category error.</li><li>Mark whether it should be corrected, restricted, removed, or left unresolved.</li><li>Name who may validate the replacement and what evidence may be retained.</li><li>Propagate the correction through the proposal, prototype, charter, and any approved public excerpt.</li></ol></div>
      <div className="decision-box"><div><p className="overline">What this room asks</p><h3>Not “Did RN research enough?” but “Is the proposition accurately bounded enough to begin listening?”</h3></div><p>A successful review may produce a correction, a referral to someone with standing, a narrower question, a discovery invitation, or a decision to stop. Each is a useful result.</p></div>
    </section>}

    <footer><div><span className="knot">◈</span><b>The Sovereign Stack</b><small>Version 1.0 · 6 August 2026</small></div><p>Independent working concept prepared by Rayven-Nikkita (RN) Collins for discussion with Purple Maiʻa. Not a Purple Maiʻa product, policy, endorsement, approved protocol, or community-authorized framework. <button onClick={()=>setPrivacyOpen(true)}>Status, privacy &amp; erase drafts</button></p></footer>
  </main>;
}
