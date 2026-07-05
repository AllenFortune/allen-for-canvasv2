import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

/** Builds FAQPage JSON-LD for the Seo component from the same items rendered on-page. */
export const faqJsonLd = (items: FaqItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

/** On-page FAQ list. Answers stay visible (not collapsed) so crawlers and readers get the full text. */
const FaqSection = ({ items }: { items: FaqItem[] }) => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.question}</h3>
            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
