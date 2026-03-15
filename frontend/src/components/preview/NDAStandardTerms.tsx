import type { NDAFormData } from "@/lib/ndaSchema";

const SECTIONS = [
  {
    num: 1,
    title: "Introduction",
    text: (d: NDAFormData) =>
      `This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the ${val(d.purpose)} which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.`,
  },
  {
    num: 2,
    title: "Use and Protection of Confidential Information",
    text: (d: NDAFormData) =>
      `The Receiving Party shall: (a) use Confidential Information solely for the ${val(d.purpose)}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${val(d.purpose)}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.`,
  },
  {
    num: 3,
    title: "Exceptions",
    text: () =>
      `The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.`,
  },
  {
    num: 4,
    title: "Disclosures Required by Law",
    text: () =>
      `The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.`,
  },
  {
    num: 5,
    title: "Term and Termination",
    text: (d: NDAFormData) => {
      const effectiveDate = d.effectiveDate
        ? new Date(d.effectiveDate + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "the Effective Date";
      const mndaTerm =
        d.mndaTermType === "fixed"
          ? `${d.mndaTermYears} year(s) from the Effective Date`
          : "until terminated by either party";
      const confTerm =
        d.confidentialityTermType === "fixed"
          ? `${d.confidentialityTermYears} year(s)`
          : "in perpetuity";
      return `This MNDA commences on ${val(effectiveDate)} and expires at the end of the ${val(mndaTerm)}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${val(confTerm)}, despite any expiration or termination of this MNDA.`;
    },
  },
  {
    num: 6,
    title: "Return or Destruction of Confidential Information",
    text: () =>
      `Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.`,
  },
  {
    num: 7,
    title: "Proprietary Rights",
    text: () =>
      `The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.`,
  },
  {
    num: 8,
    title: "Disclaimer",
    text: () =>
      `ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`,
  },
  {
    num: 9,
    title: "Governing Law and Jurisdiction",
    text: (d: NDAFormData) =>
      `This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${val(d.governingLaw || "___")}, without regard to the conflict of laws provisions of such State. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${val(d.jurisdiction || "___")}. Each party irrevocably submits to the exclusive jurisdiction of such courts in any such suit, action, or proceeding.`,
  },
  {
    num: 10,
    title: "Equitable Relief",
    text: () =>
      `A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.`,
  },
  {
    num: 11,
    title: "General",
    text: () =>
      `Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.`,
  },
];

const DELIM_START = "\u200B\u00AB";
const DELIM_END = "\u00BB\u200B";

function val(v: string) {
  const sanitized = v.replace(/\u200B\u00AB|\u00BB\u200B/g, "");
  return `${DELIM_START}${sanitized}${DELIM_END}`;
}

export function NDAStandardTerms({ data }: { data: NDAFormData }) {
  return (
    <div className="text-charcoal leading-relaxed">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-px bg-charcoal/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="w-16 h-px bg-charcoal/30" />
        </div>
        <h2 className="text-xl font-display font-bold text-charcoal tracking-tight">
          Standard Terms
        </h2>
      </div>

      <div className="space-y-5 text-sm">
        {SECTIONS.map((section) => {
          const raw = section.text(data);
          const parts = raw.split(new RegExp(`${DELIM_START}(.+?)${DELIM_END}`, "g"));
          return (
            <p key={section.num} className="text-charcoal/85 leading-[1.75]">
              <strong className="text-charcoal font-display">
                {section.num}. {section.title}.
              </strong>{" "}
              {parts.map((part, i) =>
                i % 2 === 1 ? (
                  <span
                    key={i}
                    className="text-amber font-medium"
                    style={{ borderBottom: "1px dotted rgba(184, 134, 11, 0.4)" }}
                  >
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          );
        })}
      </div>

      <p className="mt-8 text-[10px] text-warm-gray-light text-center tracking-wide">
        Common Paper Mutual Non-Disclosure Agreement Version 1.0 &middot; Free
        to use under CC BY 4.0
      </p>
    </div>
  );
}
