import Link from 'next/link';

export default function StorefrontHomePage() {
  return (
    <main className="min-h-screen bg-tc-canvas text-tc-graphite">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 border-b border-tc-border pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-tc-ink sm:text-4xl">
                ToolCart UK
              </h1>
              <p className="mt-2 text-base text-tc-text-secondary">
                Industrial hardware, site equipment, and DIY tools backed by vetted UK trade suppliers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border-[1.5px] border-tc-ink bg-tc-action-lime px-3 py-1 text-xs font-bold uppercase tracking-wider text-tc-ink">
                Brand V3 Active
              </span>
            </div>
          </div>
        </header>

        <section className="rounded-card border border-tc-border bg-white p-8 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-tc-ink">
            Foundation &amp; Brand V3 Design System Initialized
          </h2>
          <p className="mt-2 text-sm text-tc-text-secondary">
            Industrial Cobalt (<code className="text-tc-ink font-semibold">#2450B8</code>), Action Lime (<code className="text-tc-ink font-semibold">#DDF16A</code>), Ink (<code className="text-tc-ink font-semibold">#182336</code>), and Workshop White (<code className="text-tc-ink font-semibold">#F7F8F5</code>).
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="#primary-action"
              className="inline-flex items-center justify-center rounded-[10px] border-2 border-tc-primary bg-tc-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-tc-primary-hover hover:bg-tc-primary-hover"
            >
              Primary Action (Cobalt)
            </Link>
            <Link
              href="#accent-action"
              className="inline-flex items-center justify-center rounded-[10px] border-2 border-tc-ink bg-tc-action-lime px-5 py-2.5 text-sm font-semibold text-tc-ink transition-colors hover:bg-tc-lime-hover shadow-sm"
            >
              Accent Action (Lime with Ink Outline)
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
