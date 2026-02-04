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
  isNew?: boolean;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
}

export function productDtoToDisplay(dto: ProductDto): ProductDisplay {
  return {
    id: String(dto.id),
    name: dto.name,
    price: dto.price,
    images: dto.imageUrl ? [dto.imageUrl] : [],
    category: { id: String(dto.categoryId), name: dto.categoryName ?? '' },
    slug: String(dto.id),
    description: dto.description,
    stockCount: dto.stock,
    rating: 0,
    reviewCount: 0,
    isNew: false,
    colors: [],
    sizes: ['S', 'M', 'L'],
  };
}

/** ProductCard chấp nhận Product (type đầy đủ) hoặc ProductDisplay */
export function isProductDisplay(p: Product | ProductDisplay): p is ProductDisplay {
  return 'slug' in p && typeof (p as ProductDisplay).slug === 'string';
}
