import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function PpeShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'ppe' }} searchParams={searchParams} />;
}
