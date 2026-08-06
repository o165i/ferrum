ALTER TABLE "products"
ADD COLUMN "popularityScore" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "products_popularityScore_idx" ON "products"("popularityScore");
