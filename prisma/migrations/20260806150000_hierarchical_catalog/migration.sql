-- Replace the old flat product categories with leaf categories used by the catalog tree.
CREATE TYPE "ProductCategory_new" AS ENUM (
  'T_SHIRTS',
  'ZIP_HOODIES',
  'HOODIES',
  'JEANS',
  'SHORTS',
  'SWEATPANTS',
  'ACCESSORIES'
);

ALTER TABLE "products"
  ALTER COLUMN "category" TYPE "ProductCategory_new"
  USING (
    CASE
      WHEN "ref" = 'FR-014' THEN 'ZIP_HOODIES'
      WHEN "ref" IN ('FR-021', 'FR-032', 'FR-035', 'FR-053') THEN 'HOODIES'
      WHEN "ref" = 'FR-041' THEN 'JEANS'
      WHEN "ref" = 'FR-044' THEN 'SWEATPANTS'
      WHEN "ref" = 'FR-051' THEN 'T_SHIRTS'
      WHEN "category"::text = 'ACCESSORIES' THEN 'ACCESSORIES'
      WHEN "category"::text IN ('OUTERWEAR', 'KNITWEAR') THEN 'HOODIES'
      WHEN "category"::text = 'DENIM' THEN 'JEANS'
      ELSE 'T_SHIRTS'
    END
  )::"ProductCategory_new";

DROP TYPE "ProductCategory";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";

-- Populate categories that were absent from the original demo dataset.
INSERT INTO "products" (
  "id", "ref", "name", "slug", "category", "color", "priceCents", "saleCents",
  "description", "sizes", "images", "stock", "popularityScore", "isActive", "createdAt", "updatedAt"
) VALUES
  (
    'catalog-demo-zip-hoodie', 'FR-071', 'WELD ZIP HOODIE', 'weld-zip-hoodie', 'ZIP_HOODIES', 'RUST', 24000, NULL,
    '', ARRAY['XS','S','M','L','XL'], ARRAY['https://picsum.photos/seed/ferrum-zip-a/900/1150','https://picsum.photos/seed/ferrum-zip-b/900/1150'],
    25, 83, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'catalog-demo-shorts', 'FR-074', 'FOUNDRY SHORTS', 'foundry-shorts', 'SHORTS', 'BLACK', 12000, NULL,
    '', ARRAY['XS','S','M','L','XL'], ARRAY['https://picsum.photos/seed/ferrum-shorts-a/900/1150','https://picsum.photos/seed/ferrum-shorts-b/900/1150'],
    25, 75, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'catalog-demo-sweatpants', 'FR-077', 'FORGE SWEATPANTS', 'forge-sweatpants', 'SWEATPANTS', 'GREY', 17000, NULL,
    '', ARRAY['XS','S','M','L','XL'], ARRAY['https://picsum.photos/seed/ferrum-sweatpants-a/900/1150','https://picsum.photos/seed/ferrum-sweatpants-b/900/1150'],
    25, 87, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
ON CONFLICT ("ref") DO UPDATE SET
  "category" = EXCLUDED."category",
  "popularityScore" = EXCLUDED."popularityScore",
  "updatedAt" = CURRENT_TIMESTAMP;
