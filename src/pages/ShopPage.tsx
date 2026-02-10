import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { categoriesApi, productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { CategoryDto } from '@/types/api';
import { cn } from '@/lib/utils';
import { PriceRangeSlider } from '@/components/shop/PriceRangeSlider';
import { ColorFilter } from '@/components/shop/ColorFilter';
import { SizeFilter } from '@/components/shop/SizeFilter';
import { RatingFilter } from '@/components/shop/RatingFilter';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const categoryIdParam = searchParams.get('categoryId');
  const categorySlug = searchParams.get('category') ?? '';
  const searchQuery = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sort') || 'newest';
  const onSale = searchParams.get('sale') === 'true' || searchParams.get('onSale') === 'true';
  const isNew = searchParams.get('isNew') === 'true';
  const bestseller = searchParams.get('bestseller') === 'true';

  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sizes = useMemo(() => searchParams.get('sizes')?.split(',').filter(Boolean) ?? [], [searchParams]);
  const colors = useMemo(() => searchParams.get('colors')?.split(',').filter(Boolean) ?? [], [searchParams]);
  const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;

  const [availableFilters, setAvailableFilters] = useState<import('@/types/api').ProductFiltersDto | null>(null);

  useEffect(() => {
    productsApi.getFilters().then(({ data }) => setAvailableFilters(data)).catch(console.error);
  }, []);

  // Determine gender from path or search param
  const genderParam = useMemo(() => {
    if (location.pathname === '/nam') return 'MALE';
    if (location.pathname === '/nu') return 'FEMALE';
    if (location.pathname === '/unisex') return 'UNISEX';
    return searchParams.get('gender') ?? '';
  }, [location.pathname, searchParams]);

  const slugToName: Record<string, string> = { tops: 'Áo', pants: 'Quần', dresses: 'Váy', accessories: 'Phụ Kiện' };
  const effectiveCategoryId = useMemo(() => {
    const numId = categoryIdParam ? Number(categoryIdParam) : NaN;
    if (!Number.isNaN(numId)) return numId;
    if (categorySlug && slugToName[categorySlug]) {
      const found = categories.find((c) => c.name === slugToName[categorySlug]);
      return found?.id;
    }
    return undefined;
  }, [categoryIdParam, categorySlug, categories]);

  useEffect(() => {
    categoriesApi.list().then(({ data }) => setCategories(data)).catch(() => {
      setCategories([]);
      toast.error('Không tải được danh mục');
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({
        page,
        size: pageSize,
        categoryId: effectiveCategoryId,
        search: searchQuery || undefined,
        onSale: onSale || undefined,
        gender: genderParam || undefined,
        isNew: isNew || undefined,
        bestseller: bestseller || undefined,
        minPrice,
        maxPrice,
        sizes,
        colors,
        rating
      })
      .then(({ data }) => {
        setProducts(data.content.map(productDtoToDisplay));
        setTotal(data.totalElements);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
        toast.error('Không tải được sản phẩm. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [page, effectiveCategoryId, searchQuery, onSale, genderParam, isNew, bestseller, minPrice, maxPrice, sizes, colors, rating]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return list;
  }, [products, sortBy]);

  const handleCategoryChange = (id: number | null) => {
    if (id != null) {
      searchParams.set('categoryId', String(id));
    } else {
      searchParams.delete('categoryId');
    }
    setSearchParams(searchParams);
    setPage(0);
  };

  const handleGenderChange = (gender: string | null) => {
    if (gender) {
      searchParams.set('gender', gender);
    } else {
      searchParams.delete('gender');
    }
    searchParams.delete('category');
    setSearchParams(searchParams);
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(0);
  };

  const selectedCategoryId = effectiveCategoryId ?? null;
  const hasActiveFilters = selectedCategoryId != null || searchQuery || onSale || genderParam || isNew || bestseller || minPrice || maxPrice || sizes.length > 0 || colors.length > 0 || rating;

  /* Hide Gender Filter if pre-selected by path */
  const hideGenderFilter = location.pathname === '/nam' || location.pathname === '/nu' || location.pathname === '/unisex';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Gender Filter */}
      {!hideGenderFilter && (
        <div>
          <h4 className="font-semibold mb-3">Giới tính</h4>
          <div className="space-y-2">
            <div
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                !genderParam ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => handleGenderChange(null)}
            >
              <span className="text-sm">Tất cả</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                genderParam === 'MALE' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => handleGenderChange('MALE')}
            >
              <span className="text-sm">Nam</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                genderParam === 'FEMALE' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => handleGenderChange('FEMALE')}
            >
              <span className="text-sm">Nữ</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                genderParam === 'UNISEX' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => handleGenderChange('UNISEX')}
            >
              <span className="text-sm">Unisex</span>
            </div>
          </div>
        </div>

      )}

      {/* Price Range Filter */}
      <div>
        <h4 className="font-semibold mb-3">Khoảng Giá</h4>
        <div className="px-2">
          <PriceRangeSlider
            value={[minPrice || availableFilters?.minPrice || 0, maxPrice || availableFilters?.maxPrice || 10000000]}
            min={availableFilters?.minPrice || 0}
            max={availableFilters?.maxPrice || 10000000}
            step={50000}
            onValueChange={(val) => {
              // Debounce logic is better, but here simple implementation
            }}
            onValueCommit={(val) => {
              updateFilters({
                minPrice: String(val[0]),
                maxPrice: String(val[1])
              });
            }}
            className="mb-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(minPrice || availableFilters?.minPrice || 0)}</span>
            <span>{formatCurrency(maxPrice || availableFilters?.maxPrice || 10000000)}</span>
          </div>
        </div>
      </div>

      {/* Colors Filter */}
      {availableFilters?.colors && availableFilters.colors.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Màu sắc</h4>
          <ColorFilter
            colors={availableFilters.colors}
            selectedColors={colors}
            onChange={(newColors) => {
              updateFilters({ colors: newColors.length > 0 ? newColors.join(',') : null });
            }}
          />
        </div>
      )}

      {/* Sizes Filter */}
      {availableFilters?.sizes && availableFilters.sizes.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Kích thước</h4>
          <SizeFilter
            sizes={availableFilters.sizes}
            selectedSizes={sizes}
            onChange={(newSizes) => {
              updateFilters({ sizes: newSizes.length > 0 ? newSizes.join(',') : null });
            }}
          />
        </div>
      )}

      {/* Rating Filter */}
      <div>
        <h4 className="font-semibold mb-3">Đánh giá</h4>
        <RatingFilter
          rating={rating}
          onChange={(val) => updateFilters({ rating: val ? String(val) : null })}
        />
      </div>

      {/* Special Filters */}
      <div>
        <h4 className="font-semibold mb-3">Đặc biệt</h4>
        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              isNew ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
            onClick={() => {
              if (isNew) {
                searchParams.delete('isNew');
              } else {
                searchParams.set('isNew', 'true');
              }
              setSearchParams(searchParams);
              setPage(0);
            }}
          >
            <span className="text-sm">Hàng Mới Về</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              bestseller ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
            onClick={() => {
              if (bestseller) {
                searchParams.delete('bestseller');
              } else {
                searchParams.set('bestseller', 'true');
              }
              setSearchParams(searchParams);
              setPage(0);
            }}
          >
            <span className="text-sm">Bán Chạy Nhất</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              onSale ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
            onClick={() => {
              if (onSale) {
                searchParams.delete('sale');
                searchParams.delete('onSale');
              } else {
                searchParams.set('onSale', 'true');
              }
              setSearchParams(searchParams);
              setPage(0);
            }}
          >
            <span className="text-sm">Đang Khuyến Mãi</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-semibold mb-3">Danh Mục</h4>
        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              selectedCategoryId == null && !onSale && !genderParam ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
            onClick={() => handleCategoryChange(null)}
          >
            <span className="text-sm">Tất cả</span>
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                selectedCategoryId === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span className="text-sm">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  const categoryName = selectedCategoryId != null ? categories.find((c) => c.id === selectedCategoryId)?.name : null;
  const genderName = genderParam === 'MALE' ? 'Nam' : genderParam === 'FEMALE' ? 'Nữ' : genderParam === 'UNISEX' ? 'Unisex' : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-muted/40 border-b border-border/50 py-6 md:py-8">
          <div className="container px-4 sm:px-6">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              {genderName ? `Thời trang ${genderName}${isNew ? ' - Hàng Mới Về' :
                bestseller ? ' - Bán Chạy Nhất' :
                  onSale ? ' - Khuyến Mãi' : ''
                }` : (categoryName ?? (isNew ? 'Hàng Mới Về' : bestseller ? 'Bán Chạy Nhất' : onSale ? 'Khuyến Mãi' : searchQuery ? `Kết quả cho "${searchQuery}"` : 'Bộ Sưu Tập'))}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              {loading ? 'Đang tải...' : `${total} sản phẩm`}
            </p>
          </div>
        </div>

        <div className="container py-6 md:py-8 px-4 sm:px-6">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterContent />
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Bộ Lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Bộ Lọc</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-4 ml-auto">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
                    <Button variant={gridCols === 2 ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setGridCols(2)}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={gridCols === 3 ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setGridCols(3)}>
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant={gridCols === 4 ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setGridCols(4)}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="4" height="4" />
                        <rect x="10" y="3" width="4" height="4" />
                        <rect x="17" y="3" width="4" height="4" />
                        <rect x="3" y="10" width="4" height="4" />
                        <rect x="10" y="10" width="4" height="4" />
                        <rect x="17" y="10" width="4" height="4" />
                        <rect x="3" y="17" width="4" height="4" />
                        <rect x="10" y="17" width="4" height="4" />
                        <rect x="17" y="17" width="4" height="4" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div
                  className={cn(
                    'grid gap-4 md:gap-6',
                    gridCols === 2 && 'grid-cols-2',
                    gridCols === 3 && 'grid-cols-2 md:grid-cols-3',
                    gridCols === 4 && 'grid-cols-2 md:grid-cols-4'
                  )}
                >
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-14 md:py-20">
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
                  <p className="text-muted-foreground text-sm mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <Button onClick={clearFilters} variant="outline">
                    Xóa bộ lọc
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      'grid gap-4 md:gap-6',
                      gridCols === 2 && 'grid-cols-2',
                      gridCols === 3 && 'grid-cols-2 md:grid-cols-3',
                      gridCols === 4 && 'grid-cols-2 md:grid-cols-4'
                    )}
                  >
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {total > pageSize && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                        Trước
                      </Button>
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        {page + 1} / {Math.ceil(total / pageSize)}
                      </span>
                      <Button
                        variant="outline"
                        disabled={(page + 1) * pageSize >= total}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
