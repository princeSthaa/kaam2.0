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

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/product`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchFabrics(): Promise<Fabric[]> {
  const res = await fetch(`${API_BASE_URL}/fabric`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch fabrics");
  return res.json();
}

