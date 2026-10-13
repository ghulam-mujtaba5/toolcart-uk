import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function FixingsShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'fixings' }} searchParams={searchParams} />;
}
