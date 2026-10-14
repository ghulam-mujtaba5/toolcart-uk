# Integration into your e-commerce prototype

Copy the images you need into your Next.js `public/brand/` folder. In Next.js, use file paths like `/brand/02_Hero_Banners/hero-united-shop-desktop-1920x760.webp`.

## Responsive hero

```jsx
<picture>
  <source media="(max-width: 640px)" srcSet="/brand/02_Hero_Banners/hero-united-shop-mobile-1080x1350.webp" />
  <img src="/brand/02_Hero_Banners/hero-united-shop-desktop-1920x760.webp" alt="United Shop trade and DIY hardware" width="1920" height="760" loading="eager" fetchPriority="high" style={{width:'100%',height:'auto'}} />
</picture>
```

## Six category image links

- Hand Tools: `03_Category_Images/01-hand-tools-plain-720.webp`
- Fixings & Security: `03_Category_Images/02-fixings-security-plain-720.webp`
- Decorating: `03_Category_Images/03-decorating-plain-720.webp`
- Measuring: `03_Category_Images/04-measuring-plain-720.webp`
- Workwear & Safety: `03_Category_Images/05-workwear-safety-plain-720.webp`
- Site Equipment: `03_Category_Images/06-site-equipment-plain-720.webp`

Prefer **plain** category images with live HTML headings for accessibility, mobile scaling, localisation, and SEO. `-labelled-` alternatives have the label baked into the image.

## Brand swaps

Current staging website calls itself ToolCart and labels the brand provisional. This pack prioritises the previously discussed working name United Shop and also includes ToolCart logos / desktop hero while the rename is undecided.

Do not place hard-coded supplier or brand claims in generated visuals, imply products are in stock, or assert a store has a verified supplier arrangement without the underlying evidence. Use real supplier photos for actual product detail pages, and check that all certifications, availability, prices and delivery promises match your live data. The category source photos are **illustrative**, not proof of exact stock/SKUs.

## Source and format notes

- Original category/product still lifes and main hero are AI-generated illustrative marketing assets with no intended third-party tool brand marks.
- Site Equipment category and Project Finder imagery are original editable SVG illustrations.
- All public-ready composite banners/social posts were laid out from the source artwork, saved as WebP.
- Logo text remains editable in SVG, but font fallback can change the shape depending on where you open it.
- Brand name/domain/trademark rights have not been cleared; verify before publishing.
