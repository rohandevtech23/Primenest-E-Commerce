import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Parse .env
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const config = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "primenest_db",
};

const catalog = [
  // ==========================================
  // MEN
  // ==========================================
  {
    categorySlug: "men",
    name: "Supima Heavyweight Crewneck T-Shirt",
    slug: "supima-heavyweight-crewneck-tshirt",
    subcategory: "T-Shirts",
    description: "Crafted from 100% combed Supima cotton with a substantial 240 GSM weight, ribbed collar, and pre-shrunk finish for everyday durability.",
    price: 1299.00,
    stock: 50,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 10 },
      { label: "M", stock: 15 },
      { label: "L", stock: 15 },
      { label: "XL", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "men",
    name: "Vintage Washed Oversized Tee",
    slug: "vintage-washed-oversized-tee",
    subcategory: "T-Shirts",
    description: "Acid-washed relaxed drop-shoulder t-shirt with subtle distressed hem details and an effortless street-style drape.",
    price: 1499.00,
    stock: 40,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 10 },
      { label: "M", stock: 15 },
      { label: "L", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "men",
    name: "Striped Nautical Breton T-Shirt",
    slug: "striped-nautical-breton-tshirt",
    subcategory: "T-Shirts",
    description: "Classic French-inspired horizontal navy and white striped tee in soft breathable slub jersey knit.",
    price: 1399.00,
    stock: 35,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 10 },
      { label: "M", stock: 15 },
      { label: "L", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "men",
    name: "Brushed Flannel Plaid Shirt",
    slug: "brushed-flannel-plaid-shirt",
    subcategory: "Casual Shirts",
    description: "Double-brushed cotton flannel shirt with classic buffalo check pattern, dual chest pockets, and durable horn buttons.",
    price: 2199.00,
    stock: 30,
    variant_label: "Size",
    variants: [
      { label: "M", stock: 15 },
      { label: "L", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "men",
    name: "Heritage Suede Bomber Jacket",
    slug: "heritage-suede-bomber-jacket",
    subcategory: "Jackets",
    description: "Luxurious goatskin suede jacket featuring rib-knit baseball collar, two-way brass zipper, and smooth satin lining.",
    price: 5499.00,
    stock: 15,
    variant_label: "Size",
    variants: [
      { label: "M", stock: 7 },
      { label: "L", stock: 8 }
    ],
    image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "men",
    name: "Pleated Tapered Cotton Chinos",
    slug: "pleated-tapered-cotton-chinos",
    subcategory: "Casual Trousers",
    description: "Refined garment-dyed twill trousers with single front pleats, slanted side pockets, and clean tailored taper.",
    price: 2299.00,
    stock: 30,
    variant_label: "Waist",
    variants: [
      { label: "30", stock: 8 },
      { label: "32", stock: 12 },
      { label: "34", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // WOMEN
  // ==========================================
  {
    categorySlug: "women",
    name: "Tiered Floral Chiffon Midi Dress",
    slug: "tiered-floral-chiffon-midi-dress",
    subcategory: "Dresses",
    description: "Romantic ruffled midi dress in airy floral chiffon with smocked waistline, flutter sleeves, and breathable inner slip.",
    price: 3199.00,
    stock: 25,
    variant_label: "Size",
    variants: [
      { label: "XS", stock: 5 },
      { label: "S", stock: 10 },
      { label: "M", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "women",
    name: "Ribbed Knit Wrap Dress",
    slug: "ribbed-knit-wrap-dress",
    subcategory: "Dresses",
    description: "Flattering body-skimming wrap dress in fine viscose-blend rib knit with adjustable waist tie and midi length hem.",
    price: 2899.00,
    stock: 20,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 8 },
      { label: "M", stock: 12 }
    ],
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "women",
    name: "Silk Satin Camisole Top",
    slug: "silk-satin-camisole-top",
    subcategory: "Tops",
    description: "Lustrous mulberry silk cami with gentle V-neckline, adjustable spaghetti straps, and delicate bias-cut silhouette.",
    price: 1699.00,
    stock: 35,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 15 },
      { label: "M", stock: 15 },
      { label: "L", stock: 5 }
    ],
    image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "women",
    name: "Puff Sleeve Embroidered Blouse",
    slug: "puff-sleeve-embroidered-blouse",
    subcategory: "Tops",
    description: "Vintage-inspired cotton blouse with delicate tonal broderie anglaise embroidery, statement puff sleeves, and mother-of-pearl buttons.",
    price: 1999.00,
    stock: 28,
    variant_label: "Size",
    variants: [
      { label: "S", stock: 10 },
      { label: "M", stock: 12 },
      { label: "L", stock: 6 }
    ],
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "women",
    name: "Organic Cotton Boxy Crop Tee",
    slug: "organic-cotton-boxy-crop-tee",
    subcategory: "T-Shirts",
    description: "Boxy everyday tee with dropped shoulders and cropped length, knit from 100% GOTS-certified organic cotton.",
    price: 999.00,
    stock: 45,
    variant_label: "Size",
    variants: [
      { label: "XS", stock: 10 },
      { label: "S", stock: 15 },
      { label: "M", stock: 15 },
      { label: "L", stock: 5 }
    ],
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "women",
    name: "High-Rise Wide Leg Vintage Jeans",
    slug: "high-rise-wide-leg-vintage-jeans",
    subcategory: "Jeans",
    description: "Authentic 90s inspired rigid cotton denim with ultra high-rise waist, relaxed wide-leg cut, and vintage medium indigo wash.",
    price: 2699.00,
    stock: 30,
    variant_label: "Waist",
    variants: [
      { label: "26", stock: 6 },
      { label: "28", stock: 12 },
      { label: "30", stock: 12 }
    ],
    image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // ACCESSORIES
  // ==========================================
  {
    categorySlug: "accessories",
    name: "Chronograph Stainless Steel Watch",
    slug: "chronograph-stainless-steel-watch",
    subcategory: "Watches",
    description: "Engineered with sapphire crystal glass, three sub-dials, water resistance up to 50 meters, and solid link steel bracelet.",
    price: 4999.00,
    stock: 15,
    variant_label: "Dial Color",
    variants: [
      { label: "Sunburst Silver", stock: 8 },
      { label: "Midnight Blue", stock: 7 }
    ],
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "accessories",
    name: "Structured Crossbody Saddle Bag",
    slug: "structured-crossbody-saddle-bag",
    subcategory: "Handbags",
    description: "Compact equestrian-inspired curved saddle bag in smooth vegetable-tanned leather with antique gold magnetic buckle.",
    price: 2599.00,
    stock: 20,
    variant_label: "Color",
    variants: [
      { label: "Burgundy", stock: 10 },
      { label: "Warm Tan", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "accessories",
    name: "Urban Canvas & Leather Rucksack",
    slug: "urban-canvas-leather-rucksack",
    subcategory: "Backpacks",
    description: "Heavy-duty 18oz water-repellent duck canvas backpack trimmed with bridle leather straps and padded 15-inch laptop sleeve.",
    price: 2899.00,
    stock: 22,
    variant_label: "Color",
    variants: [
      { label: "Olive Green", stock: 12 },
      { label: "Charcoal Grey", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "accessories",
    name: "Polarized Retro Aviator Sunglasses",
    slug: "polarized-retro-aviator-sunglasses",
    subcategory: "Sunglasses",
    description: "Classic teardrop gold-tone metal frame with scratch-resistant polarized gradient green lenses providing 100% UV400 protection.",
    price: 1799.00,
    stock: 30,
    variant_label: "Frame",
    variants: [
      { label: "Gold / Green", stock: 15 },
      { label: "Matte Black", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "accessories",
    name: "Full-Grain Italian Bifold Wallet",
    slug: "full-grain-italian-bifold-wallet",
    subcategory: "Wallets",
    description: "Slim profile wallet crafted from vegetable-tanned Tuscan leather with 8 card slots, dual currency sleeves, and RFID blocking mesh.",
    price: 1299.00,
    stock: 40,
    variant_label: "Leather",
    variants: [
      { label: "Cognac Brown", stock: 20 },
      { label: "Obsidian Black", stock: 20 }
    ],
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // HOME ESSENTIALS
  // ==========================================
  {
    categorySlug: "home-essentials",
    name: "Handmade Ceramic Sculptural Vase",
    slug: "handmade-ceramic-sculptural-vase",
    subcategory: "Vases",
    description: "Modern organic double-loop ceramic vase with textured matte chalk finish, stunning as an art centerpiece or with dried botanicals.",
    price: 1499.00,
    stock: 25,
    variant_label: "Color",
    variants: [
      { label: "Off White", stock: 15 },
      { label: "Terracotta", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "home-essentials",
    name: "Minimalist Brass Wall Clock",
    slug: "minimalist-brass-wall-clock",
    subcategory: "Clocks",
    description: "12-inch spun brass wall clock with silent non-ticking quartz sweep movement and brushed metallic satin dial.",
    price: 2199.00,
    stock: 18,
    variant_label: "Finish",
    variants: [
      { label: "Brushed Brass", stock: 10 },
      { label: "Matte Black", stock: 8 }
    ],
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "home-essentials",
    name: "Abstract Framed Canvas Art",
    slug: "abstract-framed-canvas-art",
    subcategory: "Wall Art",
    description: "Gallery-wrapped canvas featuring minimalist neutral earth tones, housed in an FSC-certified natural oak wood floating frame.",
    price: 2999.00,
    stock: 15,
    variant_label: "Size",
    variants: [
      { label: "50x70 cm", stock: 8 },
      { label: "70x100 cm", stock: 7 }
    ],
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "home-essentials",
    name: "Pure Belgian Linen Bedding Duvet Set",
    slug: "pure-belgian-linen-bedding-duvet-set",
    subcategory: "Bedding",
    description: "Pre-washed breathable 100% French flax linen duvet cover with matching pair of pillowcases that gets softer with every wash.",
    price: 4499.00,
    stock: 20,
    variant_label: "Bed Size",
    variants: [
      { label: "Queen", stock: 12 },
      { label: "King", stock: 8 }
    ],
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "home-essentials",
    name: "Textured Boucle Throw Pillow Cover",
    slug: "textured-boucle-throw-pillow-cover",
    subcategory: "Cushion Covers",
    description: "Set of 2 cozy tactile boucle cushion covers with concealed heavy-duty metal zipper for plush living room comfort.",
    price: 899.00,
    stock: 35,
    variant_label: "Color",
    variants: [
      { label: "Oatmeal Cream", stock: 20 },
      { label: "Charcoal", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // PERFUME
  // ==========================================
  {
    categorySlug: "perfume",
    name: "Smoky Vetiver & Black Pepper Cologne",
    slug: "smoky-vetiver-black-pepper-cologne",
    subcategory: "Men's Perfume",
    description: "An invigorating opening of Madagascar black pepper grounded by earthy Haitian vetiver, charred birchwood, and leather accord.",
    price: 3199.00,
    stock: 30,
    variant_label: "Size",
    variants: [
      { label: "50ml", stock: 15 },
      { label: "100ml", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "perfume",
    name: "Velvet Rose & Vanilla Eau de Parfum",
    slug: "velvet-rose-vanilla-eau-de-parfum",
    subcategory: "Women's Perfume",
    description: "Opulent Damask rose absolute enriched with bourbon vanilla, crushed praline, and warm patchouli base notes.",
    price: 3499.00,
    stock: 28,
    variant_label: "Size",
    variants: [
      { label: "50ml", stock: 14 },
      { label: "100ml", stock: 14 }
    ],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "perfume",
    name: "Citrus Bloom & Jasmine Mist",
    slug: "citrus-bloom-jasmine-mist",
    subcategory: "Women's Perfume",
    description: "Fresh sparkling Italian mandarin and dewy jasmine petals softened with solar white musks for a luminous spring trail.",
    price: 1899.00,
    stock: 40,
    variant_label: "Size",
    variants: [
      { label: "100ml", stock: 40 }
    ],
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // FOOTWEAR
  // ==========================================
  {
    categorySlug: "footwear",
    name: "Retro Gumsole Canvas Trainers",
    slug: "retro-gumsole-canvas-trainers",
    subcategory: "Casual Shoes",
    description: "Vintage court-style trainers in heavy-duty washed cotton canvas with vulcanized natural gum rubber foxing and cushioned ortholite bed.",
    price: 2299.00,
    stock: 35,
    variant_label: "Shoe Size",
    variants: [
      { label: "UK 7", stock: 8 },
      { label: "UK 8", stock: 12 },
      { label: "UK 9", stock: 10 },
      { label: "UK 10", stock: 5 }
    ],
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "footwear",
    name: "Strappy Leather Kitten Heels",
    slug: "strappy-leather-kitten-heels",
    subcategory: "Women's Heels",
    description: "Sleek 50mm architectural kitten heel sandals with slender asymmetrical straps, square toe bed, and memory-foam padded footbed.",
    price: 2999.00,
    stock: 25,
    variant_label: "Shoe Size",
    variants: [
      { label: "UK 4", stock: 6 },
      { label: "UK 5", stock: 10 },
      { label: "UK 6", stock: 9 }
    ],
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "footwear",
    name: "Pointed-Toe Suede Mules",
    slug: "pointed-toe-suede-mules",
    subcategory: "Flats",
    description: "Effortless backless flat mules in rich velvet suede with elongating pointed toe profile and flexible leather outsole.",
    price: 2499.00,
    stock: 24,
    variant_label: "Shoe Size",
    variants: [
      { label: "UK 4", stock: 6 },
      { label: "UK 5", stock: 10 },
      { label: "UK 6", stock: 8 }
    ],
    image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // KIDS
  // ==========================================
  {
    categorySlug: "kids",
    name: "Dino Graphic Explorer Crew Tee",
    slug: "dino-graphic-explorer-crew-tee",
    subcategory: "T-Shirts",
    description: "Fun retro hand-drawn dinosaur illustration screen-printed on super-soft combed cotton jersey with tagless comfort collar.",
    price: 799.00,
    stock: 40,
    variant_label: "Age",
    variants: [
      { label: "3-4Y", stock: 10 },
      { label: "5-6Y", stock: 15 },
      { label: "7-8Y", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "kids",
    name: "Comfort Stretch Kids Denim Jeans",
    slug: "comfort-stretch-kids-denim-jeans",
    subcategory: "Jeans",
    description: "Durable active-play kids jeans engineered with 4-way stretch denim, reinforced knee panels, and adjustable inner waistband.",
    price: 1499.00,
    stock: 30,
    variant_label: "Age",
    variants: [
      { label: "4-5Y", stock: 10 },
      { label: "6-7Y", stock: 10 },
      { label: "8-9Y", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "kids",
    name: "Floral Ruffled Tiered Party Dress",
    slug: "floral-ruffled-tiered-party-dress",
    subcategory: "Dresses",
    description: "Festive meadow-print party frock in soft modal satin with twirl-worthy tiered ruffle skirt and delicate keyhole button back.",
    price: 1899.00,
    stock: 25,
    variant_label: "Age",
    variants: [
      { label: "3-4Y", stock: 8 },
      { label: "5-6Y", stock: 10 },
      { label: "7-8Y", stock: 7 }
    ],
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "kids",
    name: "Embroidered Cotton Peplum Top",
    slug: "embroidered-cotton-peplum-top",
    subcategory: "Tops",
    description: "Sweet scalloped hem peplum top with hand-embroidered daisy motifs and pure breathable double-gauze cotton weave.",
    price: 999.00,
    stock: 32,
    variant_label: "Age",
    variants: [
      { label: "2-3Y", stock: 10 },
      { label: "4-5Y", stock: 12 },
      { label: "6-7Y", stock: 10 }
    ],
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85"
  },

  // ==========================================
  // BEAUTY
  // ==========================================
  {
    categorySlug: "beauty",
    name: "Radiance Gentle Foaming Face Wash",
    slug: "radiance-gentle-foaming-face-wash",
    subcategory: "Face Wash",
    description: "Sulfate-free pH-balanced gel cleanser enriched with Centella Asiatica and green tea extract to melt away impurities without stripping.",
    price: 899.00,
    stock: 45,
    variant_label: "Volume",
    variants: [
      { label: "150ml", stock: 45 }
    ],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "beauty",
    name: "Daily Invisible Gel Sunscreen SPF 50",
    slug: "daily-invisible-gel-sunscreen-spf50",
    subcategory: "Sunscreen",
    description: "Ultra-weightless broad-spectrum UVA/UVB protection with zero white cast, velvety matte primer finish, and water-resistance up to 80 mins.",
    price: 1099.00,
    stock: 50,
    variant_label: "Size",
    variants: [
      { label: "50g", stock: 50 }
    ],
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "beauty",
    name: "Ceramide Barrier Moisture Cream",
    slug: "ceramide-barrier-moisture-cream",
    subcategory: "Moisturizers",
    description: "Rich lipid-replenishing barrier balm formulated with 5 essential ceramides, squalane, and colloidal oat to deeply restore dry skin.",
    price: 1399.00,
    stock: 40,
    variant_label: "Size",
    variants: [
      { label: "50ml", stock: 25 },
      { label: "100ml", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1608248597359-2ffb76251b54?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "beauty",
    name: "Velvet Matte Moisture Lipstick",
    slug: "velvet-matte-moisture-lipstick",
    subcategory: "Lipstick",
    description: "Non-drying weightless matte lipstick packed with nourishing jojoba oil and vitamin E for vivid full-coverage 12-hour wear.",
    price: 1199.00,
    stock: 60,
    variant_label: "Shade",
    variants: [
      { label: "Dusty Rose", stock: 20 },
      { label: "Classic Crimson", stock: 20 },
      { label: "Warm Nude", stock: 20 }
    ],
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85"
  },
  {
    categorySlug: "beauty",
    name: "Luminous Skin Tint Foundation",
    slug: "luminous-skin-tint-foundation",
    subcategory: "Foundation",
    description: "Breathable light-to-medium sheer foundation infused with hydrating hyaluronic spheres for a fresh healthy glass-skin finish.",
    price: 1699.00,
    stock: 45,
    variant_label: "Shade",
    variants: [
      { label: "Fair Neutral", stock: 15 },
      { label: "Medium Warm", stock: 15 },
      { label: "Tan Golden", stock: 15 }
    ],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85"
  }
];

async function seed() {
  const { Client } = pg;
  const client = new Client(config);

  try {
    await client.connect();
    console.log(`Connected to database "${config.database}"`);

    // Fetch category map
    const catRes = await client.query("SELECT id, slug FROM categories");
    const catMap = new Map(catRes.rows.map((r) => [r.slug, r.id]));

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of catalog) {
      const catId = catMap.get(item.categorySlug);
      if (!catId) {
        console.warn(`Category slug "${item.categorySlug}" not found in database. Skipping.`);
        continue;
      }

      // Check if product exists by slug
      const existing = await client.query(
        "SELECT id FROM products WHERE slug = $1",
        [item.slug]
      );

      let productId;
      if (existing.rowCount === 0) {
        const insertRes = await client.query(
          `INSERT INTO products
            (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            item.name,
            item.slug,
            item.description,
            item.price,
            item.stock,
            catId,
            item.subcategory,
            JSON.stringify(item.variants),
            item.variant_label
          ]
        );
        productId = insertRes.rows[0].id;
        insertedCount++;
      } else {
        productId = existing.rows[0].id;
        await client.query(
          `UPDATE products
           SET name = $1,
               description = $2,
               price = $3,
               stock = $4,
               category_id = $5,
               subcategory = $6,
               variants = $7,
               variant_label = $8,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $9`,
          [
            item.name,
            item.description,
            item.price,
            item.stock,
            catId,
            item.subcategory,
            JSON.stringify(item.variants),
            item.variant_label,
            productId
          ]
        );
        updatedCount++;
      }

      // Ensure primary image exists
      const imgCheck = await client.query(
        "SELECT id FROM product_images WHERE product_id = $1 AND is_primary = TRUE",
        [productId]
      );

      if (imgCheck.rowCount === 0) {
        await client.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)",
          [productId, item.image]
        );
      } else {
        await client.query(
          "UPDATE product_images SET image_url = $1 WHERE id = $2",
          [item.image, imgCheck.rows[0].id]
        );
      }
    }

    console.log(`\nCatalog seeding complete!`);
    console.log(`- New products added: ${insertedCount}`);
    console.log(`- Existing products updated: ${updatedCount}`);

    // Print breakdown per category
    const statsRes = await client.query(`
      SELECT c.name as category, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
    `);

    console.log("\nProducts per Category:");
    for (const row of statsRes.rows) {
      console.log(`  * ${row.category.padEnd(18)}: ${row.product_count} products`);
    }

    const totalRes = await client.query("SELECT COUNT(*) as total FROM products");
    console.log(`\nTotal Products in Store: ${totalRes.rows[0].total}`);

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
