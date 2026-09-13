const modules = [
  ["Use definition", "What exact activity is proposed, for whose stated purpose, affecting whom, using which systems?", "A bounded-use record", "It cannot decide whether the stated purpose is legitimate."],
  ["Standing map", "Who may convene, advise, decide, challenge, withdraw, or stop?", "Role, body, scope, source, and expiry of standing", "It cannot nominate cultural or community authority."],
  ["Knowledge boundary", "What may be public, internal, restricted, local-only, ephemeral, metadata-only, or never recorded?", "Classification and handling rules", "It cannot require disclosure to prove accountability."],
  ["Decision Gate", "Should the use proceed, pause, redesign, defer, or stop before implementation?", "A rationale, unresolved conditions, and a route forward or out", "A completed gate is not consent or approval."],
  ["Authority Record", "What was decided, by whom, against which evidence, under what conditions, and until when?", "A versioned decision linked to evidence and dissent", "A typed name is not a verified signature or valid process."],
  ["Implementation binding", "Which model, sources, workflow, users, vendors, locations, and version does the decision cover?", "A machine-readable authorization scope", "It cannot make an unauthorized implementation compliant."],
  ["Change review", "Which changes are material, who is notified, and may operation continue during review?", "A comparison, trigger, interim state, and routed decision", "Automation cannot define materiality on behalf of authorities."],
  ["Challenge and incident", "How can concerns, harms, drift, and failures be raised without rewriting history or exposing protected content?", "Linked challenge, containment, notice, review, and remedy records", "It cannot guarantee safety, confidentiality, or non-retaliation by interface design alone."],
  ["Withdrawal and repair", "What stops, who is notified, what is repaired, and which obligations survive withdrawal?", "A withdrawal event and accountable repair plan", "Withdrawal does not automatically erase every legal, archival, or remedial obligation."],
  ["Migration and retirement", "How are dependencies exited, records transferred or deleted, and maintenance ended?", "An authorized closeout record", "Technical deletion cannot settle ownership, memory, or community obligations by itself."],
  ["Audit and export", "What may be inspected, by whom, in what form, and with which redactions and provenance?", "Approved human- and machine-readable artifacts", "An internal record does not become public because someone can export it."],
] as const;

const objects = [
  ["Authorized use", "The central governed object: one defined activity, purpose, audience, system boundary, and period."],
  ["Authority", "Documented decision-making power held by an identified role or body for a specific scope."],
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
      <p className="overline">Product anatomy · one connected operating model</p>
      <h2 id="product-title">The product governs a use—not technology in the abstract.</h2>
      <p>An <strong>authorized use</strong> is one specific activity, for a defined purpose, involving identified knowledge or data, considered through a valid process, bound to an exact implementation, and kept subject to conditions, review, challenge, withdrawal, migration, and exit.</p>
    </div>

    <div className="product-thesis"><div><span>Without the layer</span><p>Purpose, conditions, dissent, and stopping power can become separated from the code, model, people, and vendors that change over time.</p></div><div><span>Proposed function</span><p>Make each decision traceable to its standing, evidence, scope, implementation version, conditions, expiry, challenges, and next authorized action.</p></div><div><span>What remains human</span><p>Who holds authority, what knowledge means, whether deliberation is valid, what repair requires, and whether the system should exist.</p></div></div>

    <div className="object-model">
      <div className="object-model-head"><p className="overline">Core record model</p><h3>Eight objects make the lifecycle legible.</h3></div>
      {objects.map(([name, definition], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{name}</h4><p>{definition}</p></div></article>)}
    </div>

    <div className="module-header"><p className="overline">Eleven connected modules</p><h3>Every module has a job, an output, and a limit.</h3><p>The layer is complete only when the records connect. A decision without an implementation version cannot govern change. A review without challenge and exit cannot preserve stopping power.</p></div>
    <div className="module-register">
      {modules.map(([name, question, output, limit], index) => <article key={name}><div className="module-name"><span>{String(index + 1).padStart(2, "0")}</span><h3>{name}</h3></div><div><b>Question</b><p>{question}</p></div><div><b>Produces</b><p>{output}</p></div><div><b>Cannot do</b><p>{limit}</p></div></article>)}
    </div>

    <div className="decision-grammar">
      <div><p className="overline">Decision grammar</p><h3>“Approved” is never enough.</h3></div>
      <p>A usable decision must preserve: <strong>who decided → under what standing → for which use and implementation version → against what evidence → within which boundaries → under what conditions → with what dissent → until when → triggered for review by what event → reversible through which path.</strong></p>
    </div>
  </section>;
}
