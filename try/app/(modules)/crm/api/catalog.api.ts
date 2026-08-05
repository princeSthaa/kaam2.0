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
      if (Array.isArray(data)) {
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
  return [];
}

export async function fetchFabrics(): Promise<Fabric[]> {
  try {
    // Backend endpoint for materials is /api/material
    const res = await fetch(`${API_BASE_URL}/material`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data?.value || data?.data || []);
      if (Array.isArray(rawList)) {
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
  return [];
}
