import { JsonLd } from "./JsonLd";
import { faqJsonLd } from "@/lib/seo";

export interface Faq {
  question: string;
  answer: string;
}

export function FaqBlock({ faqs, title = "Questions fréquentes" }: { faqs: Faq[]; title?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-label={title}>
      <JsonLd data={faqJsonLd(faqs)} />
      <h2 className="h-section mb-6">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="card group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span
                aria-hidden
                className="text-xl leading-none text-accent transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
