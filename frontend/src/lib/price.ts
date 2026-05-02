import type { Product } from "@/lib/api";

export function formatPriceRange(product: Pick<Product, "priceLow" | "priceHigh">) {
  return `$${product.priceLow}-$${product.priceHigh}`;
}
