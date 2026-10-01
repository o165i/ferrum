import { PrismaClient, ProductCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = (seed: string, w = 900, h = 1150) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PRODUCTS: {
  ref: string;
  name: string;
  slug: string;
  category: ProductCategory;
  color: string;
  priceCents: number;
  saleCents: number | null;
  popularityScore: number;
  imgA?: string;
  imgB?: string;
  description?: string;
  sizes?: string[];
  images?: string[];
  stock?: number;
}[] = [
  { ref: "FR-014", name: "HAZARD ANORAK", slug: "hazard-anorak", category: "ZIP_HOODIES", color: "BLACK", priceCents: 34000, saleCents: null, popularityScore: 96, imgA: "ferrum-anorak-a", imgB: "ferrum-anorak-b" },
  { ref: "FR-021", name: "SLAG COAT", slug: "slag-coat", category: "HOODIES", color: "GREY", priceCents: 62000, saleCents: 48000, popularityScore: 88, imgA: "ferrum-coat-a", imgB: "ferrum-coat-b" },
  { ref: "FR-032", name: "CINDER KNIT", slug: "cinder-knit", category: "HOODIES", color: "BLACK", priceCents: 18000, saleCents: null, popularityScore: 91, imgA: "ferrum-knit-a", imgB: "ferrum-knit-b" },
  { ref: "FR-035", name: "ASH CABLE SWEATER", slug: "ash-cable-sweater", category: "HOODIES", color: "BONE", priceCents: 21000, saleCents: null, popularityScore: 72, imgA: "ferrum-cable-a", imgB: "ferrum-cable-b" },
  { ref: "FR-041", name: "RUST WASH DENIM", slug: "rust-wash-denim", category: "JEANS", color: "RUST", priceCents: 23000, saleCents: null, popularityScore: 84, imgA: "ferrum-denim1-a", imgB: "ferrum-denim1-b" },
  { ref: "FR-044", name: "SCRAP CARGO", slug: "scrap-cargo", category: "SWEATPANTS", color: "BLACK", priceCents: 26000, saleCents: 19000, popularityScore: 98, imgA: "ferrum-cargo-a", imgB: "ferrum-cargo-b" },
  { ref: "FR-051", name: "MANIFEST TEE", slug: "manifest-tee", category: "T_SHIRTS", color: "BONE", priceCents: 9000, saleCents: null, popularityScore: 79, imgA: "ferrum-tee-a", imgB: "ferrum-tee-b" },
  { ref: "FR-053", name: "FREIGHT HOODIE", slug: "freight-hoodie", category: "HOODIES", color: "BLACK", priceCents: 21000, saleCents: null, popularityScore: 94, imgA: "ferrum-hoodie-a", imgB: "ferrum-hoodie-b" },
  { ref: "FR-061", name: "STEEL CHAIN", slug: "steel-chain", category: "ACCESSORIES", color: "GREY", priceCents: 6000, saleCents: null, popularityScore: 68, imgA: "ferrum-chain-a", imgB: "ferrum-chain-b" },
  { ref: "FR-064", name: "CONCRETE CAP", slug: "concrete-cap", category: "ACCESSORIES", color: "BLACK", priceCents: 7000, saleCents: null, popularityScore: 76, imgA: "ferrum-cap-a", imgB: "ferrum-cap-b" },
  { ref: "FR-071", name: "WELD ZIP HOODIE", slug: "weld-zip-hoodie", category: "ZIP_HOODIES", color: "RUST", priceCents: 24000, saleCents: null, popularityScore: 83, imgA: "ferrum-zip-a", imgB: "ferrum-zip-b" },
  { ref: "FR-074", name: "FOUNDRY SHORTS", slug: "foundry-shorts", category: "SHORTS", color: "BLACK", priceCents: 12000, saleCents: null, popularityScore: 75, imgA: "ferrum-shorts-a", imgB: "ferrum-shorts-b" },
  { ref: "FR-077", name: "FORGE SWEATPANTS", slug: "forge-sweatpants", category: "SWEATPANTS", color: "GREY", priceCents: 17000, saleCents: null, popularityScore: 87, imgA: "ferrum-sweatpants-a", imgB: "ferrum-sweatpants-b" },
  {
    ref: "FR-101",
    name: "WHITE BOOTCUT JEANS",
    slug: "white-bootcut-jeans",
    category: "JEANS",
    color: "DIRTY WHITE",
    priceCents: 3000,
    saleCents: null,
    popularityScore: 100,
    description: "Dirty-white low-rise bootcut jeans with a fitted silhouette through the upper leg and a flared leg opening. Finished with a washed effect, panelled detailing and raw-edge hems. Available in sizes S–XXXL.",
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    images: [
      "/products/white-bootcut-jeans/01-front.png",
      "/products/white-bootcut-jeans/02-product.png",
      "/products/white-bootcut-jeans/03-back.png",
      "/products/white-bootcut-jeans/04-side.png",
      "/products/white-bootcut-jeans/05-detail.png",
    ],
    stock: 20,
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  const userPasswordHash = await bcrypt.hash("User123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@ferrum.dev" },
    update: {},
    create: {
      email: "admin@ferrum.dev",
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@ferrum.dev" },
    update: {},
    create: {
      email: "user@ferrum.dev",
      passwordHash: userPasswordHash,
      name: "Test User",
      role: "USER",
    },
  });

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { ref: p.ref },
      update: { category: p.category, popularityScore: p.popularityScore },
      create: {
        ref: p.ref,
        name: p.name,
        slug: p.slug,
        category: p.category,
        color: p.color,
        priceCents: p.priceCents,
        saleCents: p.saleCents,
        description: p.description ?? "",
        sizes: p.sizes ?? ["XS", "S", "M", "L", "XL"],
        images: p.images ?? [IMG(p.imgA ?? "ferrum-placeholder-a"), IMG(p.imgB ?? "ferrum-placeholder-b")],
        stock: p.stock ?? 25,
        popularityScore: p.popularityScore,
        isActive: true,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${PRODUCTS.length} products and 2 users.`);
  // eslint-disable-next-line no-console
  console.log("admin@ferrum.dev / Admin123!");
  // eslint-disable-next-line no-console
  console.log("user@ferrum.dev / User123!");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
