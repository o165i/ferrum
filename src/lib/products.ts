import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getActiveProductBySlug = cache((slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true },
  }),
);
