"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api, type ProfileData } from "@/lib/api";
import ProductSearch from "@/components/ProductSearch/ProductSearch";
import styles from "./ProfileTab.module.scss";

const SELECT_OPTIONS = {
  gender: ["Female", "Male", "Non-binary", "Prefer not to say"],
  skin_type: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
  skin_tone: ["Very fair", "Fair", "Light", "Medium", "Olive", "Tan", "Deep", "Very deep"],
  undertone: ["Cool", "Warm", "Neutral", "Not sure"],
  climate: [
    "Hot & humid",
    "Hot & dry",
    "Temperate",
    "Cold & dry",
    "Cold & humid",
    "Tropical",
    "Varies by season",
  ],
  budget: [
    "Drugstore only",
    "Drugstore + mid-range",
    "Mid-range",
    "Mid-range + luxury",
    "No budget limit",
  ],
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  const save = useCallback((data: Partial<ProfileData>) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      api.updateProfile(data);
    }, 500);
  }, []);

  function update(field: keyof ProfileData, value: string) {
    if (!profile) return;
    const next = { ...profile, [field]: value };
    setProfile(next);
    save(next);
  }

  function updateProducts(ids: string[]) {
    if (!profile) return;
    const next = { ...profile, products: ids };
    setProfile(next);
    save(next);
  }

  if (!profile) return <div className={styles.loading}>Loading profile...</div>;

  return (
    <div className={styles.container}>
      <h2>Tell us about yourself</h2>
      <p className={styles.notice}>
        All fields are optional. Your profile is saved to the server and sent as context with every
        chat message.
      </p>

      <div className={styles.formGroup}>
        <label>Age</label>
        <input
          type="number"
          min={10}
          max={120}
          placeholder="e.g. 28"
          value={profile.age || ""}
          onChange={(e) => update("age", e.target.value)}
        />
      </div>

      {(
        [
          ["gender", "Gender"],
          ["skin_type", "Skin Type"],
          ["skin_tone", "Skin Tone"],
          ["undertone", "Undertone"],
          ["climate", "Living Climate"],
        ] as const
      ).map(([field, label]) => (
        <div className={styles.formGroup} key={field}>
          <label>{label}</label>
          <select
            value={profile[field] || ""}
            onChange={(e) => update(field, e.target.value)}
          >
            <option value="">-- select --</option>
            {SELECT_OPTIONS[field].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}

      <div className={styles.formGroup}>
        <label>Known Allergies / Sensitivities</label>
        <textarea
          placeholder="e.g. fragrance, parabens, latex, nickel..."
          value={profile.allergies || ""}
          onChange={(e) => update("allergies", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Current Skincare / Makeup Routine</label>
        <p className={styles.subnotice}>Search and add products you currently use.</p>
        <ProductSearch selected={profile.products} onChange={updateProducts} />
      </div>

      <div className={styles.formGroup}>
        <label>Budget Preference</label>
        <select
          value={profile.budget || ""}
          onChange={(e) => update("budget", e.target.value)}
        >
          <option value="">-- select --</option>
          {SELECT_OPTIONS.budget.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Anything Else</label>
        <textarea
          placeholder="Vegan-only products, cruelty-free, specific brands you love or hate..."
          value={profile.extra || ""}
          onChange={(e) => update("extra", e.target.value)}
        />
      </div>
    </div>
  );
}
