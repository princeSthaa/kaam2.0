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
  const res = await fetch(`${API_BASE_URL}/product`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: Product[] = await res.json();
  return data.map(p => ({
    ...p,
    imagePath: resolveMediaUrl(p.imagePath, "product")
  }));
}

export async function fetchFabrics(): Promise<Fabric[]> {
  const res = await fetch(`${API_BASE_URL}/fabric`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch fabrics");
  const data: Fabric[] = await res.json();
  return data.map(f => ({
    ...f,
    imagePath: resolveMediaUrl(f.imagePath, "fabric")
  }));
}

