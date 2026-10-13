import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function MeasuringShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'measuring' }} searchParams={searchParams} />;
}
