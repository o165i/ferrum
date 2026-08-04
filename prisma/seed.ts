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
  imgA: string;
  imgB: string;
}[] = [
  { ref: "FR-014", name: "HAZARD ANORAK", slug: "hazard-anorak", category: "OUTERWEAR", color: "BLACK", priceCents: 34000, saleCents: null, popularityScore: 96, imgA: "ferrum-anorak-a", imgB: "ferrum-anorak-b" },
  { ref: "FR-021", name: "SLAG COAT", slug: "slag-coat", category: "OUTERWEAR", color: "GREY", priceCents: 62000, saleCents: 48000, popularityScore: 88, imgA: "ferrum-coat-a", imgB: "ferrum-coat-b" },
  { ref: "FR-032", name: "CINDER KNIT", slug: "cinder-knit", category: "KNITWEAR", color: "BLACK", priceCents: 18000, saleCents: null, popularityScore: 91, imgA: "ferrum-knit-a", imgB: "ferrum-knit-b" },
  { ref: "FR-035", name: "ASH CABLE SWEATER", slug: "ash-cable-sweater", category: "KNITWEAR", color: "BONE", priceCents: 21000, saleCents: null, popularityScore: 72, imgA: "ferrum-cable-a", imgB: "ferrum-cable-b" },
  { ref: "FR-041", name: "RUST WASH DENIM", slug: "rust-wash-denim", category: "DENIM", color: "RUST", priceCents: 23000, saleCents: null, popularityScore: 84, imgA: "ferrum-denim1-a", imgB: "ferrum-denim1-b" },
  { ref: "FR-044", name: "SCRAP CARGO", slug: "scrap-cargo", category: "DENIM", color: "BLACK", priceCents: 26000, saleCents: 19000, popularityScore: 98, imgA: "ferrum-cargo-a", imgB: "ferrum-cargo-b" },
  { ref: "FR-051", name: "MANIFEST TEE", slug: "manifest-tee", category: "TOPS", color: "BONE", priceCents: 9000, saleCents: null, popularityScore: 79, imgA: "ferrum-tee-a", imgB: "ferrum-tee-b" },
  { ref: "FR-053", name: "FREIGHT HOODIE", slug: "freight-hoodie", category: "TOPS", color: "BLACK", priceCents: 21000, saleCents: null, popularityScore: 94, imgA: "ferrum-hoodie-a", imgB: "ferrum-hoodie-b" },
  { ref: "FR-061", name: "STEEL CHAIN", slug: "steel-chain", category: "ACCESSORIES", color: "GREY", priceCents: 6000, saleCents: null, popularityScore: 68, imgA: "ferrum-chain-a", imgB: "ferrum-chain-b" },
  { ref: "FR-064", name: "CONCRETE CAP", slug: "concrete-cap", category: "ACCESSORIES", color: "BLACK", priceCents: 7000, saleCents: null, popularityScore: 76, imgA: "ferrum-cap-a", imgB: "ferrum-cap-b" },
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
      update: { popularityScore: p.popularityScore },
      create: {
        ref: p.ref,
        name: p.name,
        slug: p.slug,
        category: p.category,
        color: p.color,
        priceCents: p.priceCents,
        saleCents: p.saleCents,
        sizes: ["XS", "S", "M", "L", "XL"],
        images: [IMG(p.imgA), IMG(p.imgB)],
        stock: 25,
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
