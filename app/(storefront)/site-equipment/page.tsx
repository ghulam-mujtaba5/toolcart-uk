import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function SiteEquipmentShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'site-equipment' }} searchParams={searchParams} />;
}
