import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function ElectricalShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'electrical' }} searchParams={searchParams} />;
}
