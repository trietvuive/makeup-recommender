"use client";

import { useState, useRef, useEffect } from "react";
import { PRODUCTS, PRODUCT_MAP, type Product } from "@/lib/products";
import styles from "./ProductSearch.module.scss";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductSearch({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const q = query.toLowerCase().trim();
  const matches = q
    ? PRODUCTS.filter(
        (p) =>
          !selected.includes(p.id) &&
          (p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q) ||
            p.keyIngredients.toLowerCase().includes(q))
      ).slice(0, 8)
    : [];

  function add(id: string) {
    onChange([...selected, id]);
    setQuery("");
    setOpen(false);
  }

  function remove(id: string) {
    onChange(selected.filter((x) => x !== id));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchWrap} ref={wrapRef}>
        <span className={styles.searchIcon}>&#128269;</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          placeholder="Search products... e.g. CeraVe, moisturizer, sunscreen"
          autoComplete="off"
        />
        {open && matches.length > 0 && (
          <div className={styles.dropdown}>
            {matches.map((p) => (
              <div key={p.id} className={styles.option} onClick={() => add(p.id)}>
                <img src={p.img} alt="" loading="lazy" />
                <div className={styles.optionInfo}>
                  <div className={styles.optionName}>{p.name}</div>
                  <div className={styles.optionMeta}>
                    {p.category} &middot; {p.type} &middot; {p.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.addedList}>
        {selected.length === 0 && (
          <div className={styles.empty}>No products added yet.</div>
        )}
        {selected.map((id) => {
          const p = PRODUCT_MAP[id];
          if (!p) return null;
          return (
            <div key={id} className={styles.addedItem}>
              <img src={p.img} alt="" loading="lazy" />
              <div className={styles.addedInfo}>
                <div className={styles.addedName}>{p.name}</div>
                <div className={styles.addedMeta}>
                  {p.category} &middot; {p.keyIngredients} &middot; {p.price}
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => remove(id)} title="Remove">
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
