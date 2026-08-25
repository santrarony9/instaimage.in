import React from 'react';

export function OrganizationJsonLd() {
const jsonLd = {
'@context': 'https://schema.org',
'@type': 'Organization',
name: 'InstaImage',
url: 'https://instaimage.in',
logo: 'https://instaimage.in/icon-512.png',
contactPoint: {
'@type': 'ContactPoint',
telephone: '+91-0000000000',
contactType: 'customer service',
areaServed: 'IN',
availableLanguage: ['en', 'hi', 'bn'],
},
sameAs: [
'https://www.facebook.com/instaimage',
'https://www.instagram.com/instaimage',
],
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function WebSiteJsonLd() {
const jsonLd = {
'@context': 'https://schema.org',
'@type': 'WebSite',
name: 'InstaImage',
url: 'https://instaimage.in',
potentialAction: {
'@type': 'SearchAction',
target: 'https://instaimage.in/services?q={search_term_string}',
'query-input': 'required name=search_term_string',
},
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function ServiceJsonLd({ service }: { service: any }) {
if (!service) return null;

const jsonLd = {
'@context': 'https://schema.org',
'@type': 'Service',
name: service.name,
description: service.description,
provider: {
'@type': 'Organization',
name: 'InstaImage',
},
areaServed: {
'@type': 'City',
name: 'Kolkata',
},
hasOfferCatalog: {
'@type': 'OfferCatalog',
name: 'Photography Services',
itemListElement: [
{
'@type': 'Offer',
itemOffered: {
'@type': 'Service',
name: service.name,
},
priceSpecification: {
'@type': 'UnitPriceSpecification',
priceCurrency: 'INR',
price: service.basePrice,
},
},
],
},
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function ItemListJsonLd({ items, name, description }: { items: any[], name: string, description: string }) {
const jsonLd = {
'@context': 'https://schema.org',
'@type': 'ItemList',
name: name,
description: description,
itemListElement: items.map((item, index) => ({
'@type': 'ListItem',
position: index + 1,
item: {
'@type': 'Service',
name: item.name,
url: `https://instaimage.in/services/${item.slug || item._id}`,
},
})),
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function BreadcrumbJsonLd({ items }: { items: { name: string, url: string }[] }) {
const jsonLd = {
'@context': 'https://schema.org',
'@type': 'BreadcrumbList',
itemListElement: items.map((item, index) => ({
'@type': 'ListItem',
position: index + 1,
name: item.name,
item: item.url,
})),
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function FAQPageJsonLd({ faqs }: { faqs: { question: string, answer: string }[] }) {
const jsonLd = {
'@context': 'https://schema.org',
'@type': 'FAQPage',
mainEntity: faqs.map(faq => ({
'@type': 'Question',
name: faq.question,
acceptedAnswer: {
'@type': 'Answer',
text: faq.answer,
},
})),
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
/>
);
}

export function AggregateRatingJsonLd({ ratingValue, reviewCount, itemName }: { ratingValue: number, reviewCount: number, itemName: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
