import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function DecoratingShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'decorating' }} searchParams={searchParams} />;
}
