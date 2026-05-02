"use client";

import { useState, useRef, useEffect } from "react";
import { api, type Product } from "@/lib/api";
import styles from "./ProductSearch.module.scss";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductSearch({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
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

  useEffect(() => {
    let cancelled = false;
    if (selected.length === 0) {
      setSelectedProducts([]);
      return;
    }

    api.getProducts({ ids: selected }).then((products) => {
      if (!cancelled) setSelectedProducts(products);
    });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setMatches([]);
      return;
    }

    const timer = setTimeout(() => {
      api.getProducts({ q, limit: 8 }).then((products) => {
        setMatches(products.filter((p) => !selected.includes(p.id)));
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selected]);

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
          onFocus={() => query.trim() && setOpen(true)}
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
        {selectedProducts.map((p) => {
          return (
            <div key={p.id} className={styles.addedItem}>
              <img src={p.img} alt="" loading="lazy" />
              <div className={styles.addedInfo}>
                <div className={styles.addedName}>{p.name}</div>
                <div className={styles.addedMeta}>
                  {p.category} &middot; {p.keyIngredients} &middot; {p.price}
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => remove(p.id)} title="Remove">
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
