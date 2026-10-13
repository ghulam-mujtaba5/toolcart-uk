import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductsByCategory } from '@/lib/catalog';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { ProductCard } from '@/components/storefront/product-card';
import { SpecTable } from '@/components/ui/spec-table';
import { ProductJsonLd } from '@/components/seo/json-ld';
import {
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
  CheckCircle2,
  Truck,
  Box,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

function getCategoryIcon(categorySlug: string) {
  switch (categorySlug) {
    case 'tools':
      return Wrench;
    case 'fixings':
      return Shield;
    case 'decorating':
      return Paintbrush;
    case 'measuring':
      return Ruler;
    case 'ppe':
      return HardHat;
    default:
      return Package;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProductsByCategory(product.category_slug))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const Icon = getCategoryIcon(product.category_slug);

  const specRows = Object.entries(product.specifications).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <ProductJsonLd product={product} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary truncate">
        <Link href="/" className="hover:text-tc-ink shrink-0">Home</Link>
        <span>/</span>
        <Link href={`/${product.category_slug}`} className="hover:text-tc-ink shrink-0">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold truncate">{product.title}</span>
      </div>

      {/* Main 2-Column PDP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image / Illustration Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] p-8 flex flex-col items-center justify-center shadow-xs overflow-hidden">
            {/* Honest Stock Badge */}
            <div className="absolute top-4 left-4 z-10">
              {product.availability_status === 'in_stock' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-tc-success border border-[#A3D9B5]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7E8] text-tc-warning border border-[#E8CB91]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Subject to supplier confirmation
                </span>
              )}
            </div>

            {/* Compliance Verified Marks */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/80 border border-[#C8D9F9] text-tc-primary">
                UKCA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/80 border border-[#C8D9F9] text-tc-primary">
                CE
              </span>
            </div>

            {/* Visual Icon Illustration */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border border-[#C8D9F9] shadow-sm flex items-center justify-center text-tc-primary">
              <Icon className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.75]" />
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs font-mono font-bold text-tc-text-secondary tracking-widest uppercase">
                {product.supplier_sku}
              </span>
              <p className="text-[11px] text-tc-text-secondary mt-0.5">
                EAN-13: {product.gtin}
              </p>
            </div>
          </div>

          {/* Delivery & Supplier Facility Card */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-tc-border flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-tc-ink">Standard Dispatch</p>
                <p className="text-[11px] text-tc-text-secondary">2–3 business days via UK courier</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-tc-border flex items-start gap-2.5">
              <Box className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-tc-ink">Supplier Hub</p>
                <p className="text-[11px] text-tc-text-secondary">West Yorkshire facility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Technical Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-tc-primary">
                {product.brand}
              </span>
              <span className="text-tc-border-strong">•</span>
              <span className="text-xs text-tc-text-secondary font-medium">{product.category}</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="text-xs sm:text-sm text-tc-graphite mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pack & Carton Breakdown Card */}
          <div className="p-4 rounded-xl bg-white border border-tc-border space-y-3">
            <h2 className="text-xs font-bold text-tc-ink uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <Box className="w-4 h-4 text-tc-primary" />
              Pack &amp; Carton Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-tc-canvas">
                <span className="text-[10px] text-tc-text-secondary uppercase">Retail Sales Unit</span>
                <p className="font-bold text-tc-ink mt-0.5 tabular-nums">
                  {product.units_per_pack > 1
                    ? `Pack of ${product.units_per_pack}`
                    : '1 Unit'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-tc-canvas">
                <span className="text-[10px] text-tc-text-secondary uppercase">Outer Carton Case</span>
                <p className="font-bold text-tc-ink mt-0.5 tabular-nums">
                  {product.units_per_case} {product.units_per_case === 1 ? 'pack' : 'packs'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-tc-canvas col-span-2 sm:col-span-1">
                <span className="text-[10px] text-tc-text-secondary uppercase">Carton Barcode</span>
                <p className="font-mono font-bold text-tc-ink mt-0.5 tabular-nums truncate text-[11px]">
                  {product.carton_barcode || 'Single Unit'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing, Quantity & Basket Controls */}
          <PdpActions product={product} />
        </div>
      </div>

      {/* Technical Specifications Section */}
      <section className="bg-white rounded-card border border-tc-border p-6 sm:p-8 space-y-6">
        <div className="border-b border-tc-border pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-tc-primary uppercase tracking-wider mb-1 font-mono">
            <FileText className="w-4 h-4" />
            <span>AUTHENTICATED CATALOG DATA</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-tc-ink">
            Technical Specification Sheet
          </h2>
          <p className="text-xs text-tc-text-secondary mt-1">
            All numerical parameters, dimensions, and weights aligned in tabular numerals.
          </p>
        </div>

        <div className="max-w-3xl">
          <SpecTable specs={specRows} striped={true} />
        </div>
      </section>

      {/* Related Category Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-tc-border pb-3">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Related {product.category} Products
            </h2>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Explore matching items from the same supplier quotation family.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
