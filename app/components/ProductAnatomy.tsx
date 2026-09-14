const modules = [
  ["Use definition", "What exact activity is proposed, for whose stated purpose, affecting whom, using which systems?", "A bounded-use record", "The people or bodies recognized for this decision determine whether the purpose is acceptable."],
  ["Standing map", "Who may convene, advise, decide, challenge, withdraw, or stop?", "Role, body, scope, source, and expiry of standing", "Standing must be established through the decision process recognized for this use."],
  ["Knowledge boundary", "What may be public, internal, restricted, local-only, ephemeral, metadata-only, or never recorded?", "Classification and handling rules", "Accountability can preserve a boundary without forcing disclosure."],
  ["Decision Gate", "Should the use proceed, pause, redesign, defer, or stop before implementation?", "A rationale, unresolved conditions, and a route forward or out", "Consent and approval remain separate authority events."],
  ["Authority Record", "What was decided, by whom, against which evidence, under what conditions, and until when?", "A versioned decision linked to evidence and dissent", "A typed name cannot establish identity, standing, or a recognized decision process."],
  ["Implementation binding", "Which model, sources, workflow, users, vendors, locations, and version does the decision cover?", "A machine-readable authorization scope", "Conformance with the governing decision depends on the implementation remaining within that scope."],
  ["Change review", "Which changes are material, who is notified, and may operation continue during review?", "A comparison, trigger, interim state, and routed decision", "The applicable decision-makers establish material-change criteria; a future system could apply the recorded rule and route exceptions for review."],
  ["Challenge and incident", "How can concerns, harms, drift, and failures be raised without rewriting history or exposing restricted or non-recordable content?", "Linked challenge, containment, notice, review, and remedy records", "Safety, confidentiality, and non-retaliation also depend on institutional practice."],
  ["Withdrawal and repair", "What stops, who is notified, what is repaired, and which obligations survive withdrawal?", "A withdrawal event and accountable repair plan", "Legal, archival, and remedial duties may survive withdrawal."],
  ["Migration and retirement", "How are dependencies exited, records transferred or deleted, and maintenance ended?", "An authorized closeout record", "Ownership, memory, and community obligations require their own closeout decisions."],
  ["Audit and export", "What may be inspected, by whom, in what form, and with which redactions and provenance?", "Approved human- and machine-readable artifacts", "Export rights and publication rights remain separately governed."],
] as const;

const objects = [
  ["Authorized use", "The central governed object: one defined activity, purpose, audience, system boundary, and period."],
  ["Authority", "Decision-making power recognized for a defined matter through the applicable process; the record documents that recognition but does not create it."],
  ["Decision", "Proceed, condition, revise, defer, refuse, withdraw, renew, migrate, or retire—bound to a version."],
  ["Evidence", "Public record, validated record, technical observation, interpretation, proposal, dissent, or unresolved question."],
  ["Condition", "A requirement that limits operation and may trigger review, pause, or withdrawal when unmet."],
  ["Boundary", "A rule governing collection, transformation, storage, access, disclosure, reuse, or non-digitization."],
  ["Implementation", "The exact models, data sources, workflows, users, vendors, locations, and versions in operation."],
  ["Lifecycle event", "A change, challenge, incident, review, withdrawal, migration, renewal, or retirement action."],
] as const;

export default function ProductAnatomy() {
  return <section className="product-anatomy" aria-labelledby="product-title">
    <div className="section-intro compact">
      <p className="overline">Product requirements · one connected operating model</p>
      <h2 id="product-title">One authorized use is the unit of governance.</h2>
      <p>The proposed product follows one specific activity from purpose and standing through implementation and exit. Each <strong>authorized use</strong> connects the relevant knowledge or data, recognized decision process, exact implementation, conditions, review, challenge, withdrawal, migration, and closeout.</p>
    </div>

    <div className="product-thesis"><div><span>Risk addressed</span><p>A use can quietly outgrow the decision that authorized it as code, models, people, vendors, and purposes change.</p></div><div><span>Proposed value</span><p>Keep each decision traceable to its standing, evidence, scope, implementation version, conditions, expiry, challenges, and next authorized action.</p></div><div><span>Human authority</span><p>The people or bodies recognized for the matter determine who decides, what knowledge means, whether the process is acceptable, what repair requires, and whether the system should exist.</p></div></div>

    <div className="object-model">
      <div className="object-model-head"><p className="overline">Core record model</p><h3>Eight objects make the lifecycle legible.</h3></div>
      {objects.map(([name, definition], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{name}</h4><p>{definition}</p></div></article>)}
    </div>

    <div className="module-header"><p className="overline">Eleven requirements for a connected product</p><h3>Every module has a job, an output, and a boundary.</h3><p>A future product would connect these records. Implementation binding would make a decision testable under change; challenge and exit would keep stopping power operational throughout the lifecycle.</p></div>
    <div className="module-register">
      {modules.map(([name, question, output, limit], index) => <article key={name}><div className="module-name"><span>{String(index + 1).padStart(2, "0")}</span><h3>{name}</h3></div><div><b>Question</b><p>{question}</p></div><div><b>Produces</b><p>{output}</p></div><div><b>Boundary</b><p>{limit}</p></div></article>)}
    </div>

    <div className="decision-grammar">
      <div><p className="overline">Decision grammar</p><h3>A usable authorization is fully scoped.</h3></div>
      <p>A usable decision must preserve: <strong>who decided → under what standing → for which use and implementation version → against what evidence → within which boundaries → under what conditions → with what dissent → until when → triggered for review by what event → reversible through which path.</strong></p>
    </div>
  </section>;
}
