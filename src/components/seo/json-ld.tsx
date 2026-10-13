import React from 'react';
import { PublicProductDTO } from '@/types/product';

export function ProductJsonLd({
  product,
  baseUrl = 'https://toolcart.co.uk',
}: {
  product: PublicProductDTO;
  baseUrl?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.supplier_sku,
    gtin13: product.gtin,
    mpn: product.mpn || product.supplier_sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.retail_price_inc_vat_gbp.toFixed(2),
      priceCurrency: 'GBP',
      priceValidUntil: '2027-12-31',
      availability:
        product.availability_status === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'ToolCart UK',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd({
  baseUrl = 'https://toolcart.co.uk',
}: {
  baseUrl?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolCart UK',
    url: baseUrl,
    logo: `${baseUrl}/images/brand/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'orders@toolcart.co.uk',
      areaServed: 'GB',
      availableLanguage: 'en',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
