export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  type: string;
  keyIngredients: string;
  price: string;
  img: string;
}

export const PRODUCTS: Product[] = [
  { id: "cerave-hydrating-cleanser", name: "CeraVe Hydrating Facial Cleanser", brand: "CeraVe", category: "Cleanser", type: "Cream cleanser", keyIngredients: "Ceramides, hyaluronic acid", price: "Drugstore", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop" },
  { id: "cetaphil-gentle-cleanser", name: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", category: "Cleanser", type: "Gentle cleanser", keyIngredients: "Niacinamide, vitamin B5", price: "Drugstore", img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=80&h=80&fit=crop" },
  { id: "la-roche-posay-toleriane", name: "La Roche-Posay Toleriane Hydrating Gentle Cleanser", brand: "La Roche-Posay", category: "Cleanser", type: "Cream cleanser", keyIngredients: "Ceramide-3, niacinamide, glycerin", price: "Mid-range", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "paula-choice-cleanser", name: "Paula's Choice CLEAR Pore Normalizing Cleanser", brand: "Paula's Choice", category: "Cleanser", type: "Gel cleanser", keyIngredients: "Salicylic acid 0.5%", price: "Mid-range", img: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=80&h=80&fit=crop" },
  { id: "cerave-moisturizing-cream", name: "CeraVe Moisturizing Cream", brand: "CeraVe", category: "Moisturizer", type: "Rich cream", keyIngredients: "Ceramides, hyaluronic acid, MVE technology", price: "Drugstore", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=80&h=80&fit=crop" },
  { id: "neutrogena-hydro-boost", name: "Neutrogena Hydro Boost Water Gel", brand: "Neutrogena", category: "Moisturizer", type: "Lightweight gel", keyIngredients: "Hyaluronic acid", price: "Drugstore", img: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=80&h=80&fit=crop" },
  { id: "tatcha-water-cream", name: "Tatcha The Water Cream", brand: "Tatcha", category: "Moisturizer", type: "Oil-free moisturizer", keyIngredients: "Japanese wild rose, leopard lily", price: "Luxury", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "clinique-moisture-surge", name: "Clinique Moisture Surge 100H", brand: "Clinique", category: "Moisturizer", type: "Gel-cream", keyIngredients: "Hyaluronic acid, aloe vera", price: "Mid-range", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop" },
  { id: "elta-md-uv-clear", name: "EltaMD UV Clear SPF 46", brand: "EltaMD", category: "Sunscreen", type: "Chemical sunscreen", keyIngredients: "Zinc oxide, niacinamide, hyaluronic acid", price: "Mid-range", img: "https://images.unsplash.com/photo-1532947974-2e3966a7de28?w=80&h=80&fit=crop" },
  { id: "supergoop-unseen", name: "Supergoop! Unseen Sunscreen SPF 40", brand: "Supergoop!", category: "Sunscreen", type: "Invisible sunscreen", keyIngredients: "Red algae, meadowfoam seed", price: "Mid-range", img: "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=80&h=80&fit=crop" },
  { id: "la-roche-posay-anthelios", name: "La Roche-Posay Anthelios Melt-In SPF 60", brand: "La Roche-Posay", category: "Sunscreen", type: "Chemical sunscreen", keyIngredients: "Cell-Ox Shield technology", price: "Mid-range", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&h=80&fit=crop" },
  { id: "the-ordinary-niacinamide", name: "The Ordinary Niacinamide 10% + Zinc 1%", brand: "The Ordinary", category: "Serum", type: "Oil-control serum", keyIngredients: "Niacinamide 10%, zinc PCA 1%", price: "Drugstore", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop" },
  { id: "the-ordinary-hyaluronic", name: "The Ordinary Hyaluronic Acid 2% + B5", brand: "The Ordinary", category: "Serum", type: "Hydrating serum", keyIngredients: "Multi-weight hyaluronic acid, vitamin B5", price: "Drugstore", img: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=80&h=80&fit=crop" },
  { id: "skinceuticals-ce-ferulic", name: "SkinCeuticals C E Ferulic", brand: "SkinCeuticals", category: "Serum", type: "Vitamin C serum", keyIngredients: "15% L-ascorbic acid, vitamin E, ferulic acid", price: "Luxury", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "paula-choice-bha", name: "Paula's Choice 2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: "Serum", type: "Chemical exfoliant", keyIngredients: "2% salicylic acid, green tea", price: "Mid-range", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },
  { id: "cerave-retinol-serum", name: "CeraVe Resurfacing Retinol Serum", brand: "CeraVe", category: "Retinol", type: "Retinol serum", keyIngredients: "Encapsulated retinol, ceramides, niacinamide", price: "Drugstore", img: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop" },
  { id: "differin-gel", name: "Differin Adapalene Gel 0.1%", brand: "Differin", category: "Retinol", type: "Retinoid treatment", keyIngredients: "Adapalene 0.1%", price: "Drugstore", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop" },
  { id: "maybelline-fit-me", name: "Maybelline Fit Me Matte + Poreless Foundation", brand: "Maybelline", category: "Foundation", type: "Liquid foundation", keyIngredients: "Micro-powders, oil-free", price: "Drugstore", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=80&h=80&fit=crop" },
  { id: "loreal-true-match", name: "L'Oreal True Match Super-Blendable Foundation", brand: "L'Oreal", category: "Foundation", type: "Liquid foundation", keyIngredients: "Hyaluronic acid, glycerin", price: "Drugstore", img: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=80&h=80&fit=crop" },
  { id: "nars-sheer-glow", name: "NARS Sheer Glow Foundation", brand: "NARS", category: "Foundation", type: "Luminous foundation", keyIngredients: "Turmeric extract, vitamin E", price: "Luxury", img: "https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=80&h=80&fit=crop" },
  { id: "fenty-pro-filtr", name: "Fenty Beauty Pro Filt'r Soft Matte Foundation", brand: "Fenty Beauty", category: "Foundation", type: "Matte foundation", keyIngredients: "Climate-adaptive technology", price: "Mid-range", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "maybelline-instant-age", name: "Maybelline Instant Age Rewind Concealer", brand: "Maybelline", category: "Concealer", type: "Under-eye concealer", keyIngredients: "Goji berry, Haloxyl", price: "Drugstore", img: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=80&h=80&fit=crop" },
  { id: "nars-radiant-creamy", name: "NARS Radiant Creamy Concealer", brand: "NARS", category: "Concealer", type: "Full coverage concealer", keyIngredients: "Multi-action botanical blend", price: "Mid-range", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=80&h=80&fit=crop" },
  { id: "maybelline-lash-sensational", name: "Maybelline Lash Sensational Sky High Mascara", brand: "Maybelline", category: "Mascara", type: "Lengthening mascara", keyIngredients: "Bamboo extract, fiber-infused", price: "Drugstore", img: "https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=80&h=80&fit=crop" },
  { id: "benefit-they-real", name: "Benefit They're Real! Lengthening Mascara", brand: "Benefit", category: "Mascara", type: "Lengthening mascara", keyIngredients: "Provitamin B5", price: "Mid-range", img: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=80&h=80&fit=crop" },
  { id: "mac-ruby-woo", name: "MAC Ruby Woo Lipstick", brand: "MAC", category: "Lip", type: "Matte lipstick", keyIngredients: "Color-lock technology", price: "Mid-range", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=80&h=80&fit=crop" },
  { id: "rare-beauty-lip-souffle", name: "Rare Beauty Soft Pinch Liquid Blush", brand: "Rare Beauty", category: "Blush", type: "Liquid blush", keyIngredients: "Weightless, long-wear", price: "Mid-range", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "laneige-lip-mask", name: "Laneige Lip Sleeping Mask", brand: "Laneige", category: "Lip", type: "Overnight lip treatment", keyIngredients: "Berry mix, vitamin C, shea butter", price: "Mid-range", img: "https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=80&h=80&fit=crop" },
  { id: "elf-power-grip-primer", name: "e.l.f. Power Grip Primer", brand: "e.l.f.", category: "Primer", type: "Gel primer", keyIngredients: "Hyaluronic acid, glycerin", price: "Drugstore", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "nyx-matte-setting-spray", name: "NYX Matte Finish Setting Spray", brand: "NYX", category: "Setting Spray", type: "Matte setting spray", keyIngredients: "Long-wear formula", price: "Drugstore", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "urban-decay-all-nighter", name: "Urban Decay All Nighter Setting Spray", brand: "Urban Decay", category: "Setting Spray", type: "Long-lasting setting spray", keyIngredients: "Temperature control technology", price: "Mid-range", img: "https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=80&h=80&fit=crop" },
  { id: "urban-decay-naked3", name: "Urban Decay Naked3 Eyeshadow Palette", brand: "Urban Decay", category: "Eyeshadow", type: "Rose-toned palette", keyIngredients: "12 rose-hued shades", price: "Mid-range", img: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=80&h=80&fit=crop" },
  { id: "stila-liquid-eyeshadow", name: "Stila Glitter & Glow Liquid Eye Shadow", brand: "Stila", category: "Eyeshadow", type: "Liquid glitter shadow", keyIngredients: "Lightweight pearl, glitter", price: "Mid-range", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=80&h=80&fit=crop" },
  { id: "cosrx-snail-mucin", name: "COSRX Advanced Snail 96 Mucin Power Essence", brand: "COSRX", category: "Essence", type: "Hydrating essence", keyIngredients: "96% snail mucin", price: "Mid-range", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },
  { id: "the-ordinary-aha-bha", name: "The Ordinary AHA 30% + BHA 2% Peeling Solution", brand: "The Ordinary", category: "Exfoliant", type: "Chemical peel", keyIngredients: "Glycolic acid 30%, salicylic acid 2%", price: "Drugstore", img: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop" },
  { id: "drunk-elephant-protini", name: "Drunk Elephant Protini Polypeptide Cream", brand: "Drunk Elephant", category: "Moisturizer", type: "Peptide moisturizer", keyIngredients: "Signal peptides, amino acids", price: "Luxury", img: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=80&h=80&fit=crop" },

  // Korean skincare — Sulwhasoo
  { id: "sulwhasoo-first-care", name: "Sulwhasoo First Care Activating Serum", brand: "Sulwhasoo", category: "Serum", type: "Activating serum", keyIngredients: "JAUM Activator, Korean red pine, peony", price: "Luxury", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "sulwhasoo-overnight-mask", name: "Sulwhasoo Overnight Vitalizing Mask", brand: "Sulwhasoo", category: "Mask", type: "Overnight sleeping mask", keyIngredients: "Korean ginseng, honey", price: "Luxury", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "sulwhasoo-essential-comfort", name: "Sulwhasoo Essential Comfort Moisturizing Cream", brand: "Sulwhasoo", category: "Moisturizer", type: "Rich moisturizer", keyIngredients: "Korean ginseng, apricot kernel oil", price: "Luxury", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=80&h=80&fit=crop" },
  { id: "sulwhasoo-gentle-cleanser", name: "Sulwhasoo Gentle Cleansing Foam", brand: "Sulwhasoo", category: "Cleanser", type: "Foam cleanser", keyIngredients: "Lotus flower, lily extract", price: "Luxury", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop" },
  { id: "sulwhasoo-concentrated-ginseng", name: "Sulwhasoo Concentrated Ginseng Renewing Cream", brand: "Sulwhasoo", category: "Moisturizer", type: "Anti-aging cream", keyIngredients: "Concentrated ginseng, ginsenoside", price: "Luxury", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop" },

  // Korean skincare — Laneige
  { id: "laneige-water-sleeping-mask", name: "Laneige Water Sleeping Mask", brand: "Laneige", category: "Mask", type: "Overnight sleeping mask", keyIngredients: "Hydro Ionized Mineral Water, squalane", price: "Mid-range", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },
  { id: "laneige-cream-skin-refiner", name: "Laneige Cream Skin Cerapeptide Refiner", brand: "Laneige", category: "Toner", type: "Milky toner", keyIngredients: "Ceramides, peptides", price: "Mid-range", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },
  { id: "laneige-water-bank-moisturizer", name: "Laneige Water Bank Blue Hyaluronic Cream", brand: "Laneige", category: "Moisturizer", type: "Gel-cream moisturizer", keyIngredients: "Blue hyaluronic acid, squalane", price: "Mid-range", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=80&h=80&fit=crop" },

  // Korean skincare — Innisfree
  { id: "innisfree-green-tea-seed", name: "Innisfree Green Tea Seed Serum", brand: "Innisfree", category: "Serum", type: "Hydrating serum", keyIngredients: "Jeju green tea, green tea seed oil", price: "Drugstore", img: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=80&h=80&fit=crop" },
  { id: "innisfree-volcanic-clay-mask", name: "Innisfree Super Volcanic Pore Clay Mask", brand: "Innisfree", category: "Mask", type: "Clay mask", keyIngredients: "Jeju volcanic cluster, AHA", price: "Drugstore", img: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop" },
  { id: "innisfree-daily-sunscreen", name: "Innisfree Daily UV Defense Sunscreen SPF 36", brand: "Innisfree", category: "Sunscreen", type: "Daily sunscreen", keyIngredients: "Sunflower oil, cica", price: "Drugstore", img: "https://images.unsplash.com/photo-1532947974-2e3966a7de28?w=80&h=80&fit=crop" },

  // Korean skincare — Missha
  { id: "missha-time-revolution-essence", name: "Missha Time Revolution The First Treatment Essence RX", brand: "Missha", category: "Essence", type: "First treatment essence", keyIngredients: "Fermented yeast extract, bifida ferment", price: "Mid-range", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },
  { id: "missha-sunscreen", name: "Missha All Around Safe Block Soft Finish Sun Milk SPF 50+", brand: "Missha", category: "Sunscreen", type: "Lightweight sunscreen", keyIngredients: "Sebum control, botanical extracts", price: "Drugstore", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&h=80&fit=crop" },

  // Korean skincare — Etude House
  { id: "etude-soon-jung-toner", name: "Etude SoonJung pH 5.5 Relief Toner", brand: "Etude", category: "Toner", type: "Gentle relief toner", keyIngredients: "Panthenol, madecassoside", price: "Drugstore", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "etude-soon-jung-barrier-cream", name: "Etude SoonJung 2x Barrier Intensive Cream", brand: "Etude", category: "Moisturizer", type: "Barrier cream", keyIngredients: "Panthenol 2%, madecassoside", price: "Drugstore", img: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=80&h=80&fit=crop" },

  // Korean skincare — Banila Co
  { id: "banila-co-clean-it-zero", name: "Banila Co Clean It Zero Cleansing Balm", brand: "Banila Co", category: "Cleanser", type: "Oil cleansing balm", keyIngredients: "Acerola, vitamin C, hot springs water", price: "Mid-range", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop" },

  // Korean skincare — Beauty of Joseon
  { id: "boj-glow-serum", name: "Beauty of Joseon Glow Serum: Propolis + Niacinamide", brand: "Beauty of Joseon", category: "Serum", type: "Brightening serum", keyIngredients: "Propolis 60%, niacinamide 2%", price: "Drugstore", img: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=80&h=80&fit=crop" },
  { id: "boj-relief-sunscreen", name: "Beauty of Joseon Relief Sun: Rice + Probiotics SPF 50+", brand: "Beauty of Joseon", category: "Sunscreen", type: "Lightweight sunscreen", keyIngredients: "Rice bran, probiotics", price: "Drugstore", img: "https://images.unsplash.com/photo-1532947974-2e3966a7de28?w=80&h=80&fit=crop" },
  { id: "boj-dynasty-cream", name: "Beauty of Joseon Dynasty Cream", brand: "Beauty of Joseon", category: "Moisturizer", type: "Nourishing cream", keyIngredients: "Rice bran water, ginseng", price: "Drugstore", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=80&h=80&fit=crop" },

  // Korean skincare — COSRX (additional)
  { id: "cosrx-aha-bha-toner", name: "COSRX AHA/BHA Clarifying Treatment Toner", brand: "COSRX", category: "Toner", type: "Exfoliating toner", keyIngredients: "AHA, BHA, mineral water", price: "Drugstore", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "cosrx-acne-pimple-patch", name: "COSRX Acne Pimple Master Patch", brand: "COSRX", category: "Treatment", type: "Hydrocolloid patch", keyIngredients: "Hydrocolloid", price: "Drugstore", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop" },
  { id: "cosrx-low-ph-cleanser", name: "COSRX Low pH Good Morning Gel Cleanser", brand: "COSRX", category: "Cleanser", type: "Gel cleanser", keyIngredients: "BHA 0.1%, tea tree oil", price: "Drugstore", img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=80&h=80&fit=crop" },
  { id: "cosrx-birch-sap-moisturizer", name: "COSRX Oil-Free Ultra Moisturizing Lotion with Birch Sap", brand: "COSRX", category: "Moisturizer", type: "Lightweight moisturizer", keyIngredients: "Birch sap 70%, hyaluronic acid", price: "Drugstore", img: "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=80&h=80&fit=crop" },

  // Korean skincare — SKIN1004
  { id: "skin1004-centella-ampoule", name: "SKIN1004 Madagascar Centella Ampoule", brand: "SKIN1004", category: "Serum", type: "Soothing ampoule", keyIngredients: "Madagascar centella asiatica", price: "Drugstore", img: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=80&h=80&fit=crop" },

  // Korean skincare — Purito
  { id: "purito-centella-serum", name: "Purito Centella Unscented Serum", brand: "Purito", category: "Serum", type: "Calming serum", keyIngredients: "Centella asiatica 49%, niacinamide 3%", price: "Drugstore", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },

  // Korean skincare — Klairs
  { id: "klairs-supple-toner", name: "Klairs Supple Preparation Unscented Toner", brand: "Klairs", category: "Toner", type: "Hydrating toner", keyIngredients: "Hyaluronic acid, centella asiatica", price: "Drugstore", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop" },
  { id: "klairs-vitamin-c-serum", name: "Klairs Freshly Juiced Vitamin C Serum", brand: "Klairs", category: "Serum", type: "Vitamin C serum", keyIngredients: "5% ascorbic acid, centella asiatica", price: "Mid-range", img: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop" },

  // Korean skincare — Dr. Jart+
  { id: "drjart-ceramidin-cream", name: "Dr. Jart+ Ceramidin Cream", brand: "Dr. Jart+", category: "Moisturizer", type: "Barrier cream", keyIngredients: "5-Cera Complex, panthenol", price: "Mid-range", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop" },
  { id: "drjart-cicapair-tiger-grass", name: "Dr. Jart+ Cicapair Tiger Grass Color Correcting Treatment SPF 30", brand: "Dr. Jart+", category: "Treatment", type: "Color correcting cream", keyIngredients: "Centella asiatica, niacinamide", price: "Mid-range", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop" },

  // Korean skincare — Amorepacific
  { id: "amorepacific-vintage-essence", name: "Amorepacific Vintage Single Extract Essence", brand: "Amorepacific", category: "Essence", type: "Fermented essence", keyIngredients: "Fermented green tea AMOREPACIFIC", price: "Luxury", img: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=80&h=80&fit=crop" },

  // Korean skincare — Torriden
  { id: "torriden-dive-in-serum", name: "Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum", brand: "Torriden", category: "Serum", type: "Hydrating serum", keyIngredients: "5 types of hyaluronic acid, panthenol", price: "Drugstore", img: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=80&h=80&fit=crop" },
];

export const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
