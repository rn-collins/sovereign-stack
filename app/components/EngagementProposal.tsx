const phases = [
  {
    phase: "Pressure test",
    timing: "20–25 minutes",
    purpose: "Determine whether the proposed problem is relevant, redundant, misframed, or better directed to another role or body.",
    work: ["Correct the public-evidence interpretation", "Identify existing work that must not be duplicated", "Name who is closer to the question", "Choose stop, revise, refer, or consider discovery"],
    result: "A documented direction: relevant, redundant, misframed, refer, or stop.",
  },
  {
    phase: "Bounded discovery",
    timing: "Separately scoped and compensated",
    purpose: "Define one real operational constraint and determine whether any product work is warranted.",
    work: ["Sponsor interview and approved-source review", "Authority, standing, and participation map", "Knowledge and documentation boundaries", "Trace one fictional or approved non-sensitive use", "Existing-process and duplication inventory", "Stop, revise, build, or non-product recommendation"],
    result: "An editable constraint brief, boundary register, authority map, scenario trace, and decision memorandum.",
  },
  {
    phase: "Co-designed prototype",
    timing: "Only if discovery invites it",
    purpose: "Adapt the record model, terminology, role boundaries, and lifecycle logic to an approved use without activating production infrastructure.",
    work: ["Translate approved governance requirements into product rules", "Build and test a connected decision graph", "Simulate changes, challenges, withdrawal, migration, and exit", "Test burden, comprehension, and missing authority", "Produce a production-governance specification—or recommend stopping"],
    result: "A testable prototype, revised data model, evidence register, findings, and explicit production stop/go decision.",
  },
  {
    phase: "Bounded pilot",
    timing: "Only through a separate charter",
    purpose: "Test the approved mechanism on one authorized use with named participants, controls, review points, and closeout obligations.",
    work: ["Implement only the chartered scope", "Train designated users and reviewers", "Test access, change, challenge, incident, and exit paths", "Measure operational burden and decision quality", "Transfer, delete, maintain, migrate, or retire as authorized"],
    result: "Evidence supporting adoption, revision, another intervention, or retirement, followed by a separate production decision.",
  },
] as const;

export default function EngagementProposal() {
  return <section className="engagement-proposal" aria-labelledby="engagement-title">
    <div className="section-intro compact">
      <p className="overline">Engagement proposal · decisions before scope expansion</p>
      <h2 id="engagement-title">Begin with one short pressure test. Earn every later phase.</h2>
      <p>Each phase produces a decision-quality output and ends at its own gate. Useful outcomes include confirming relevance, locating existing work, reframing the problem, referring it to the right reviewer, or stopping.</p>
    </div>

    <div className="engagement-ask"><div><span>Immediate request</span><h3>A 20–25-minute conversation with Donavan—or a referral to the appropriate reviewer.</h3></div><p>Pressure-test whether durable authority is a real operational seam around Purple Maiʻa’s publicly described Sovereign Stack. The goal is a fit signal and the right review path; implementation, protected information, and any real use remain outside this conversation.</p></div>

    <div className="phase-register">{phases.map((phase, index) => <article key={phase.phase}><div className="phase-number"><span>{String(index).padStart(2, "0")}</span><b>{phase.timing}</b></div><div className="phase-summary"><h3>{phase.phase}</h3><p>{phase.purpose}</p></div><div className="phase-work"><b>Work inside this phase</b><ul>{phase.work.map(item => <li key={item}>{item}</li>)}</ul></div><div className="phase-result"><b>Decision-quality output</b><p>{phase.result}</p></div></article>)}</div>

    <div className="responsibility-matrix">
      <article><span>Purple Maiʻa and designated authorities</span><h3>Define, correct, decide, restrict, refuse.</h3><ul><li>Name the organizational question and legitimate participants</li><li>Determine standing, terminology, knowledge boundaries, access, and publication</li><li>Validate, reject, condition, withdraw, or stop the work</li></ul></article>
      <article><span>RN</span><h3>Listen, translate, map, prototype, test, document, transfer.</h3><ul><li>Turn approved requirements into inspectable workflows and artifacts</li><li>Preserve evidence status, uncertainty, dissent, and implementation detail</li><li>Work within authority, legal, and cultural determinations supplied through the approved process</li></ul></article>
      <article><span>Technical and program participants</span><h3>Explain, test, operate, challenge, maintain.</h3><ul><li>Describe real architecture, dependencies, work practices, and burdens</li><li>Test whether proposed controls work under change and conflict</li><li>Accept only responsibilities that are expressly assigned</li></ul></article>
    </div>

    <div className="engagement-boundaries">
      <div><p className="overline">Defined before paid work begins</p><h3>The agreement governs the engagement; the interface does not.</h3></div>
      <ul><li>Scope, deliverables, schedule, compensation, and decision gates</li><li>Participants, standing, access, confidentiality, and recording boundaries</li><li>Ownership, custody, Apache-2.0 prototype licensing, project-specific work, and portfolio use</li><li>Retention, deletion, transfer, maintenance, migration, and closeout</li><li>Pause, refusal, withdrawal, incident, and termination procedures</li></ul>
    </div>

    <div className="engagement-outcomes"><p className="overline">How the work is evaluated</p><div><article><span>Relevant</span><p>A defined constraint, legitimate participants, and a bounded next decision exist.</p></article><article><span>Redundant</span><p>Existing Purple Maiʻa work already addresses the proposed function; RN documents no contrary claim.</p></article><article><span>Revise or refer</span><p>The question belongs at another layer or with another person or body.</p></article><article><span>Stop</span><p>The work is unnecessary, burdensome, unsafe, unauthorized, or not useful now.</p></article></div></div>
  </section>;
}
