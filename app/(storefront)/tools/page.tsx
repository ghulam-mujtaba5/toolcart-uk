import CategoryPage from '../categories/[slug]/page';

export const dynamic = 'force-dynamic';

export default function ToolsShortcutPage({ searchParams }: { searchParams: any }) {
  return <CategoryPage params={{ slug: 'tools' }} searchParams={searchParams} />;
}
