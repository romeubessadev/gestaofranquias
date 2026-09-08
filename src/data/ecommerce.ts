/**
 * Mock data fixtures for the Ecommerce domain (products, orders, customers,
 * reviews, coupons, promotions, categories). Status/segment fields are plain
 * strings so <Badge status="..."> can resolve colors via lib/status.
 */

/**
 * Real product photos keyed by product id (Unsplash CDN). Used by ProductThumb,
 * which falls back to the emoji-on-gradient placeholder if an image fails to
 * load. Sized/cropped via query params.
 */
const IMG = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=70`;

export const productImages: Record<string, string> = {
  p1: IMG("1505740420928-5e560c06d30e"), // headphones
  p2: IMG("1553062407-98eeb64c6a62"), // leather backpack
  p3: IMG("1523275335684-37898b6baf30"), // smart watch
  p4: IMG("1495474472287-4d71bcdd2085"), // pour-over coffee
  p5: IMG("1517649763962-0c623066013b"), // athletic wear
  p6: IMG("1620916566398-39f1143ab7be"), // skincare serum
  p7: IMG("1587829741301-dc798b83add3"), // mechanical keyboard
  p8: IMG("1547949003-9792a18a2601"), // duffel bag
  p9: IMG("1585032226651-759b368d7246"), // cast iron skillet
  p10: IMG("1638536532686-d610adfc8e5c"), // dumbbells
  p11: IMG("1608043152269-423dbba4e7e1"), // bluetooth speaker
  p12: IMG("1544022613-e87ca75a784a"), // wool overcoat
  p13: IMG("1602874801007-bd458bb1b8b6"), // soy candles
  p14: IMG("1586495777744-4413f21062fa"), // lipstick collection
};

export interface EcomProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  emoji: string;
  imgBg: string;
  price: number;
  salePrice?: number;
  cost: number;
  stock: number;
  reserved: number;
  reorderPoint: number;
  status: string; // "In Stock" | "Low Stock" | "Out of Stock"
  lifecycle: string; // "Active" | "Draft" | "Archived"
  rating: number;
  reviews: number;
  description: string;
  tags: string[];
  unitsSold: number;
}

export const products: EcomProduct[] = [
  { id: "p1", name: "Pro Wireless Headphones X9", sku: "HDP-X9-BLK", barcode: "745632189012", category: "Electronics", emoji: "🎧", imgBg: "linear-gradient(135deg,#1e2a4a,#2d3a6b)", price: 299, salePrice: 249, cost: 120, stock: 142, reserved: 18, reorderPoint: 50, status: "In Stock", lifecycle: "Active", rating: 4.6, reviews: 128, description: "Premium wireless headphones with active noise cancellation, 40-hour battery life, and studio-quality sound. Featuring Bluetooth 5.3, foldable design, and built-in microphone for crystal-clear calls.", tags: ["electronics", "wireless", "audio"], unitsSold: 1284 },
  { id: "p2", name: "Minimalist Leather Backpack", sku: "BKP-MIN-TAN", barcode: "745632189029", category: "Apparel", emoji: "🎒", imgBg: "linear-gradient(135deg,#4a2e1e,#6b4a2d)", price: 189, cost: 78, stock: 64, reserved: 6, reorderPoint: 20, status: "In Stock", lifecycle: "Active", rating: 4.8, reviews: 96, description: "Handcrafted full-grain leather backpack with padded laptop sleeve, water-resistant lining and adjustable straps.", tags: ["apparel", "leather", "travel"], unitsSold: 842 },
  { id: "p3", name: "Smart Fitness Watch Series 5", sku: "WCH-FS5-BLK", barcode: "745632189036", category: "Electronics", emoji: "⌚", imgBg: "linear-gradient(135deg,#1e3a2a,#2d5a3b)", price: 249, cost: 95, stock: 8, reserved: 4, reorderPoint: 20, status: "Low Stock", lifecycle: "Active", rating: 4.4, reviews: 210, description: "Track heart rate, sleep, workouts and notifications with a vivid always-on display and 7-day battery.", tags: ["electronics", "wearable"], unitsSold: 1960 },
  { id: "p4", name: "Ceramic Pour-Over Coffee Set", sku: "CRM-POC-WHT", barcode: "745632189043", category: "Home", emoji: "☕", imgBg: "linear-gradient(135deg,#4a3a1e,#6b5a2d)", price: 68, cost: 24, stock: 210, reserved: 12, reorderPoint: 40, status: "In Stock", lifecycle: "Active", rating: 4.7, reviews: 54, description: "Hand-glazed ceramic dripper and carafe set for a perfect slow-brewed cup every morning.", tags: ["home", "kitchen"], unitsSold: 412 },
  { id: "p5", name: "Performance Running Shorts", sku: "APL-RUN-GRY", barcode: "745632189050", category: "Sports", emoji: "🩳", imgBg: "linear-gradient(135deg,#2a2a4a,#3b3b6b)", price: 42, cost: 14, stock: 4, reserved: 0, reorderPoint: 25, status: "Low Stock", lifecycle: "Active", rating: 4.3, reviews: 71, description: "Lightweight, moisture-wicking running shorts with a zip pocket and reflective trim.", tags: ["sports", "apparel"], unitsSold: 1108 },
  { id: "p6", name: "Organic Face Serum Duo", sku: "BTY-FSD-CLR", barcode: "745632189067", category: "Beauty", emoji: "🧴", imgBg: "linear-gradient(135deg,#3a1e4a,#5a2d6b)", price: 54, cost: 18, stock: 96, reserved: 8, reorderPoint: 30, status: "In Stock", lifecycle: "Active", rating: 4.9, reviews: 312, description: "Vitamin C and hyaluronic acid serum duo for brightening and hydration, cruelty-free and vegan.", tags: ["beauty", "skincare"], unitsSold: 2240 },
  { id: "p7", name: "Mechanical Keyboard 75%", sku: "KBD-M75-BLK", barcode: "745632189074", category: "Electronics", emoji: "⌨️", imgBg: "linear-gradient(135deg,#1e2a4a,#2d3a6b)", price: 159, cost: 62, stock: 38, reserved: 5, reorderPoint: 20, status: "In Stock", lifecycle: "Active", rating: 4.5, reviews: 89, description: "Hot-swappable mechanical keyboard with PBT keycaps, RGB backlight and wireless connectivity.", tags: ["electronics", "office"], unitsSold: 604 },
  { id: "p8", name: "Linen Weekend Duffel", sku: "BAG-LWD-OLV", barcode: "745632189081", category: "Apparel", emoji: "🧳", imgBg: "linear-gradient(135deg,#2e3a1e,#4a5a2d)", price: 128, cost: 46, stock: 0, reserved: 0, reorderPoint: 15, status: "Out of Stock", lifecycle: "Active", rating: 4.2, reviews: 33, description: "Durable linen-cotton blend duffel with leather trim, perfect for a weekend away.", tags: ["apparel", "travel"], unitsSold: 288 },
  { id: "p9", name: "Cast Iron Skillet 12\"", sku: "KIT-CIS-12", barcode: "745632189098", category: "Home", emoji: "🍳", imgBg: "linear-gradient(135deg,#2a2a2a,#3f3f3f)", price: 46, cost: 16, stock: 178, reserved: 10, reorderPoint: 35, status: "In Stock", lifecycle: "Active", rating: 4.8, reviews: 145, description: "Pre-seasoned cast iron skillet for stovetop, oven and campfire cooking that lasts a lifetime.", tags: ["home", "kitchen"], unitsSold: 966 },
  { id: "p10", name: "Adjustable Dumbbell Set", sku: "SPT-ADS-20", barcode: "745632189104", category: "Sports", emoji: "🏋️", imgBg: "linear-gradient(135deg,#2a2a4a,#3b3b6b)", price: 220, cost: 92, stock: 6, reserved: 2, reorderPoint: 15, status: "Low Stock", lifecycle: "Active", rating: 4.6, reviews: 58, description: "Space-saving adjustable dumbbells from 5-50lbs per hand with quick-lock dial.", tags: ["sports", "fitness"], unitsSold: 320 },
  { id: "p11", name: "Bluetooth Travel Speaker", sku: "SPK-BTS-RED", barcode: "745632189111", category: "Electronics", emoji: "🔊", imgBg: "linear-gradient(135deg,#4a1e2a,#6b2d3a)", price: 89, cost: 34, stock: 122, reserved: 14, reorderPoint: 30, status: "In Stock", lifecycle: "Draft", rating: 4.4, reviews: 67, description: "Rugged, waterproof Bluetooth speaker with 20-hour battery and 360° sound.", tags: ["electronics", "audio"], unitsSold: 501 },
  { id: "p12", name: "Wool Blend Overcoat", sku: "APL-WBC-NVY", barcode: "745632189128", category: "Apparel", emoji: "🧥", imgBg: "linear-gradient(135deg,#1e2a3a,#2d3a52)", price: 245, cost: 98, stock: 27, reserved: 3, reorderPoint: 15, status: "In Stock", lifecycle: "Active", rating: 4.7, reviews: 42, description: "Tailored wool-blend overcoat with satin lining, built for cold-weather commutes.", tags: ["apparel", "outerwear"], unitsSold: 214 },
  { id: "p13", name: "Scented Soy Candle Trio", sku: "HME-SCT-VAN", barcode: "745632189135", category: "Home", emoji: "🕯️", imgBg: "linear-gradient(135deg,#4a3a1e,#6b5a2d)", price: 38, cost: 12, stock: 264, reserved: 20, reorderPoint: 50, status: "In Stock", lifecycle: "Active", rating: 4.9, reviews: 188, description: "Hand-poured soy candle trio in vanilla, sandalwood and sea salt scents.", tags: ["home", "decor"], unitsSold: 1420 },
  { id: "p14", name: "Matte Lipstick Collection", sku: "BTY-MLC-RD5", barcode: "745632189142", category: "Beauty", emoji: "💄", imgBg: "linear-gradient(135deg,#3a1e2a,#5a2d3b)", price: 72, cost: 22, stock: 9, reserved: 1, reorderPoint: 25, status: "Low Stock", lifecycle: "Active", rating: 4.5, reviews: 97, description: "Five long-wear matte lipstick shades, formulated with vitamin E and jojoba oil.", tags: ["beauty", "makeup"], unitsSold: 1080 },
];

export interface EcomCategory {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  revenue: string;
  pct: number;
  count: number;
}

const categoryBase: Omit<EcomCategory, "count">[] = [
  { id: "c1", name: "Electronics", emoji: "🎧", bg: "var(--acc-soft)", revenue: "$142,800", pct: 34 },
  { id: "c2", name: "Apparel", emoji: "👕", bg: "var(--info-soft)", revenue: "$98,400", pct: 24 },
  { id: "c3", name: "Home", emoji: "🏠", bg: "var(--ok-soft)", revenue: "$64,200", pct: 16 },
  { id: "c4", name: "Sports", emoji: "🏋️", bg: "var(--warn-soft)", revenue: "$41,900", pct: 10 },
  { id: "c5", name: "Beauty", emoji: "💄", bg: "var(--bad-soft)", revenue: "$38,600", pct: 9 },
  { id: "c6", name: "Toys & Kids", emoji: "🧸", bg: "var(--acc-soft)", revenue: "$16,200", pct: 4 },
  { id: "c7", name: "Books", emoji: "📚", bg: "var(--info-soft)", revenue: "$8,900", pct: 2 },
  { id: "c8", name: "Pet Supplies", emoji: "🐾", bg: "var(--ok-soft)", revenue: "$4,700", pct: 1 },
];

export const categories: EcomCategory[] = categoryBase.map((c) => ({
  ...c,
  count: products.filter((p) => p.category === c.name).length || Math.max(6, Math.round(c.pct * 3)),
}));

export interface OrderLineItem {
  name: string;
  sku: string;
  emoji: string;
  imgBg: string;
  qty: number;
  price: number;
}

export interface EcomOrder {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  avatarBg: string;
  date: string;
  items: OrderLineItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
}

const g = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

const sampleItems: OrderLineItem[][] = [
  [
    { name: "Pro Wireless Headphones X9", sku: "HDP-X9-BLK", emoji: "🎧", imgBg: g("#1e2a4a", "#2d3a6b"), qty: 1, price: 249 },
    { name: "Bluetooth Travel Speaker", sku: "SPK-BTS-RED", emoji: "🔊", imgBg: g("#4a1e2a", "#6b2d3a"), qty: 1, price: 89 },
  ],
  [{ name: "Minimalist Leather Backpack", sku: "BKP-MIN-TAN", emoji: "🎒", imgBg: g("#4a2e1e", "#6b4a2d"), qty: 1, price: 189 }],
  [
    { name: "Smart Fitness Watch Series 5", sku: "WCH-FS5-BLK", emoji: "⌚", imgBg: g("#1e3a2a", "#2d5a3b"), qty: 1, price: 249 },
    { name: "Adjustable Dumbbell Set", sku: "SPT-ADS-20", emoji: "🏋️", imgBg: g("#2a2a4a", "#3b3b6b"), qty: 1, price: 220 },
  ],
  [{ name: "Organic Face Serum Duo", sku: "BTY-FSD-CLR", emoji: "🧴", imgBg: g("#3a1e4a", "#5a2d6b"), qty: 2, price: 54 }],
  [{ name: "Ceramic Pour-Over Coffee Set", sku: "CRM-POC-WHT", emoji: "☕", imgBg: g("#4a3a1e", "#6b5a2d"), qty: 1, price: 68 }],
];

const custNames = [
  { name: "Elena Park", email: "elena@stripe.com", avatarBg: g("#7c5cff", "#56a8ff") },
  { name: "Marcus Chen", email: "marcus@vercel.com", avatarBg: g("#33d493", "#56a8ff") },
  { name: "Sofia Reyes", email: "sofia.reyes@gmail.com", avatarBg: g("#f7b84e", "#f76d7d") },
  { name: "James Wu", email: "james@notion.so", avatarBg: g("#9d86ff", "#7c5cff") },
  { name: "Ava Thompson", email: "ava.t@figma.com", avatarBg: g("#56a8ff", "#33d493") },
  { name: "Noah Kim", email: "noah.kim@outlook.com", avatarBg: g("#f76d7d", "#9d86ff") },
  { name: "Priya Sharma", email: "priya@airbnb.com", avatarBg: g("#7c5cff", "#33d493") },
  { name: "Liam O'Connor", email: "liam.oc@icloud.com", avatarBg: g("#f7b84e", "#7c5cff") },
  { name: "Mia Rodriguez", email: "mia.r@shopify.com", avatarBg: g("#56a8ff", "#f76d7d") },
  { name: "Ethan Brooks", email: "ethan.brooks@gmail.com", avatarBg: g("#33d493", "#7c5cff") },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const orderStatuses = ["Processing", "Pending", "Shipped", "Delivered", "Cancelled"];
const orderDates = ["Jun 27, 2026", "Jun 25, 2026", "Jun 24, 2026", "Jun 22, 2026", "Jun 20, 2026", "Jun 18, 2026", "Jun 15, 2026", "Jun 12, 2026", "Jun 10, 2026", "Jun 8, 2026", "Jun 5, 2026", "Jun 2, 2026"];

export const orders: EcomOrder[] = Array.from({ length: 12 }, (_, i) => {
  const cust = custNames[i % custNames.length];
  const items = sampleItems[i % sampleItems.length];
  const itemCount = items.reduce((s, it) => s + it.qty, 0);
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = i % 3 === 0 ? 0 : 12;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return {
    id: `ORD-${8842 - i * 7}`,
    customerId: `cu${(i % custNames.length) + 1}`,
    customerName: cust.name,
    email: cust.email,
    avatarBg: cust.avatarBg,
    date: orderDates[i % orderDates.length],
    items,
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    status: orderStatuses[i % orderStatuses.length],
    paymentMethod: i % 2 === 0 ? "Visa •••• 4242" : "Mastercard •••• 8871",
    paymentStatus: i % 5 === 4 ? "Refunded" : "Paid",
    shippingAddress: "185 Berry St, Suite 800, San Francisco, CA 94107, United States",
  };
});

export interface EcomCustomer {
  id: string;
  name: string;
  email: string;
  location: string;
  avatarBg: string;
  online: boolean;
  ordersCount: number;
  totalSpent: number;
  avgOrder: number;
  segment: string; // VIP | Regular | New | At Risk
  joined: string;
  lastOrder: string;
  notes: string;
}

const locations = ["San Francisco, CA", "Austin, TX", "New York, NY", "Seattle, WA", "Denver, CO", "Chicago, IL", "Miami, FL", "Boston, MA", "Portland, OR", "Los Angeles, CA"];
const segments = ["VIP", "Regular", "New", "At Risk"];

export const customers: EcomCustomer[] = custNames.map((c, i) => {
  const ordersCount = [14, 8, 3, 21, 1, 6, 11, 2, 9, 17][i];
  const totalSpent = [4280, 2140, 305, 6820, 89, 1560, 3120, 240, 2480, 5290][i];
  return {
    id: `cu${i + 1}`,
    name: c.name,
    email: c.email,
    location: locations[i],
    avatarBg: c.avatarBg,
    online: i % 3 === 0,
    ordersCount,
    totalSpent,
    avgOrder: Math.round(totalSpent / ordersCount),
    segment: segments[i % segments.length],
    joined: ["Jan 2024", "Mar 2023", "Jun 2026", "Nov 2022", "Jun 2026", "Aug 2024", "Feb 2023", "May 2026", "Sep 2024", "Dec 2022"][i],
    lastOrder: orderDates[i % orderDates.length],
    notes: "VIP enterprise customer. Prefers expedited shipping. Always pays on time. Key account for upsell.",
  };
});

export interface EcomReview {
  id: string;
  name: string;
  avatarBg: string;
  product: string;
  date: string;
  rating: number;
  text: string;
  reply?: string;
}

export const reviews: EcomReview[] = [
  { id: "rv1", name: "Sofia Reyes", avatarBg: g("#f7b84e", "#f76d7d"), product: "Pro Wireless Headphones X9", date: "2 days ago", rating: 5, text: "Best headphones I've owned. The noise cancellation is incredible and battery life easily lasts my whole work week.", reply: "Thanks so much for the kind words, Sofia! So glad they're working well for you." },
  { id: "rv2", name: "James Wu", avatarBg: g("#9d86ff", "#7c5cff"), product: "Smart Fitness Watch Series 5", date: "4 days ago", rating: 4, text: "Great watch overall, tracks workouts accurately. Wish the display was a bit brighter in direct sunlight." },
  { id: "rv3", name: "Ava Thompson", avatarBg: g("#56a8ff", "#33d493"), product: "Minimalist Leather Backpack", date: "1 week ago", rating: 5, text: "Beautiful craftsmanship and the leather is already breaking in nicely. Fits my 15\" laptop with room to spare." },
  { id: "rv4", name: "Noah Kim", avatarBg: g("#f76d7d", "#9d86ff"), product: "Adjustable Dumbbell Set", date: "1 week ago", rating: 3, text: "Works fine but the dial mechanism feels a little loose. Customer support was helpful when I reached out." },
  { id: "rv5", name: "Priya Sharma", avatarBg: g("#7c5cff", "#33d493"), product: "Organic Face Serum Duo", date: "2 weeks ago", rating: 5, text: "My skin has never looked better. Noticed a difference within the first week of using this every morning.", reply: "We're thrilled to hear that, Priya! Thank you for sharing your results with us." },
  { id: "rv6", name: "Liam O'Connor", avatarBg: g("#f7b84e", "#7c5cff"), product: "Mechanical Keyboard 75%", date: "3 weeks ago", rating: 4, text: "Satisfying typing feel and the RGB is a nice touch. Would love a version without the number pad cutout noise." },
];

export interface EcomCoupon {
  code: string;
  type: string;
  discount: string;
  used: number;
  limit: number;
  expires: string;
  color: string;
}

export const coupons: EcomCoupon[] = [
  { code: "SUMMER25", type: "Percentage", discount: "25% off", used: 842, limit: 1000, expires: "Jul 31, 2026", color: "var(--acc)" },
  { code: "WELCOME10", type: "Fixed amount", discount: "$10 off", used: 2140, limit: 5000, expires: "Dec 31, 2026", color: "var(--ok)" },
  { code: "FREESHIP", type: "Free shipping", discount: "Free shipping", used: 1680, limit: 2000, expires: "Aug 15, 2026", color: "var(--info)" },
  { code: "VIP20", type: "Percentage", discount: "20% off", used: 96, limit: 200, expires: "Sep 1, 2026", color: "var(--warn)" },
  { code: "FLASH50", type: "Percentage", discount: "50% off", used: 480, limit: 500, expires: "Jul 14, 2026", color: "var(--bad)" },
  { code: "BUNDLE15", type: "Fixed amount", discount: "$15 off", used: 310, limit: 800, expires: "Oct 31, 2026", color: "var(--acc)" },
];

export interface EcomPromotion {
  id: string;
  name: string;
  desc: string;
  status: string;
  discount: string;
  used: number;
  revenue: string;
  icon: string;
  color: string;
  bg: string;
}

export const promotions: EcomPromotion[] = [
  { id: "pr1", name: "Summer Sale", desc: "Site-wide discount on all electronics and apparel", status: "Active", discount: "25%", used: 842, revenue: "$18,400", icon: "M12 2v20M2 12h20", color: "var(--acc)", bg: "var(--acc-soft)" },
  { id: "pr2", name: "New Customer Welcome", desc: "First-order discount for newly registered accounts", status: "Active", discount: "$10", used: 2140, revenue: "$4,200", icon: "M20 6 9 17l-5-5", color: "var(--ok)", bg: "var(--ok-soft)" },
  { id: "pr3", name: "Free Shipping Weekend", desc: "No shipping fees on orders over $50", status: "Scheduled", discount: "Free ship", used: 0, revenue: "$0", icon: "M3 3h13v10H3zM16 8h4l3 4v5h-7V8z", color: "var(--info)", bg: "var(--info-soft)" },
  { id: "pr4", name: "VIP Loyalty Bonus", desc: "Extra discount for VIP-segment repeat customers", status: "Active", discount: "20%", used: 96, revenue: "$1,900", icon: "m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01Z", color: "var(--warn)", bg: "var(--warn-soft)" },
  { id: "pr5", name: "Flash Clearance", desc: "48-hour clearance on discontinued inventory", status: "Ended", discount: "50%", used: 480, revenue: "$6,240", icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z", color: "var(--bad)", bg: "var(--bad-soft)" },
];

export interface DashboardTopProduct {
  rank: number;
  name: string;
  cat: string;
  mono: string;
  tint: string;
  tintBg: string;
  sales: string;
  revenue: string;
  trend: string;
  trendColor: string;
}

export const dashboardTopProducts: DashboardTopProduct[] = [
  { rank: 1, name: "Pro Wireless Headphones X9", cat: "Electronics", mono: "HP", tint: "var(--acc)", tintBg: "var(--acc-soft)", sales: "1,284", revenue: "$38,220", trend: "+18%", trendColor: "var(--ok)" },
  { rank: 2, name: "Organic Face Serum Duo", cat: "Beauty", mono: "FS", tint: "var(--bad)", tintBg: "var(--bad-soft)", sales: "2,240", revenue: "$32,100", trend: "+24%", trendColor: "var(--ok)" },
  { rank: 3, name: "Smart Fitness Watch Series 5", cat: "Electronics", mono: "FW", tint: "var(--info)", tintBg: "var(--info-soft)", sales: "1,960", revenue: "$29,880", trend: "+9%", trendColor: "var(--ok)" },
  { rank: 4, name: "Minimalist Leather Backpack", cat: "Apparel", mono: "LB", tint: "var(--warn)", tintBg: "var(--warn-soft)", sales: "842", revenue: "$21,300", trend: "-4%", trendColor: "var(--bad)" },
  { rank: 5, name: "Scented Soy Candle Trio", cat: "Home", mono: "SC", tint: "var(--ok)", tintBg: "var(--ok-soft)", sales: "1,420", revenue: "$18,640", trend: "+6%", trendColor: "var(--ok)" },
];

export { initialsOf };

/** Badge color variant for a customer segment label (VIP / Regular / New / At Risk). */
export function segmentVariant(segment: string): "accent" | "neutral" | "info" | "danger" {
  switch (segment) {
    case "VIP":
      return "accent";
    case "New":
      return "info";
    case "At Risk":
      return "danger";
    default:
      return "neutral";
  }
}
