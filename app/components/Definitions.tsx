const definitions = [
  ["Authority", "Documented decision-making power held by an identified role or body for a particular scope. Ownership, expertise, employment, participation, and account access do not establish it."],
  ["Standing", "The basis on which a person or body may define, advise, decide, challenge, validate, withdraw, or stop within a specific matter."],
  ["Governance", "The relationships, processes, rules, and remedies through which legitimate decisions are made, applied, contested, revised, and ended."],
  ["Authorized use", "One defined activity, purpose, audience, knowledge and data boundary, implementation version, period, and set of conditions considered through a valid decision process."],
  ["Consent", "Permission valid for the relevant people, subject matter, scope, information, and conditions, with a meaningful ability to refuse or withdraw. A checkbox alone cannot establish it."],
  ["Approval", "A decision that a stated proposal may proceed within a stated scope. A new version or use requires its own authority comparison."],
  ["Authorization", "The operational permission produced by a valid decision and bound to a specific use, implementation, conditions, duration, and authority scope."],
  ["Validation", "Confirmation by someone with appropriate standing that a record, interpretation, boundary, or process is acceptable for its stated purpose and scope."],
  ["Stewardship", "An assigned responsibility to care for a process, record, system, or resource within defined limits. Stewardship does not necessarily confer ownership or authority."],
  ["Custody", "Practical possession or control of records, infrastructure, or data, including storage, maintenance, transfer, and deletion obligations. Custody does not settle ownership or legitimate use."],
  ["Ownership", "A legal, contractual, organizational, collective, or other recognized interest that must be identified by subject: hardware, software, intellectual property, data, records, or other material."],
  ["Access", "The technical or procedural ability to view or act. Reuse, disclosure, interpretation, authorization, and representation require separately documented permission."],
  ["Knowledge boundary", "A rule identifying what may be spoken, observed, collected, recorded, transformed, stored, attributed, disclosed, reused, or kept outside digital systems."],
  ["Material change", "A change significant enough under an authority-approved rule to require notice, comparison, review, pause, or a new decision."],
  ["Challenge", "A separately preserved concern, objection, claim of harm, or request for review that does not silently alter the original record."],
  ["Withdrawal", "A decision that previously granted permission no longer supports continued operation, subject to defined notice, repair, retention, deletion, and closeout obligations."],
  ["Migration", "An authorized transfer of systems, records, responsibilities, or dependencies that preserves boundaries and decision history rather than treating movement as a purely technical task."],
  ["Retirement", "The governed end of a use or system, including shutdown, access removal, dependency exit, records treatment, unresolved obligations, and future-use restrictions."],
] as const;

export default function Definitions() {
  return <section className="definitions" aria-labelledby="definitions-title">
    <div className="section-intro compact">
      <p className="overline">Working definitions · precise language for review</p>
      <h2 id="definitions-title">Distinct powers require distinct records.</h2>
      <p>These working definitions specify how terms operate inside RN’s product requirements and high-fidelity simulation. Purple Maiʻa and the relevant authorities would define or revise the language for any real use; nothing here presents a Purple Maiʻa definition, legal conclusion, or translation of a Hawaiian concept.</p>
    </div>
    <div className="definition-register">{definitions.map(([term, definition], index) => <article key={term}><span>{String(index + 1).padStart(2, "0")}</span><h3>{term}</h3><p>{definition}</p></article>)}</div>
    <div className="definition-warning"><b>What precision protects</b><p>An operator can receive access while decision authority stays elsewhere. A steward can hold custody while ownership stays with another party. Organizational approval and community consent can remain separate requirements. By preserving each relationship explicitly, a future product can keep one valid decision from becoming an unlimited “approved” state.</p></div>
  </section>;
}
