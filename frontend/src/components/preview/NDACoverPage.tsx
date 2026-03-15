import type { NDAFormData } from "@/lib/ndaSchema";

function formatDate(dateStr: string): string {
  if (!dateStr) return "_______________";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function NDACoverPage({ data }: { data: NDAFormData }) {
  const mndaTerm =
    data.mndaTermType === "fixed"
      ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confTerm =
    data.confidentialityTermType === "fixed"
      ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  return (
    <div style={{ pageBreakAfter: "always" }}>
      {/* Document header with decorative rule */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-px bg-charcoal-30" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="w-16 h-px bg-charcoal-30" />
        </div>
        <h1 className="text-2xl font-display font-bold text-charcoal tracking-tight">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-xs text-warm-gray mt-2 tracking-wide uppercase">
          Cover Page
        </p>
      </div>

      <div className="text-xs text-warm-gray leading-relaxed mb-8 pb-4 border-b border-border">
        <p>
          This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists
          of: (1) this Cover Page (&ldquo;Cover Page&rdquo;) and (2) the Common
          Paper Mutual NDA Standard Terms Version 1.0 (&ldquo;Standard
          Terms&rdquo;). Any modifications of the Standard Terms should be made
          on the Cover Page, which will control over conflicts with the Standard
          Terms.
        </p>
      </div>

      <div className="space-y-5 text-sm text-charcoal leading-relaxed">
        {[
          { title: "Purpose", content: data.purpose },
          { title: "Effective Date", content: formatDate(data.effectiveDate) },
          { title: "MNDA Term", content: mndaTerm },
          { title: "Term of Confidentiality", content: confTerm },
        ].map(({ title, content }) => (
          <section key={title} className="flex gap-4">
            <h3 className="w-44 shrink-0 font-semibold text-xs uppercase tracking-widest text-warm-gray pt-0.5">
              {title}
            </h3>
            <p className="flex-1">{content}</p>
          </section>
        ))}

        <section className="flex gap-4">
          <h3 className="w-44 shrink-0 font-semibold text-xs uppercase tracking-widest text-warm-gray pt-0.5">
            Governing Law
          </h3>
          <p className="flex-1">
            {data.governingLaw || "_______________"}
          </p>
        </section>

        <section className="flex gap-4">
          <h3 className="w-44 shrink-0 font-semibold text-xs uppercase tracking-widest text-warm-gray pt-0.5">
            Jurisdiction
          </h3>
          <p className="flex-1">
            {data.jurisdiction || "_______________"}
          </p>
        </section>

        {data.modifications && (
          <section className="flex gap-4">
            <h3 className="w-44 shrink-0 font-semibold text-xs uppercase tracking-widest text-warm-gray pt-0.5">
              Modifications
            </h3>
            <p className="flex-1">{data.modifications}</p>
          </section>
        )}
      </div>

      {/* Signature block */}
      <div className="mt-10 pt-6 border-t border-charcoal-10">
        <p className="text-sm text-warm-gray italic mb-8">
          By signing this Cover Page, each party agrees to enter into this MNDA
          as of the Effective Date.
        </p>

        <div className="grid grid-cols-2 gap-10">
          {[
            { label: "Party 1", party: data.party1 },
            { label: "Party 2", party: data.party2 },
          ].map(({ label, party }) => (
            <div key={label} className="space-y-5">
              <h4 className="font-display font-semibold text-sm text-charcoal border-b border-charcoal-20 pb-2">
                {label}
              </h4>

              <div>
                <p className="text-[10px] text-warm-gray-light uppercase tracking-widest mb-2">
                  Signature
                </p>
                <div className="border-b border-charcoal-40 h-10" />
              </div>

              {[
                { field: "Print Name", value: party.name },
                { field: "Title", value: party.title },
                { field: "Company", value: party.company },
                { field: "Notice Address", value: party.noticeAddress },
                { field: "Date", value: formatDate(party.date) },
              ].map(({ field, value }) => (
                <div key={field}>
                  <p className="text-[10px] text-warm-gray-light uppercase tracking-widest mb-0.5">
                    {field}
                  </p>
                  <p className="text-sm text-charcoal">
                    {value || "_______________"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-[10px] text-warm-gray-light text-center tracking-wide">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) &middot; Free
        to use under CC BY 4.0
      </p>
    </div>
  );
}
