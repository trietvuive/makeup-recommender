"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type Product } from "@/lib/api";
import styles from "./page.module.scss";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getProduct(params.id).then((data) => {
      if (!cancelled) {
        setProduct(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const purchaseLinks = useMemo(() => {
    if (!product) return [];
    const query = encodeURIComponent(`${product.brand} ${product.name}`);
    return [
      { label: "Search Google Shopping", href: `https://www.google.com/search?tbm=shop&q=${query}` },
      { label: "Search Amazon", href: `https://www.amazon.com/s?k=${query}` },
      { label: `Search ${product.brand}`, href: `https://www.google.com/search?q=${query}+official+store` },
    ];
  }, [product]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>Loading product...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <Link href="/" className={styles.backLink}>Back to glow</Link>
          <h1>Product not found</h1>
          <p>We couldn&apos;t find that product in the catalog.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>Back to glow</Link>
      <section className={styles.card}>
        <div className={styles.imageWrap}>
          <Image
            src={product.img}
            alt={product.name}
            width={900}
            height={900}
            unoptimized
            priority
          />
        </div>
        <div className={styles.details}>
          <span className={styles.brand}>{product.brand}</span>
          <h1>{product.name}</h1>
          <p className={styles.summary}>
            A {product.price.toLowerCase()} {product.category.toLowerCase()} in the catalog,
            best described as a {product.type.toLowerCase()}.
          </p>

          <dl className={styles.attrs}>
            <div>
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{product.type}</dd>
            </div>
            <div>
              <dt>Key ingredients</dt>
              <dd>{product.keyIngredients}</dd>
            </div>
            <div>
              <dt>Price range</dt>
              <dd>{product.price}</dd>
            </div>
          </dl>

          <div className={styles.purchase}>
            <h2>Where to buy</h2>
            <p>These links open purchase searches so you can compare retailers and availability.</p>
            <div className={styles.purchaseLinks}>
              {purchaseLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
