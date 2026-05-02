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
    "Under $20",
    "$20-$45",
    "$45-$120",
    "$120+",
    "No budget limit",
  ],
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        setProfile(data);
        setLoadError(null);
      })
      .catch(() => {
        setLoadError("Unable to load your profile. Please try refreshing in a moment.");
      });
  }, []);

  const save = useCallback((data: Partial<ProfileData>) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      api.updateProfile(data).catch(() => {
        setLoadError("Unable to save your profile changes. Please try again.");
      });
    }, 500);
  }, []);

  function update(field: keyof ProfileData, value: string) {
    if (!profile) return;
    const next = { ...profile, [field]: value };
    setProfile(next);
    save(next);
  }

  function updateProducts(ids: number[]) {
    if (!profile) return;
    const next = { ...profile, products: ids };
    setProfile(next);
    save(next);
  }

  if (!profile) {
    return (
      <div className={styles.loading}>
        {loadError || <div className={styles.spinner} />}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* About You */}
        <section className={styles.card}>
          <div className={styles.cardIcon}>&#9825;</div>
          <h3 className={styles.cardTitle}>About You</h3>
          <p className={styles.cardDesc}>
            Basic details help us personalize every recommendation to your unique needs.
          </p>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Age</label>
              <input
                type="number"
                min={10}
                max={120}
                placeholder="28"
                value={profile.age || ""}
                onChange={(e) => update("age", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Gender</label>
              <select value={profile.gender || ""} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                {SELECT_OPTIONS.gender.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Living Climate</label>
            <select value={profile.climate || ""} onChange={(e) => update("climate", e.target.value)}>
              <option value="">Select your climate</option>
              {SELECT_OPTIONS.climate.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Allergies &amp; Sensitivities</label>
            <textarea
              placeholder="fragrance, parabens, latex, nickel..."
              value={profile.allergies || ""}
              onChange={(e) => update("allergies", e.target.value)}
              rows={2}
            />
          </div>
        </section>

        {/* Your Skin */}
        <section className={styles.card}>
          <div className={styles.cardIcon}>&#10024;</div>
          <h3 className={styles.cardTitle}>Your Skin</h3>
          <p className={styles.cardDesc}>
            Understanding your skin means we&apos;ll never recommend something that won&apos;t work for you.
          </p>

          <div className={styles.field}>
            <label>Skin Type</label>
            <div className={styles.pillGroup}>
              {SELECT_OPTIONS.skin_type.map((o) => (
                <button
                  key={o}
                  className={`${styles.pill} ${profile.skin_type === o ? styles.pillActive : ""}`}
                  onClick={() => update("skin_type", profile.skin_type === o ? "" : o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Skin Tone</label>
            <div className={styles.pillGroup}>
              {SELECT_OPTIONS.skin_tone.map((o) => (
                <button
                  key={o}
                  className={`${styles.pill} ${profile.skin_tone === o ? styles.pillActive : ""}`}
                  onClick={() => update("skin_tone", profile.skin_tone === o ? "" : o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Undertone</label>
            <div className={styles.pillGroup}>
              {SELECT_OPTIONS.undertone.map((o) => (
                <button
                  key={o}
                  className={`${styles.pill} ${profile.undertone === o ? styles.pillActive : ""}`}
                  onClick={() => update("undertone", profile.undertone === o ? "" : o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Your Routine */}
        <section className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardIcon}>&#128139;</div>
          <h3 className={styles.cardTitle}>Your Routine</h3>
          <p className={styles.cardDesc}>
            Add the products you currently love so we can build on what&apos;s already working for you.
          </p>
          <ProductSearch selected={profile.products} onChange={updateProducts} />
        </section>

        {/* Preferences — now full-width */}
        <section className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardIcon}>&#127800;</div>
          <h3 className={styles.cardTitle}>Preferences</h3>
          <p className={styles.cardDesc}>
            Your budget, your values, and anything else that matters to you.
          </p>

          <div className={styles.prefsGrid}>
            <div className={styles.field}>
              <label>Budget</label>
              <div className={styles.pillGroup}>
                {SELECT_OPTIONS.budget.map((o) => (
                  <button
                    key={o}
                    className={`${styles.pill} ${profile.budget === o ? styles.pillActive : ""}`}
                    onClick={() => update("budget", profile.budget === o ? "" : o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Anything else?</label>
              <textarea
                placeholder="Vegan only, cruelty-free, brands you love or avoid..."
                value={profile.extra || ""}
                onChange={(e) => update("extra", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </section>
      </div>

      <p className={styles.footnote}>
        Everything auto-saves. Your profile is used as context when chatting with our AI advisor.
      </p>
    </div>
  );
}
