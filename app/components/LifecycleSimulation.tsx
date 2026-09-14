"use client";

import { useMemo, useState } from "react";

type SimulationRole = "Proposer" | "Technical contributor" | "Steward" | "Authority reviewer" | "Challenger" | "Observer";
type LifecycleEvent = "model" | "data" | "purpose" | "users" | "withdrawal" | "none";

const stages = [
  {
    name: "Define the use",
    question: "What exact activity is being proposed—and for whose stated purpose?",
    record: "A staff-facing assistant drafts short responses from an enumerated set of already-published public webpages. A person reviews every draft before use.",
    boundary: "This is a fictional test case with no connection to KILO, a Purple Maiʻa project, or a real community decision.",
    status: "Provisional description",
  },
  {
    name: "Locate standing",
    question: "Which roles or bodies may convene, advise, decide, challenge, or stop this use?",
    record: "An organizational sponsor may convene discovery. Technical staff may describe the system. The person or body recognized to make the required decision remains unidentified in this fictional example.",
    boundary: "The decision process recognized for this use must identify standing; employment, expertise, participation, ownership, and account access do not establish it on their own.",
    status: "Authority unresolved",
  },
  {
    name: "Set boundaries",
    question: "What may enter the use, and what must remain restricted, local, ephemeral, or undigitized?",
    record: "Permitted: specifically approved public webpages. Excluded: student, family, employee, or participant information; sensor data; unpublished material; knowledge designated as restricted or non-recordable; automated publication; profiling; training; and secondary reuse.",
    boundary: "The classification remains a proposal until the person or body recognized for that decision confirms or revises it.",
    status: "Draft boundary",
  },
  {
    name: "Record a decision",
    question: "What was decided, by whom, for which version, and under what conditions?",
    record: "Illustrative result: eligible for a time-limited, non-sensitive technical prototype after standing is confirmed. No protected information, autonomous decisions, publication, or reuse.",
    boundary: "The simulation shows the proposed decision structure. Approval requires a recognized decision process and a verified decision-maker acting within documented authority.",
    status: "Demonstration only",
  },
  {
    name: "Bind implementation",
    question: "Which exact model, sources, workflow, users, dependencies, and expiry does the decision cover?",
    record: "Bound version: local-model 0.3; public-report set 1.0; staff reviewers only; human source-check required; no external retrieval; review after 30 days or any material change.",
    boundary: "Changing one bound element may place the implementation outside the original decision.",
    status: "Version bound",
  },
  {
    name: "Detect change",
    question: "Did the purpose, people, knowledge, data flow, model, vendor, or deployment change materially?",
    record: "Choose a change event below. The prototype compares the event with the scope and conditions of the illustrative decision.",
    boundary: "Production change detection depends on material-change criteria established through the applicable decision process and reliable technical evidence.",
    status: "Awaiting event",
  },
  {
    name: "Review or challenge",
    question: "Who may raise a concern, what happens while it is reviewed, and how is dissent preserved?",
    record: "A concern creates a linked event; it does not rewrite the original decision. The use may continue, narrow, pause, or stop according to the governing rule.",
    boundary: "Challenge access, confidentiality, anti-retaliation, notice, and remedy must be defined outside this demonstration.",
    status: "Review path available",
  },
  {
    name: "Exit or renew",
    question: "Does the use continue, change, migrate, withdraw, or retire—and what must happen to records and dependencies?",
    record: "The close records the authorized outcome, remaining obligations, export or deletion requirements, ownership and custody, and the next review date.",
    boundary: "Renewal, migration, deletion, and publication each remain subject to the documented decision process.",
    status: "Decision required",
  },
] as const;

const roles: Record<SimulationRole, { may: string; mayNot: string }> = {
  Proposer: { may: "Describe the proposed use, purpose, expected benefit, alternatives, and available evidence.", mayNot: "Authorize the use, designate who speaks for a community, or classify knowledge unilaterally." },
  "Technical contributor": { may: "Document models, data flows, vendors, versions, dependencies, controls, and material changes.", mayNot: "Treat technical ownership, system access, or implementation responsibility as decision-making authority." },
  Steward: { may: "Convene the approved process, maintain records, schedule review, and route questions to the right roles or bodies.", mayNot: "Expand purpose, erase dissent, substitute completion for consent, or approve beyond delegated scope." },
  "Authority reviewer": { may: "Approve, condition, defer, refuse, withdraw, or require review within documented standing and scope.", mayNot: "Speak for another authority, another project, another community, or an unexamined future use." },
  Challenger: { may: "Raise a concern, identify harm or drift, request review, and preserve a separate challenge record.", mayNot: "Silently alter the original record or expose protected information to demonstrate the concern." },
  Observer: { may: "Read separately approved excerpts and inspect the demonstration’s public logic.", mayNot: "Access internal records, infer hidden decisions, or treat visibility as participation or authority." },
};

const events: { id: LifecycleEvent; label: string; detail: string; result: string; action: string; tone: "continue" | "review" | "stop" }[] = [
  { id: "model", label: "Model version changes", detail: "The local model moves from 0.3 to 0.4 while the purpose, users, and sources remain the same.", result: "The implementation no longer matches the version named in the illustrative decision.", action: "Pause the changed version, compare behavior and dependencies, and route a scoped re-review to the designated reviewer.", tone: "review" },
  { id: "data", label: "Data leaves the approved environment", detail: "A new feature sends source text to an external commercial service.", result: "The data flow crosses an explicit boundary and introduces an unreviewed processor and jurisdiction.", action: "Block the feature. Do not transmit data. Reopen custody, hosting, retention, and vendor decisions before any new test.", tone: "stop" },
  { id: "purpose", label: "Purpose expands", detail: "A retrieval aid is repurposed to rank program decisions or people.", result: "The new purpose is outside the authorized use and changes the likely burden, evidence, and affected parties.", action: "Treat this as a new proposed use. Return to purpose, alternatives, standing, boundaries, and a fresh decision gate.", tone: "stop" },
  { id: "users", label: "A new user group is added", detail: "An internal staff tool is proposed for outside partners.", result: "Audience, disclosure, training, access, and downstream-use risks have materially changed.", action: "Keep outside access off. Identify affected roles, publication boundaries, support obligations, and who may authorize expansion.", tone: "review" },
  { id: "withdrawal", label: "Authority is withdrawn", detail: "A designated authority directs that the use stop.", result: "The active decision no longer supports continued operation.", action: "Stop the use, preserve the withdrawal event, follow agreed notification and deletion rules, and document unresolved repair obligations.", tone: "stop" },
  { id: "none", label: "No material change", detail: "The bound implementation continues within the same purpose, sources, users, conditions, and review period.", result: "The illustrative decision still covers the use, subject to its conditions and expiry.", action: "Continue with human source-checking, preserve the activity record, and complete the scheduled 30-day review.", tone: "continue" },
];

function downloadScenario(stageIndex: number, role: SimulationRole, eventId: LifecycleEvent | "") {
  const selectedEvent = events.find(event => event.id === eventId);
  const payload = {
    artifactType: "authority-layer-lifecycle-simulation",
    artifactSchemaVersion: "1.0",
    prototypeVersion: "1.3.1",
    generatedAt: new Date().toISOString(),
    status: "Fictional lifecycle demonstration · non-authorizing",
    authorship: "Independent interactive proposal and product specification by Rayven-Nikkita (RN) Collins",
    relationshipBoundary: "I previously corresponded with Purple Maiʻa about the earlier proposal. Purple Maiʻa has not commissioned or endorsed this work.",
    scenario: "Public information drafting assistant",
    currentStage: stages[stageIndex].name,
    rolePreview: role,
    roleBoundary: roles[role],
    lifecycle: stages,
    selectedChangeEvent: selectedEvent || "No event selected",
    nonAuthorization: "Fictional demonstration output; not a Purple Maiʻa record, decision, policy, system description, or authorization. Identity and authority are not verified. Use only with fictional, non-sensitive information.",
    canonicalUrl: "https://sovereign-stack-psi.vercel.app/",
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "authority-layer-fictional-lifecycle-simulation.json";
  link.click();
  URL.revokeObjectURL(url);
}

export default function LifecycleSimulation() {
  const [stageIndex, setStageIndex] = useState(0);
  const [role, setRole] = useState<SimulationRole>("Proposer");
  const [eventId, setEventId] = useState<LifecycleEvent | "">("");
  const selectedEvent = useMemo(() => events.find(event => event.id === eventId), [eventId]);
  const stage = stages[stageIndex];

  return <section className="simulation" aria-labelledby="simulation-title">
    <div className="section-intro compact">
      <p className="overline">Interactive demonstration · fictional and non-sensitive</p>
      <h2 id="simulation-title">Watch one proposed use move from definition to decision—and, if authorized, through change and exit.</h2>
      <p>This demonstration makes the proposed lifecycle and product requirements inspectable. It is not a connected authority system. Each stage shows what a future product would preserve, which decision remains open, and where interface behavior must stop short of human authority.</p>
    </div>

    <div className="scenario-banner">
      <div><span>Fictional scenario</span><h3>Public information drafting assistant</h3><p>A staff-facing local tool drafts short responses from an enumerated set of already-published public webpages, with human review before every use. Its proposed scope excludes decision-making, protected material, ranking people, and automatic publication.</p></div>
      <div><span>Why this scenario</span><p>It is intentionally ordinary: concrete enough to test the proposed mechanism without using KILO, environmental observations, student information, community knowledge, or any real organizational implementation.</p></div>
    </div>

    <div className="simulation-progress" aria-label={`Lifecycle stage ${stageIndex + 1} of ${stages.length}`}>
      {stages.map((item, index) => <button key={item.name} onClick={() => setStageIndex(index)} aria-current={index === stageIndex ? "step" : undefined} className={index === stageIndex ? "active" : index < stageIndex ? "complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.name}</b></button>)}
    </div>

    <div className="simulation-stage" aria-live="polite">
      <aside>
        <p className="overline">Stage {stageIndex + 1} of {stages.length}</p>
        <strong>{stage.status}</strong>
        <span>The status reports this fictional step only. Authority, approval, and production readiness require separate evidence.</span>
      </aside>
      <article>
        <h3>{stage.name}</h3>
        <p className="simulation-question">{stage.question}</p>
        <div className="simulation-record"><span>Illustrative record</span><p>{stage.record}</p></div>
        <div className="simulation-boundary"><span>Decision boundary</span><p>{stage.boundary}</p></div>
      </article>
    </div>

    {stageIndex >= 5 && <div className="event-lab">
      <div className="event-head"><div><p className="overline">Change-event laboratory</p><h3>Change the implementation. See what happens to the decision.</h3></div><p>A connected product would compare reliable system evidence with material-change criteria established through the applicable decision process. This demonstration uses six predefined examples.</p></div>
      <fieldset className="event-options"><legend className="sr-only">Choose a lifecycle change event</legend>
        {events.map(event => <label key={event.id} className={eventId === event.id ? "selected" : ""}><input type="radio" name="lifecycle-event" checked={eventId === event.id} onChange={() => setEventId(event.id)} /><span aria-hidden="true">{eventId === event.id ? "●" : "○"}</span>{event.label}</label>)}
      </fieldset>
      {selectedEvent ? <div className={`event-result ${selectedEvent.tone}`} aria-live="polite"><div><span>Observed change</span><p>{selectedEvent.detail}</p></div><div><span>Authority comparison</span><p>{selectedEvent.result}</p></div><div><span>Required next action</span><p>{selectedEvent.action}</p></div></div> : <p className="event-empty">Choose an event to test whether the illustrative decision still covers the implementation.</p>}
    </div>}

    <div className="role-lab">
      <div><p className="overline">Role and permission preview</p><h3>Access and authority remain distinct.</h3><p>Select a role to inspect the permissions and limits a connected product would need to enforce.</p></div>
      <label><span>View as</span><select value={role} onChange={event => setRole(event.target.value as SimulationRole)}>{Object.keys(roles).map(item => <option key={item}>{item}</option>)}</select></label>
      <article><span>This role may</span><p>{roles[role].may}</p></article>
      <article><span>This role may not</span><p>{roles[role].mayNot}</p></article>
    </div>

    <div className="simulation-controls">
      <button disabled={stageIndex === 0} onClick={() => setStageIndex(index => Math.max(0, index - 1))}>← Previous stage</button>
      <button onClick={() => { setStageIndex(0); setRole("Proposer"); setEventId(""); }}>Reset simulation</button>
      {stageIndex < stages.length - 1 ? <button className="primary" onClick={() => setStageIndex(index => Math.min(stages.length - 1, index + 1))}>Next stage <span>→</span></button> : <button className="primary" onClick={() => downloadScenario(stageIndex, role, eventId)}>Download simulation snapshot <span>↓</span></button>}
    </div>
  </section>;
}
