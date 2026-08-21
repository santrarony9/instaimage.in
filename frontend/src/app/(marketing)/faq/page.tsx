import { FAQPageJsonLd } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Frequently Asked Questions | InstaImage',
  description: 'Find answers to common questions about booking photography, videography, and drone services with InstaImage.',
};

const faqs = [
  { question: "How do I book a photographer?", answer: "You can book directly through our website by selecting your desired service, package, and date." },
  { question: "When will I receive my photos?", answer: "Digital photos are typically delivered within 48-72 hours after the shoot." },
  { question: "Can I reschedule my shoot?", answer: "Yes, you can reschedule up to 24 hours before the shoot without any penalty." }
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <FAQPageJsonLd faqs={faqs} />
      <h1 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((item, i) => (
          <div key={i} className="border-b pb-6">
            <h3 className="text-xl font-bold mb-2">{item.question}</h3>
            <p className="text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
