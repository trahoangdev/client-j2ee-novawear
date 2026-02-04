import type { ProductDto } from '@/types/api';
import type { Product } from '@/types';

/** Kiểu sản phẩm dùng cho card/detail từ API (không có slug, sizes, colors) */
export interface ProductDisplay {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: { id: string; name: string };
  slug: string;
  description?: string;
  stockCount?: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
}

export function productDtoToDisplay(dto: ProductDto): ProductDisplay {
  const price = Number(dto.price);
  const salePrice = dto.salePrice != null && dto.salePrice !== '' ? Number(dto.salePrice) : undefined;
  // Use images array if available, otherwise fallback to imageUrl
  const images = dto.images && dto.images.length > 0 
    ? dto.images.filter((url) => url && url.trim() !== '')
    : (dto.imageUrl ? [dto.imageUrl] : []);
  return {
    id: String(dto.id),
    name: dto.name,
    price,
    salePrice: salePrice != null && !Number.isNaN(salePrice) ? salePrice : undefined,
    images,
    category: { id: String(dto.categoryId), name: dto.categoryName ?? '' },
    slug: dto.slug || String(dto.id), // Use slug if available, fallback to id
    description: dto.description,
    stockCount: dto.stock,
    rating: 0,
    reviewCount: 0,
    featured: !!dto.featured,
    isNew: !!(dto.isNew ?? (dto as Record<string, unknown>).new),
    bestseller: !!dto.bestseller,
    colors: dto.colors?.length ? dto.colors.map((c) => ({ name: c.name, hex: c.hex })) : [],
    sizes: dto.sizes?.length ? dto.sizes : ['S', 'M', 'L'],
  };
}

/** ProductCard chấp nhận Product (type đầy đủ) hoặc ProductDisplay */
export function isProductDisplay(p: Product | ProductDisplay): p is ProductDisplay {
  return 'slug' in p && typeof (p as ProductDisplay).slug === 'string';
}
