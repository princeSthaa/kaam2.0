const API_BASE_URL = 'http://localhost:5083/api';

export type Product = {
  id: string;
  name: string;
  sizes: string[];
  imagePath: string;
};

export type Fabric = {
  id: string;
  name: string;
  category: string;
  imagePath: string;
};

export function resolveMediaUrl(path?: string, defaultType: "product" | "fabric" = "product"): string {
  if (!path || path === "default.png" || path === "fabric.png" || path.includes("place-holder") || path.includes("denim")) {
    const fallbackFile = defaultType === "fabric" ? "FAB-001.jpg" : "polo-shirt.jpg";
    return `http://localhost:5083/Media/images/${defaultType === "fabric" ? "fabrics" : "products"}/${fallbackFile}`;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `http://localhost:5083${path}`;
  return `http://localhost:5083/Media/images/${defaultType === "fabric" ? "fabrics" : "products"}/${path}`;
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/product`, { cache: 'no-store' });
    if (res.ok) {
      const data: Product[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(p => ({
          ...p,
          sizes: p.sizes?.length ? p.sizes : ["XS", "S", "M", "L", "XL", "XXL"],
          imagePath: resolveMediaUrl(p.imagePath, "product")
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch products from API:", err);
  }

  // Fallback product catalog for order creation when database products are unseeded/empty
  return [
    { id: "prod-1", name: "Polo T-Shirt", sizes: ["S", "M", "L", "XL", "XXL"], imagePath: resolveMediaUrl("polo-shirt.jpg", "product") },
    { id: "prod-2", name: "Classic Round Neck T-Shirt", sizes: ["XS", "S", "M", "L", "XL", "XXL"], imagePath: resolveMediaUrl("tshirt.jpg", "product") },
    { id: "prod-3", name: "Oversized Heavyweight Hoodie", sizes: ["S", "M", "L", "XL"], imagePath: resolveMediaUrl("hoodie.jpg", "product") },
    { id: "prod-4", name: "Slim Fit Denim Jacket", sizes: ["S", "M", "L", "XL"], imagePath: resolveMediaUrl("denim-jacket.jpg", "product") },
    { id: "prod-5", name: "Cargo Utility Pants", sizes: ["28", "30", "32", "34", "36"], imagePath: resolveMediaUrl("cargo-pants.jpg", "product") },
  ];
}

export async function fetchFabrics(): Promise<Fabric[]> {
  try {
    // Backend endpoint for materials is /api/material
    const res = await fetch(`${API_BASE_URL}/material`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data?.value || data?.data || []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        // Filter materials that are fabrics (or if type is Fabric, or if all materials are used)
        const fabricItems = rawList.filter((f: any) => 
          !f.materialTypeName || f.materialTypeName.toLowerCase() === 'fabric'
        );
        const listToMap = fabricItems.length > 0 ? fabricItems : rawList;

        return listToMap.map((f: any) => ({
          id: f.id || f.materialCode || String(Math.random()),
          name: f.name || "Default Fabric",
          category: f.materialCategoryName || f.category || f.type || "General",
          imagePath: resolveMediaUrl(f.imagePath, "fabric"),
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch materials from backend:", err);
  }

  // Default fallback catalog if backend material endpoint is unavailable or empty
  return [
    { id: "fab-1", name: "100% Organic Cotton (220 GSM)", category: "Cotton", imagePath: resolveMediaUrl("FAB-001.jpg", "fabric") },
    { id: "fab-2", name: "Heavyweight Combed Cotton (280 GSM)", category: "Cotton", imagePath: resolveMediaUrl("FAB-001.jpg", "fabric") },
    { id: "fab-3", name: "Raw Indigo Denim Twill (14 oz)", category: "Denim", imagePath: resolveMediaUrl("FAB-002.png", "fabric") },
    { id: "fab-4", name: "Washed Stretch Denim (11 oz)", category: "Denim", imagePath: resolveMediaUrl("FAB-002.png", "fabric") },
    { id: "fab-5", name: "Breathable Athletic Polyester Mesh", category: "Polyester", imagePath: resolveMediaUrl("FAB-003.png", "fabric") },
    { id: "fab-6", name: "Microfiber Moisture Wicking Fabric", category: "Polyester", imagePath: resolveMediaUrl("FAB-003.png", "fabric") },
    { id: "fab-7", name: "Pure Mulberry Silk Satin", category: "Silk", imagePath: resolveMediaUrl("FAB-004.png", "fabric") },
    { id: "fab-8", name: "Premium French Linen Slub", category: "Linen", imagePath: resolveMediaUrl("FAB-005.png", "fabric") },
  ];
}
