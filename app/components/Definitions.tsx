const definitions = [
  ["Authority", "Documented decision-making power held by an identified role or body for a particular scope. Authority is not inferred from ownership, expertise, employment, participation, or account access."],
  ["Standing", "The basis on which a person or body may define, advise, decide, challenge, validate, withdraw, or stop within a specific matter."],
  ["Governance", "The relationships, processes, rules, and remedies through which legitimate decisions are made, applied, contested, revised, and ended."],
  ["Authorized use", "One defined activity, purpose, audience, knowledge and data boundary, implementation version, period, and set of conditions considered through a valid decision process."],
  ["Consent", "A permission whose validity depends on the relevant people, subject matter, scope, information, conditions, and ability to refuse or withdraw. This prototype does not reduce consent to a checkbox."],
  ["Approval", "A decision that a stated proposal may proceed within a stated scope. Approval is narrower than unlimited permission and does not travel automatically to a new version or use."],
  ["Authorization", "The operational permission produced by a valid decision and bound to a specific use, implementation, conditions, duration, and authority scope."],
  ["Validation", "Confirmation by someone with appropriate standing that a record, interpretation, boundary, or process is acceptable for its stated purpose. Validation is not universal endorsement."],
  ["Stewardship", "An assigned responsibility to care for a process, record, system, or resource within defined limits. Stewardship does not necessarily confer ownership or authority."],
  ["Custody", "Practical possession or control of records, infrastructure, or data, including storage, maintenance, transfer, and deletion obligations. Custody does not settle ownership or legitimate use."],
  ["Ownership", "A legal, contractual, organizational, collective, or other recognized interest that must be identified by subject: hardware, software, intellectual property, data, records, or other material."],
  ["Access", "The technical or procedural ability to view or act. Access is not permission to reuse, disclose, interpret, authorize, or represent."],
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
      <p className="overline">Operational definitions · proposed language for correction</p>
      <h2 id="definitions-title">Precision begins by refusing to collapse different kinds of power.</h2>
      <p>These definitions describe how terms operate inside RN’s prototype. They are not Purple Maiʻa definitions, legal conclusions, translations of Hawaiian concepts, or substitutes for language established by the relevant authorities. Discovery may revise, replace, restrict, or remove them.</p>
    </div>
    <div className="definition-register">{definitions.map(([term, definition], index) => <article key={term}><span>{String(index + 1).padStart(2, "0")}</span><h3>{term}</h3><p>{definition}</p></article>)}</div>
    <div className="definition-warning"><b>Why the distinctions matter</b><p>A system operator may have access without authority. A steward may have custody without ownership. An organizational approval may not supply community consent. A valid decision for one use may not authorize reuse. The product must keep these differences operational instead of flattening them into a single “approved” state.</p></div>
  </section>;
}
