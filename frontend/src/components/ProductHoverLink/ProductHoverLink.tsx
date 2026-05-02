"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api";
import { productHref } from "@/lib/productLinks";
import { formatPriceRange } from "@/lib/price";
import styles from "./ProductHoverLink.module.scss";

interface Props {
  product: Product;
  children: ReactNode;
}

export default function ProductHoverLink({ product, children }: Props) {
  return (
    <span className={styles.wrap}>
      <Link href={productHref(product.productId)} className={styles.link}>
        {children}
      </Link>
      <span className={styles.card} role="tooltip">
        <Image src={product.img} alt="" width={128} height={128} unoptimized />
        <span className={styles.info}>
          <strong>{product.name}</strong>
          <small>{product.brand}</small>
          <span>{product.category} · {product.type}</span>
          <span>{product.keyIngredients}</span>
          <em>{formatPriceRange(product)}</em>
        </span>
      </span>
    </span>
  );
}
