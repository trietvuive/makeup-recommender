import type { Product } from "@/lib/api";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_{}\[\]()#+\-.!|>])/g, "\\$1");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function productAliases(product: Product) {
  const nameWithoutBrand = product.name
    .replace(new RegExp(`^${escapeRegex(product.brand)}\\s*`, "i"), "")
    .trim();
  const withoutSpfSuffix = product.name.replace(/\s+SPF\s*\d+.*$/i, "").trim();
  const nameTokens = nameWithoutBrand
    .split(/\s+/)
    .filter((token) => token.length > 2 && !/^\d/.test(token));

  return unique([
    product.name,
    withoutSpfSuffix,
    nameWithoutBrand,
    nameTokens.length >= 2 ? `${product.brand} ${nameTokens.slice(0, 2).join(" ")}` : "",
    nameTokens.length >= 3 ? `${product.brand} ${nameTokens.slice(0, 3).join(" ")}` : "",
  ]).filter((alias) => normalize(alias).length >= 8);
}

function productMatchers(products: Product[]) {
  return products.flatMap((product) =>
    productAliases(product).map((alias) => ({ product, alias })),
  );
}

export function linkifyProducts(markdown: string, products: Product[]) {
  if (!markdown || products.length === 0) return markdown;

  const sorted = productMatchers(products).sort((a, b) => b.alias.length - a.alias.length);

  const segments = markdown.split(/(```[\s\S]*?```|`[^`]*`|\[[^\]]+\]\([^)]+\))/g);

  return segments
    .map((segment) => {
      if (!segment || segment.startsWith("`") || /^\[[^\]]+\]\([^)]+\)$/.test(segment)) {
        return segment;
      }

      let next = segment;
      for (const { product, alias } of sorted) {
        const pattern = new RegExp(`(^|[^\\w])(${escapeRegex(alias)})(?![\\w])`, "gi");
        next = next.replace(pattern, (match, prefix, name) => {
          if (match.includes("](/products/")) return match;
          return `${prefix}[${escapeMarkdown(name)}](/products/${product.id})`;
        });
      }
      return next;
    })
    .join("");
}

export function findMentionedProducts(markdown: string, products: Product[]) {
  const text = normalize(markdown);
  if (!text) return [];

  const byId = new Map<string, Product>();
  for (const { product, alias } of productMatchers(products)) {
    const normalizedAlias = normalize(alias);
    if (normalizedAlias && text.includes(normalizedAlias)) {
      byId.set(product.id, product);
    }
  }

  return [...byId.values()];
}

export function productHref(productId: string) {
  return `/products/${productId}`;
}

export function productIdFromHref(href?: string) {
  const match = href?.match(/^\/products\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
