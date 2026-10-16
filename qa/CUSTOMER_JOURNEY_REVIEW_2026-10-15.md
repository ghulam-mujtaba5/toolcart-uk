# Customer journey review — staging catalogue

## Journey status

| Journey | Current experience | Status |
| --- | --- | --- |
| Landing → category | Clear category paths and a staging notice | Usable for discovery |
| Search → result | SKU, GTIN, title, category and brand search; category/brand filters remain | Usable for research |
| Result → product detail | Clear product specifications, pack/case information and confirmation-required state | Usable for evaluation |
| Product comparison | Side-by-side supplied fields without unlicensed images, fictional price or basket actions | Usable for evaluation |
| Basket → checkout | Intentionally unavailable | Correctly gated |
| AI advice | Intentionally removed from customer navigation | Correctly gated |
| Trade account | No company/contact data collection | Correctly gated |

## Friction removed

- Removed price and in-stock filters/sorts that could not produce truthful results from a draft quotation catalogue.
- Removed disabled AI and basket entry points from the active storefront path.
- Removed draft pricing, stock and purchase calls to action from comparison views and search suggestions.
- Kept category, brand, free-text, SKU and GTIN discovery controls so shoppers can still assess the catalogue.
- Added concise status copy at search and product decision points rather than leading visitors into forms that cannot complete.

## Before live launch

1. Test six task journeys with UK DIY and trade participants at 360px and 1440px: find a known SKU, compare two products, understand pack/case difference, find a guide, handle no results, and complete checkout.
2. Only re-enable price filters, stock filters, basket and checkout after server-side approved prices, fresh stock, delivery quote and legal terms are connected.
3. Add a real support/contact route, accessible returns/legal pages and authenticated order lookup before collecting customer data.
4. Measure search no-result rate, search refinement rate, product-detail exits, quote/availability requests and checkout errors after controlled release.
