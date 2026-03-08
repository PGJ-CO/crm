import { ContractData } from "@/types/contract";
import { Section, fmt, fmtDate, blank } from "./ContractHelpers";

interface Props {
  data: ContractData;
}

export default function ContractBody({ data }: Props) {
  const total = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const retainage = total * (data.retainagePercent / 100);
  const fullAddress = `${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}`;

  const paymentDesc: Record<string, string> = {
    progress:
      "Payment shall be made on a progress basis, with draws submitted by Contractor upon completion of defined milestones. Each draw request shall include documentation of completed work.",
    monthly: `Monthly progress applications due on the ${ordinal(data.billingDay)} of each month; payments due net ${data.netPaymentDays} days after receipt of a proper and undisputed application.`,
    thirds:
      "Payment shall be made in three (3) equal installments: one-third (1/3) upon commencement of work, one-third (1/3) at the midpoint of the project as mutually agreed, and the final one-third (1/3) upon substantial completion and Owner's acceptance of the work.",
    completion:
      "Payment shall be made in full upon substantial completion of all work described herein and Owner's acceptance of the completed project.",
  };

  const disputeDesc: Record<string, string> = {
    mediation:
      "The Parties shall first attempt to resolve any dispute through good-faith negotiation. If unresolved within fifteen (15) days, the dispute shall be submitted to mediation administered by a mutually agreed-upon mediator. If mediation fails within thirty (30) days, the dispute shall be submitted to binding arbitration in accordance with the AAA Construction Industry Arbitration Rules.",
    arbitration:
      "Any dispute arising out of or related to this Agreement shall be resolved by binding arbitration in accordance with the AAA Construction Industry Arbitration Rules. The arbitration shall take place in the county where the Property is located.",
    litigation:
      "Any dispute arising out of or related to this Agreement shall be resolved through litigation in the courts of the state where the Property is located. The prevailing party shall be entitled to recover reasonable attorney's fees, expert fees, and costs.",
  };

  return (
    <>
      {/* Preamble */}
      <p className="mb-6">
        This Owner-Contractor Agreement (the "<strong>Agreement</strong>") is made as of{" "}
        <u>{fmtDate(data.startDate)}</u>, by and between:
      </p>

      <div className="mb-4 pl-4 space-y-2">
        <p>
          <strong>Owner:</strong> {blank(data.owner.name)}
          {data.owner.entityType ? `, a ${data.owner.entityType}` : ""}
          , with notice address: {data.owner.address}, {data.owner.city}, {data.owner.state} {data.owner.zip} ("Owner")
          {data.owner.tin ? ` — EIN/TIN: ${data.owner.tin}` : ""}
        </p>
        <p>
          <strong>Contractor:</strong> {blank(data.contractor.name)}
          {data.contractor.entityType ? `, a ${data.contractor.entityType}` : ""}
          {data.contractor.licenseNumber ? `, License/Registration No. ${data.contractor.licenseNumber}` : ""}
          , with notice address: {data.contractor.address}, {data.contractor.city}, {data.contractor.state}{" "}
          {data.contractor.zip} ("Contractor")
          {data.contractor.tin ? ` — EIN/TIN: ${data.contractor.tin}` : ""}
        </p>
      </div>

      <p className="mb-6">
        <strong>Project:</strong> {blank(data.projectName)} located at <strong>{blank(fullAddress)}</strong> (the
        "Project").
      </p>

      {/* 1) Contract Documents */}
      <Section num="1" title="Contract Documents and Order of Precedence">
        <p className="mb-3">
          <strong>Contract Documents:</strong> This Agreement; Exhibit A (Scope of Work and Specifications); Exhibit B
          (Schedule and Milestones); Exhibit C (Change Order Form); and any drawings, plans, and written Owner
          directives.
        </p>
        <p>
          <strong>Order of Precedence:</strong> If conflicts arise, this Agreement controls, followed by an
          Owner-issued addendum, then Exhibits in alphabetical order, then plans/specs, then Contractor's proposal, then
          field directives.
        </p>
      </Section>

      {/* 2) Scope of Work */}
      <Section num="2" title="Scope of Work">
        <p className="mb-3">
          Contractor shall furnish all labor, supervision, materials, equipment, tools, and services necessary to
          complete the Work in strict accordance with the Contract Documents and all applicable laws, codes, and
          manufacturer instructions.
        </p>
        <p className="mb-3">
          The Work includes all incidental items reasonably inferable for a complete, code-compliant project even if not
          specifically listed.
        </p>
        <p>Scope of work: {blank(data.projectDescription)}</p>
      </Section>

      {/* 3) Schedule, Milestones, and Liquidated Damages */}
      <Section num="3" title="Schedule, Milestones, and Liquidated Damages">
        <p className="mb-3">
          <strong>Time is of the essence.</strong>
        </p>
        <p className="mb-3">
          Work shall commence on or about <u>{fmtDate(data.startDate)}</u>. Substantial Completion by{" "}
          <u>{fmtDate(data.estimatedCompletionDate)}</u>. Final Completion by{" "}
          <strong>{data.finalCompletionDays} days</strong> after Substantial Completion.
        </p>
        <p className="mb-3">
          <strong>Liquidated Damages:</strong> If Substantial Completion is not achieved by the Contract Date (as
          extended by approved Change Orders), Contractor shall pay liquidated damages of{" "}
          <strong>${fmt(data.liquidatedDamagesPerDay)}</strong> per calendar day until Substantial Completion. The
          parties agree LDs are a reasonable pre-estimate of Owner's damages and not a penalty.
        </p>
        <p className="mb-3">
          <strong>Delay Notices and Recovery:</strong> Contractor shall give written notice of any excusable delay
          within 2 business days of first occurrence and submit a recovery schedule within 5 business days.
        </p>
        <p className="mb-3">
          <strong>Excusable delays:</strong> force majeure, unusually severe weather compared to historical norms,
          government action, labor strikes not limited to Contractor's workforce, and other events beyond Contractor's
          reasonable control.
        </p>
        <p>
          <strong>Access and Work Hours:</strong> {blank(data.workHours)}, subject to local ordinances and Owner rules.
        </p>
      </Section>

      {/* 4) Contract Price and Payment */}
      <Section num="4" title="Contract Price and Payment">
        <p className="mb-3">
          <strong>Contract Price:</strong> ${fmt(total)} inclusive of all applicable taxes, freight, delivery,
          supervision, overhead, and profit unless expressly excluded.
        </p>

        <p className="mb-3 font-semibold text-xs uppercase tracking-wide">Schedule of Values</p>
        <table className="w-full border-collapse mb-4 text-xs">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="text-left py-2 pr-2">Description</th>
              <th className="text-right py-2 px-2 w-16">Qty</th>
              <th className="text-left py-2 px-2 w-16">Unit</th>
              <th className="text-right py-2 px-2 w-24">Unit Price</th>
              <th className="text-right py-2 pl-2 w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((li) => (
              <tr key={li.id} className="border-b border-foreground/10">
                <td className="py-1.5 pr-2">{li.description}</td>
                <td className="text-right py-1.5 px-2">{li.quantity}</td>
                <td className="py-1.5 px-2">{li.unit}</td>
                <td className="text-right py-1.5 px-2">${fmt(li.unitPrice)}</td>
                <td className="text-right py-1.5 pl-2">${fmt(li.quantity * li.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground/20 font-semibold">
              <td colSpan={4} className="text-right py-2 pr-2">
                Total:
              </td>
              <td className="text-right py-2 pl-2">${fmt(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mb-3">
          <strong>Retainage:</strong> Owner shall withhold retainage of <strong>{data.retainagePercent}%</strong> ($
          {fmt(retainage)}) from each progress payment. Retainage is released only upon Final Completion and delivery of
          all closeout requirements.
        </p>

        <p className="mb-3">
          <strong>Billing Cycle:</strong> {paymentDesc[data.paymentSchedule]}
        </p>

        <p className="mb-3 font-semibold text-xs uppercase tracking-wide">Conditions Precedent to Any Payment</p>
        <ol className="list-decimal list-inside space-y-1 mb-3 text-xs">
          <li>
            Proper invoice with schedule-of-values reconciliation and percentage complete by line item;
          </li>
          <li>
            Conditional lien waivers (current period) from Contractor and all Subcontractors/Suppliers with each pay
            application; unconditional waivers for the prior period after clearance of funds;
          </li>
          <li>Evidence of payment downstream for the prior application;</li>
          <li>Updated schedule showing current status, plus dated photographs;</li>
          <li>Certification that Work billed is complete and conforms to the Contract Documents; and</li>
          <li>No default or unresolved safety, quality, or lien issues.</li>
        </ol>

        <p className="mb-3">
          <strong>Lien Protection — Acceptance of Payment as Covenant Not to Lien:</strong> Contractor's acceptance of
          each progress payment and final payment shall constitute Contractor's acknowledgment and agreement that
          Contractor shall not file, assert, or maintain any mechanic's lien, materialman's lien, or other encumbrance
          against the Property for Work covered by such payment. Contractor shall keep the Project free of liens and
          shall bond off or discharge any filed lien within five (5) business days of notice at its sole cost.
        </p>

        <p className="mb-3">
          <strong>Withholding and Back-Charges:</strong> Owner may withhold reasonable amounts to protect against
          defective or incomplete Work, third-party claims or liens, schedule noncompliance, or other defaults, and may
          back-charge for costs incurred to correct or complete Work after notice to Contractor.
        </p>

        <p>
          Late payments shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by applicable
          law, whichever is less.
        </p>
      </Section>

      {/* 5) Changes in the Work */}
      <Section num="5" title="Changes in the Work">
        <p className="mb-3">
          Any alteration, addition, or deviation from the Work described in this Agreement must be authorized by a
          written Change Order signed by both Parties prior to the commencement of such changed work. Each Change Order
          shall describe the scope change, the effect on the contract price (increase or decrease), and the effect on
          the project schedule.
        </p>
        <p className="mb-3">
          Owner may issue Construction Change Directives for time-sensitive items. Contractor shall proceed and price
          per agreed unit rates, time-and-materials with pre-agreed caps, or fair and reasonable cost subject to markup
          caps: Overhead <strong>{data.overheadMarkupPercent}%</strong> and Profit{" "}
          <strong>{data.profitMarkupPercent}%</strong> on self-performed work; pass-through on subcontracted work with
          no additional markup.
        </p>
        <p className="mb-3">
          Contractor shall not proceed with any change in the work without a signed Change Order or written Construction
          Change Directive. Any work performed without authorization shall be at Contractor's sole cost and risk.
        </p>
        <p>
          The cumulative value of all Change Orders shall not exceed 15% of the original contract price without the
          express written consent of Owner.
        </p>
      </Section>

      {/* 6) Insurance */}
      <Section num="6" title="Insurance">
        <p className="mb-3">
          Contractor shall maintain, at its own expense, comprehensive general liability insurance with minimum coverage
          of $1,000,000 per occurrence and $2,000,000 aggregate, as well as workers' compensation insurance as required
          by law. Contractor shall provide certificates of insurance to Owner prior to commencing work.
        </p>
        <p>
          Contractor shall indemnify, defend, and hold harmless Owner from and against all claims, damages, losses, and
          expenses arising out of or resulting from Contractor's performance of the work, except to the extent caused by
          Owner's own negligence or willful misconduct.
        </p>
      </Section>

      {/* 7) Indemnification */}
      <Section num="7" title="Indemnification">
        <p>
          To the fullest extent permitted by law, Contractor shall indemnify, defend, and hold harmless Owner, its
          affiliates, and their respective officers, directors, managers, members, employees, and agents from and
          against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising
          out of or resulting from the Work, but only to the extent caused by the negligent acts or omissions, breach of
          contract, or willful misconduct of Contractor or anyone for whom Contractor is responsible (including
          Subcontractors and Suppliers of any tier). This includes claims for bodily injury, death, or property damage;
          and contamination or hazardous materials introduced by Contractor. This indemnity shall not apply to the
          extent of Owner's sole negligence or willful misconduct.
        </p>
      </Section>

      {/* 8) Subcontractors and Suppliers */}
      <Section num="8" title="Subcontractors and Suppliers">
        <p className="mb-3">
          <strong>Approval:</strong> All Subcontractors/Suppliers require Owner's prior written approval; no
          substitution without consent.
        </p>
        <p className="mb-3">
          <strong>Flow-Down:</strong> Contractor shall incorporate into its subcontracts/supply agreements all
          obligations consistent with this Agreement, including insurance, indemnity, safety, lien waivers, and
          closeout.
        </p>
        <p>
          <strong>Licensing/Insurance:</strong> Subcontractors shall be duly licensed and insured with limits and
          endorsements equivalent to those required of Contractor. Provide certificates upon request.
        </p>
      </Section>

      {/* 9) Safety, Site Protection, and Cleanup */}
      <Section num="9" title="Safety, Site Protection, and Cleanup">
        <p className="mb-3">
          Contractor is solely responsible for jobsite safety and shall comply with all OSHA and applicable safety laws.
          Designate a competent person present whenever work is performed.
        </p>
        <p className="mb-3">
          Protect existing improvements and utilities. Provide dust, vibration, and noise controls appropriate to the
          setting.
        </p>
        <p>
          Daily cleanup: maintain a clean and orderly site; promptly remove debris. Damage to Owner or third-party
          property shall be repaired at Contractor's cost.
        </p>
      </Section>

      {/* 10) Permits, Taxes, Utilities, Inspections */}
      <Section num="10" title="Permits, Taxes, Utilities, Inspections, and Tests">
        <p className="mb-3">
          Contractor shall obtain and pay for all permits, licenses, and inspections required by law unless otherwise
          stated. All applicable taxes are included in the Contract Price unless expressly excluded.
        </p>
        <p>
          Code-required tests and inspections related to the Work are the responsibility of Contractor; Owner-requested
          discretionary tests are at Owner's cost unless nonconformance is found.
        </p>
      </Section>

      {/* 11) Quality, Submittals, and Inspections */}
      <Section num="11" title="Quality, Submittals, and Inspections">
        <p className="mb-3">
          Workmanship shall be of good quality, new and free of defects, and in strict conformance with the Contract
          Documents and manufacturer recommendations.
        </p>
        <p className="mb-3">
          Submittals: Provide product data, samples, and shop drawings as required for Owner review (review is for
          general conformance and does not relieve Contractor's responsibilities).
        </p>
        <p>
          Owner may inspect at any time. Nonconforming Work shall be removed, corrected, or replaced at Contractor's
          expense without delay.
        </p>
      </Section>

      {/* 12) Risk of Loss and Title */}
      <Section num="12" title="Risk of Loss and Title">
        <p className="mb-3">
          Contractor bears risk of loss or damage to the Work, materials, and equipment until Final Completion and
          acceptance by Owner.
        </p>
        <p>
          Title to Work and materials for which payment has been made passes to Owner, free of liens and security
          interests.
        </p>
      </Section>

      {/* 13) Warranties and Correction of Work */}
      <Section num="13" title="Warranties and Correction of Work (Labor Only)">
        <p className="mb-3">
          Contractor warrants that all work shall be performed in a good and workmanlike manner, in compliance with all
          applicable building codes, laws, and regulations, and in accordance with industry standards for residential
          remodeling.
        </p>
        <p className="mb-3">
          Contractor provides a labor warranty period of <strong>{data.warrantyPeriodMonths} months</strong> from the
          date of Final Completion, during which Contractor shall repair or replace, at Contractor's sole expense, any
          defective workmanship. This warranty covers labor only; manufacturer warranties on materials and equipment
          shall be assigned to Owner and registered as required.
        </p>
        <p className="mb-3">
          Corrected or replaced Work carries a new 12-month labor warranty from the date of correction.
        </p>
        <p className="mb-3">
          <strong>Emergency Response:</strong> Emergency conditions require response within 4 hours and action to
          stabilize the condition; non-emergency warranty calls require response within 48 hours.
        </p>
        <p>
          <strong>Closeout and Final Payment:</strong> Final Payment is conditioned upon (i) completion of all
          punch-list items; (ii) delivery of all closeout deliverables; (iii) final unconditional lien waivers from
          Contractor, all Subcontractors, and major Suppliers; and (iv) removal of temporary facilities and return of
          keys, access cards, and permits as applicable.
        </p>
      </Section>

      {/* 14) Suspension and Termination */}
      <Section num="14" title="Suspension and Termination">
        <p className="mb-3">
          <strong>Suspension:</strong> Owner may suspend all or part of the Work for convenience upon written notice;
          Contractor shall protect and secure the Work. Equitable adjustment for demonstrable, reasonable costs of
          suspension may be made.
        </p>
        <p className="mb-3">
          <strong>Termination for Cause (Owner):</strong> If Contractor fails to prosecute the Work diligently, comply
          with schedule, pay Subcontractors/Suppliers, maintain insurance, correct defective Work, or otherwise breaches
          this Agreement and fails to cure within 7 days after written notice, Owner may terminate for cause, take
          possession of the Site, Work-in-place, materials, tools and equipment, accept assignment of Subcontracts and
          Purchase Orders at Owner's option, and complete the Work. Contractor shall be liable for costs of completion
          in excess of the unpaid Contract Price.
        </p>
        <p className="mb-3">
          <strong>Termination for Convenience (Owner):</strong>{" "}
          {data.convenienceTerminationNoticeDays === 0
            ? "Owner may terminate for convenience at will and immediately."
            : `Owner may terminate for convenience upon ${data.convenienceTerminationNoticeDays} days' written notice.`}{" "}
          Contractor shall cease Work, protect the Site, and submit a final invoice for properly performed Work to date,
          approved stored materials, and reasonable, documented demobilization. Contractor shall not recover lost profits
          or overhead on unperformed Work.
        </p>
        <p className="mb-3">
          <strong>Termination by Contractor:</strong> Contractor may terminate only for Owner's material breach not
          cured within 30 days after written notice. Contractor is not entitled to lost profits on unperformed Work.
        </p>
        <p>
          <strong>Step-In/Supplementation:</strong> As an alternative to termination, Owner may supplement Contractor's
          forces or procure materials/equipment after 48 hours' notice, with costs back-charged to Contractor.
        </p>
      </Section>

      {/* 15) Dispute Resolution */}
      <Section num="15" title="Dispute Resolution">
        <p className="mb-3">{disputeDesc[data.disputeResolution]}</p>
        {data.venueCounty && (
          <p className="mb-3">
            <strong>Venue:</strong> {data.venueCounty}, {data.governingState || data.propertyState}.
          </p>
        )}
        <p>
          The prevailing party shall recover reasonable attorneys' fees, expert fees, and costs.
        </p>
      </Section>

      {/* 16) Governing Law; Compliance */}
      <Section num="16" title="Governing Law; Compliance">
        <p className="mb-3">
          <strong>Governing Law:</strong> {blank(data.governingState || data.propertyState)}, without regard to
          conflicts of law rules.
        </p>
        <p className="mb-3">
          Contractor shall comply with all applicable federal, state, and local laws, codes, and ordinances, including
          licensing and registration requirements, safety regulations, and employment verification laws.
        </p>
        <p>
          Contractor shall strictly comply with applicable mechanic's lien statutes and notice requirements and ensure
          lower-tier compliance.
        </p>
      </Section>

      {/* 17) Notices */}
      <Section num="17" title="Notices">
        <p>
          Notices shall be in writing and delivered by hand, overnight courier, or email with confirmation to the
          addresses listed for each party above (or as updated by notice). Notices are effective upon delivery or, for
          email, upon confirmation of transmission during business hours.
        </p>
      </Section>

      {/* 18) General Provisions */}
      <Section num="18" title="Assignment; Independent Contractor; Miscellaneous">
        <p className="mb-3">
          <strong>Assignment:</strong> Contractor may not assign this Agreement or any payment rights (including via
          factoring) without Owner's prior written consent. Any permitted assignment shall be subject to setoff and
          defenses.
        </p>
        <p className="mb-3">
          <strong>Independent Contractor:</strong> Contractor is an independent contractor and solely responsible for
          its employees and Subcontractors.
        </p>
        <p className="mb-3">
          <strong>Severability; Waiver:</strong> If any provision is invalid, the remainder remains enforceable. No
          waiver is effective unless in writing.
        </p>
        <p className="mb-3">
          <strong>Entire Agreement; Amendments:</strong> This Agreement and its Exhibits are the entire agreement.
          Amendments must be in a signed writing.
        </p>
        <p>
          <strong>Counterparts; Electronic Signatures:</strong> This Agreement may be executed in counterparts and by
          electronic signatures, each deemed an original.
        </p>
      </Section>

      {/* 19) Definitions */}
      <Section num="19" title="Definitions">
        <p className="mb-3">
          <strong>Substantial Completion</strong> means the stage when the Work is sufficiently complete in accordance
          with the Contract Documents so the Project can be used for its intended purpose, subject only to minor
          punch-list items.
        </p>
        <p>
          <strong>Final Completion</strong> means all Work, punch-list, commissioning/training, tests, and closeout
          deliverables are complete and accepted by Owner.
        </p>
      </Section>
    </>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
