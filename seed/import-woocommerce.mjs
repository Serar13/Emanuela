import { execFileSync } from "node:child_process";

const projectId = process.env.FIREBASE_PROJECT_ID || "emanuela-da572";
const storeBase = "https://laboratoremanuela.ro/wp-json/wc/store/v1";
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8222;|&#8221;|&quot;/g, '"')
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, firestoreValue(child)])) } };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function fetchAllProducts() {
  const rows = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await fetchJson(`${storeBase}/products?per_page=100&page=${page}`);
    rows.push(...batch);
    if (batch.length < 100) break;
  }
  return rows;
}

async function patchDocument(token, collection, id, data) {
  const fields = Object.fromEntries(Object.entries({ ...data, updatedAt: new Date().toISOString() }).map(([key, value]) => [key, firestoreValue(value)]));
  const mask = Object.keys(fields).map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
  const response = await fetch(`${firestoreBase}/${collection}/${encodeURIComponent(id)}?${mask}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error(`${collection}/${id}: ${response.status} ${await response.text()}`);
}

const [products, categories] = await Promise.all([
  fetchAllProducts(),
  fetchJson(`${storeBase}/products/categories?per_page=100`)
]);
const token = execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" }).trim();

for (const [index, category] of categories.entries()) {
  await patchDocument(token, "categories", `woo-${category.slug}`, {
    name: decodeHtml(category.name),
    slug: category.slug,
    icon: "✦",
    imageUrl: category.image?.src || "",
    active: Number(category.count || 0) > 0,
    sortOrder: 100 + index,
    source: "woocommerce",
    sourceId: category.id
  });
}

for (const [index, product] of products.entries()) {
  const price = Number(product.prices?.price || 0) / (10 ** Number(product.prices?.currency_minor_unit ?? 2));
  const primaryCategory = product.categories?.[0];
  await patchDocument(token, "products", `woo-${product.id}`, {
    name: decodeHtml(product.name),
    description: decodeHtml(product.short_description || product.summary || product.description),
    price,
    categoryId: primaryCategory ? `woo-${primaryCategory.slug}` : "prajituri",
    imageUrl: product.images?.[0]?.src || "",
    gallery: (product.images || []).map((image) => image.src).filter(Boolean),
    unit: /tort/i.test(product.name) ? "tort" : "bucată",
    weight: product.weight ? `${product.weight} kg` : "",
    active: true,
    featured: !!product.is_featured,
    availability: price > 0 && product.is_in_stock !== false ? "available" : "unavailable",
    sortOrder: 1000 + index,
    source: "woocommerce",
    sourceId: product.id,
    sourceUrl: product.permalink || ""
  });
}

console.log(`Imported ${products.length} products and ${categories.length} categories from WooCommerce.`);
