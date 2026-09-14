const definitions = [
  ["Authority", "Decision-making power recognized for a defined matter through the applicable organizational, community, legal, or cultural process. A record can document that recognition; it does not create it. Ownership, expertise, employment, participation, and system access are not treated here as sufficient on their own."],
  ["Standing", "For this proposal, the recorded basis on which a person or body is recognized within the applicable process as able to convene, advise, decide, challenge, validate, withdraw, or stop. The term does not assert constitutional or judicial standing and does not create cultural authority."],
  ["Governance", "The relationships, processes, rules, and remedies through which recognized decisions are made, applied, contested, revised, and ended."],
  ["Authorized use", "One defined activity authorized through the applicable decision process for a stated purpose, audience, implementation, period, boundaries, and conditions."],
  ["Consent", "A context-specific agreement by the person, people, or body whose consent is required for the matter. This proposal does not determine whose consent is required or whether it is legally, culturally, or procedurally sufficient. A checkbox records an action; this interface cannot determine whether that action constitutes informed, voluntary, and properly scoped consent."],
  ["Approval", "A decision that a stated proposal may proceed within a stated scope. A new version or use requires its own authority comparison."],
  ["Authorization", "The recorded operational scope derived from an applicable decision and bound to a specific use, implementation, conditions, duration, and authority scope. The record expresses that decision for implementation; it is not the source of authority."],
  ["Validation", "A scoped confirmation, by a person or body recognized to review that matter, that a particular record, interpretation, boundary, or process meets stated criteria for its stated use."],
  ["Stewardship", "An assigned responsibility to care for a process, record, system, or resource within defined limits. Stewardship does not necessarily confer ownership or authority."],
  ["Custody", "Practical possession or control of records, infrastructure, or data, including storage, maintenance, transfer, and deletion obligations. Custody does not itself establish ownership, authority, or permission for a particular use."],
  ["Ownership", "A legal, contractual, organizational, collective, or other recognized interest that must be identified by subject: hardware, software, intellectual property, data, records, or other material. This proposal does not assume every relationship to knowledge, data, land, or records is best described as ownership."],
  ["Access", "The technical or procedural ability to view or act. Access does not itself establish a basis for reuse, disclosure, interpretation, authorization, or representation; each requires its own applicable basis and scope."],
  ["Knowledge boundary", "A rule identifying what may be spoken, observed, collected, recorded, transformed, stored, attributed, disclosed, reused, or kept outside digital systems."],
  ["Material change", "A change significant enough under criteria established through the applicable decision process to require notice, comparison, review, pause, or a new decision."],
  ["Challenge", "A separately preserved concern, objection, claim of harm, or request for review that does not silently alter the original record."],
  ["Withdrawal", "A record that permission has been narrowed or ended. The resulting notice, repair, retention, deletion, and closeout duties are determined separately under the applicable process and law."],
  ["Migration", "An authorized transfer of systems, records, responsibilities, or dependencies that preserves boundaries and decision history rather than treating movement as a purely technical task."],
  ["Retirement", "The governed end of a use or system, including shutdown, access removal, dependency exit, records treatment, unresolved obligations, and future-use restrictions."],
] as const;

export default function Definitions() {
  return <section className="definitions" aria-labelledby="definitions-title">
    <div className="section-intro compact">
      <p className="overline">Working definitions · precise language for review</p>
      <h2 id="definitions-title">Distinct powers require distinct records.</h2>
      <p>These working definitions explain how terms operate inside this product specification and interactive demonstration. For any real use, Purple Maiʻa and the people or bodies it identifies as holding authority for the matter would define or revise the language. Nothing here presents a Purple Maiʻa definition, legal conclusion, or translation of a Hawaiian concept.</p>
    </div>
    <div className="definition-register">{definitions.map(([term, definition], index) => <article key={term}><span>{String(index + 1).padStart(2, "0")}</span><h3>{term}</h3><p>{definition}</p></article>)}</div>
    <div className="definition-warning"><b>What precision protects</b><p>An operator can receive access while decision authority stays elsewhere. A steward can hold custody while ownership stays with another party. Organizational approval and consent from affected people or recognized community bodies may be distinct requirements, depending on the matter and applicable process. By preserving each relationship explicitly, a future product can keep one bounded decision from becoming an unlimited “approved” state.</p></div>
  </section>;
}
