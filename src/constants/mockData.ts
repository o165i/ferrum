import type { Product } from "@/types/product";

const image = (seed: string) => `https://picsum.photos/seed/${seed}/900/1150`;

export const PRODUCTS: Product[] = [
  { id: 1, ref: "FR-014", name: "HAZARD ANORAK", category: "OUTERWEAR", color: "BLACK", price: 340, sale: null, primaryImage: image("ferrum-anorak-a"), alternateImage: image("ferrum-anorak-b") },
  { id: 2, ref: "FR-021", name: "SLAG COAT", category: "OUTERWEAR", color: "GREY", price: 620, sale: 480, primaryImage: image("ferrum-coat-a"), alternateImage: image("ferrum-coat-b") },
  { id: 3, ref: "FR-032", name: "CINDER KNIT", category: "KNITWEAR", color: "BLACK", price: 180, sale: null, primaryImage: image("ferrum-knit-a"), alternateImage: image("ferrum-knit-b") },
  { id: 4, ref: "FR-035", name: "ASH CABLE SWEATER", category: "KNITWEAR", color: "BONE", price: 210, sale: null, primaryImage: image("ferrum-cable-a"), alternateImage: image("ferrum-cable-b") },
  { id: 5, ref: "FR-041", name: "RUST WASH DENIM", category: "DENIM", color: "RUST", price: 230, sale: null, primaryImage: image("ferrum-denim-a"), alternateImage: image("ferrum-denim-b") },
  { id: 6, ref: "FR-044", name: "SCRAP CARGO", category: "DENIM", color: "BLACK", price: 260, sale: 190, primaryImage: image("ferrum-cargo-a"), alternateImage: image("ferrum-cargo-b") },
  { id: 7, ref: "FR-051", name: "MANIFEST TEE", category: "TOPS", color: "BONE", price: 90, sale: null, primaryImage: image("ferrum-tee-a"), alternateImage: image("ferrum-tee-b") },
  { id: 8, ref: "FR-053", name: "FREIGHT HOODIE", category: "TOPS", color: "BLACK", price: 210, sale: null, primaryImage: image("ferrum-hoodie-a"), alternateImage: image("ferrum-hoodie-b") },
  { id: 9, ref: "FR-061", name: "STEEL CHAIN", category: "ACCESSORIES", color: "GREY", price: 60, sale: null, primaryImage: image("ferrum-chain-a"), alternateImage: image("ferrum-chain-b") },
  { id: 10, ref: "FR-064", name: "CONCRETE CAP", category: "ACCESSORIES", color: "BLACK", price: 70, sale: null, primaryImage: image("ferrum-cap-a"), alternateImage: image("ferrum-cap-b") },
];
