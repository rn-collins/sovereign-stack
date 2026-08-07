"use client";

import { useMemo, useRef, useState } from "react";

type View = "overview" | "proposal" | "gate" | "record" | "pilot" | "learning";

const nav: { id: View; label: string; eyebrow: string }[] = [
  { id: "overview", label: "Why this layer", eyebrow: "01" },
  { id: "proposal", label: "The proposal", eyebrow: "02" },
  { id: "gate", label: "Decision gate", eyebrow: "03" },
  { id: "record", label: "System record", eyebrow: "04" },
  { id: "pilot", label: "Pilot path", eyebrow: "05" },
  { id: "learning", label: "Learning layer", eyebrow: "06" },
];

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

function Mark({ children }: { children: React.ReactNode }) { return <span className="mark">{children}</span>; }

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    if (answers.length < questions.length) return null;
    const stop = answers.some((a) => /externally|No legitimate|not justified|cross a boundary|unacceptable exposure|no accountable owner/.test(a));
    const pause = answers.some((a) => /confirmation|unclear|may be better|deliberation|partly known|partial|outside|incomplete/.test(a));
    if (stop) return { label: "Do not proceed", note: "A foundational condition is absent or a prohibited exposure is present. Stop the proposed activity, preserve no new data, and return the question to the relevant authority." };
    if (pause) return { label: "Pause and redesign", note: "The proposal may have value, but it is not ready. Name an owner and resolution path for every open authority, boundary, custody, control, or repair question." };
    return { label: "Eligible for authority review", note: "The proposal may move to the designated authority for deliberation. Passing this gate is not consent, approval, or proof that the project should be built." };
  }, [answers]);

  function choose(answer: string) {
    const next = [...answers]; next[step] = answer; setAnswers(next.slice(0, step + 1));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    }
  }
  function selectView(id: View) {
    setView(id);
    window.setTimeout(() => document.getElementById(`${id}-content`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function returnToBeginning() {
    setView("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <main>
    <header className="topbar">
      <button className="wordmark" onClick={returnToBeginning} aria-label="Return to beginning"><span className="knot" aria-hidden="true">◈</span><span>The Sovereign Stack</span></button>
      <div className="ownership"><span />Working proposal · prepared for Purple Maiʻa</div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <p className="overline">A proposed governance &amp; learning layer</p>
        <h1>Infrastructure can be local.<br/><em>Authority must travel through it.</em></h1>
        <p className="lede">A Purple Maiʻa-owned way to carry community purpose, authority, knowledge boundaries, accountability, and the right to refuse through the life of an AI system.</p>
        <div className="hero-actions"><button className="primary light" onClick={() => selectView("proposal")}>See the proposal <span>→</span></button><button className="text-link" onClick={() => selectView("gate")}>Try the decision gate</button></div>
      </div>
      <div className="hero-orbit" aria-label="Illustration of governance surrounding a technical system"><div className="orbit orbit-a"><span>Purpose</span><span>Authority</span></div><div className="orbit orbit-b"><span>Knowledge</span><span>Control</span></div><div className="orbit-core">Use case<br/><small>under review</small></div></div>
    </section>

    <div className="scope-strip"><b>This is a proposal, not Purple Maiʻa policy.</b><span>Purple Maiʻa and the relevant community and cultural authorities would define the substance. This prototype demonstrates a possible structure for their review.</span></div>

    <nav className="section-nav" aria-label="Proposal sections">{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)}><span>{item.eyebrow}</span>{item.label}</button>)}</nav>

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
      <div className="gate-shell"><aside>{questions.map((q,i)=><button key={q.title} className={`${i===step?"current":""} ${answers[i]?"done":""}`} onClick={()=>setStep(i)}><span>{answers[i]?"✓":i+1}</span>{q.title}</button>)}</aside><div className="question-panel">
        <p className="counter">Question {step+1} of {questions.length}</p><h3>{questions[step].title}</h3><p>{questions[step].prompt}</p>
        <div className="options">{questions[step].options.map(option=><button key={option} className={answers[step]===option?"selected":""} onClick={()=>choose(option)}><span/>{option}</button>)}</div>
        {result && step===questions.length-1 && <div ref={resultRef} className="result" role="status" aria-live="polite"><p>Demonstration result</p><h4>{result.label}</h4><span>{result.note}</span><button onClick={()=>{setAnswers([]);setStep(0)}}>Clear demonstration</button></div>}
        <div className="gate-footer"><button disabled={step===0} onClick={()=>setStep(step-1)}>← Previous</button><span>Decision belongs to the designated authority</span><button disabled={step===questions.length-1} onClick={()=>setStep(step+1)}>Next →</button></div>
      </div></div>
      <div className="gate-after"><b>A production version would add:</b><span>Named roles and standing · evidence and rationale · approval conditions · dissent and unresolved questions · risk and benefit owners · review triggers and expiry · access controls · change history · challenge, incident, withdrawal, and repair paths.</span></div>
    </section>}

    {view === "record" && <section id="record-content" className="content record" tabIndex={-1}>
      <div className="section-intro compact"><p className="overline">Living system record · proposed container</p><h2>KILO example</h2><p>This example demonstrates what a legible governance record could hold without exposing protected knowledge or security details. It is not a factual description of KILO’s current governance and does not imply Purple Maiʻa has selected KILO as a pilot.</p></div>
      <div className="status-row"><span className="status">Unvalidated demonstration</span><span>Authority: not established · Review date: not established · Record owner: not established</span></div>
      <div className="record-grid">
        <article className="wide"><p className="label">Provisional community purpose</p><h3>Support place-based environmental observation and stewardship decisions while keeping sensitive information within appropriate local control.</h3><p>Source boundary: inferred from Purple Maiʻa’s public descriptions; requires correction or replacement.</p></article>
        <article><p className="label">Authority &amp; standing</p><h3>To be defined by Purple Maiʻa and participating communities</h3><p className="flag">Blocking condition</p></article>
        <article><p className="label">System &amp; data boundary</p><h3>To be mapped with the technical and community teams</h3><p>Collection, ephemeral data, storage, inference, interpretation, sharing, deletion, and prohibited flows must be distinguished.</p></article>
        <article><p className="label">Potentially allowed—only if authorized</p><ul><li>Defined environmental observation</li><li>Local processing for an approved purpose</li><li>Human interpretation within the appropriate context</li><li>Stewardship support subject to stated limits</li></ul></article>
        <article><p className="label">Prohibited unless specifically authorized</p><ul><li>External model training or vendor retention</li><li>Commercial reuse or secondary research</li><li>Publication of sensitive places or knowledge</li><li>Automated replacement of accountable judgment</li></ul></article>
        <article><p className="label">Durable control test</p><div className="checks"><span>Inspect data route <b>Define</b></span><span>Pause system <b>Define</b></span><span>Withdraw / restrict <b>Define</b></span><span>Contest output <b>Define</b></span><span>Export / migrate <b>Test</b></span><span>Delete / retire <b>Test</b></span></div></article>
        <article><p className="label">Accountability &amp; change</p><ol><li>Who owns an incident and repair?</li><li>Which changes require renewed authority?</li><li>How are dissent and contradictions retained?</li><li>When does permission expire?</li><li>What happens when a partner or vendor changes?</li></ol></article>
      </div>
      <div className="record-note"><b>Evidence rule:</b> each field would be tagged as community-defined rule, approved fact, interpretation, technical observation, proposal, or unresolved question. The record should never manufacture certainty—or reveal protected content—in order to appear complete.</div>
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

    <footer><div><span className="knot">◈</span><b>The Sovereign Stack</b></div><p>A working proposal prepared by Rayven-Nikkita (RN) Collins for conversation with Purple Maiʻa. Nothing here represents Purple Maiʻa policy, community consent, an approved protocol, or a factual account beyond the specifically linked public sources.</p></footer>
  </main>;
}
