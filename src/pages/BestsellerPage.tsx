import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, LayoutGrid, SlidersHorizontal, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/lib/toast';
import type { CategoryDto } from '@/types/api';
import { cn } from '@/lib/utils';

export function BestsellerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const pageSize = 12;

  const categoryIdParam = searchParams.get('categoryId');
  const effectiveCategoryId = useMemo(() => {
    const numId = categoryIdParam ? Number(categoryIdParam) : NaN;
    return !Number.isNaN(numId) ? numId : undefined;
  }, [categoryIdParam]);

  useEffect(() => {
    categoriesApi.list().then(({ data }) => setCategories(data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({
        page,
        size: pageSize,
        bestseller: true,
        categoryId: effectiveCategoryId,
        search: searchQuery || undefined,
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
  }, [page, effectiveCategoryId, searchQuery]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setPage(0);
  };

  const selectedCategoryId = effectiveCategoryId ?? null;
  const hasActiveFilters = selectedCategoryId != null || searchQuery;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Danh Mục</h4>
        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              selectedCategoryId == null ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-muted/40 border-b border-border/50 py-6 md:py-8">
          <div className="container px-4 sm:px-6">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">Sản Phẩm Bán Chạy</h1>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              {loading ? 'Đang tải...' : `${total} sản phẩm`}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Được khách hàng lựa chọn nhiều nhất
            </p>
          </div>
        </div>

        <div className="container py-6 md:py-8 px-4 sm:px-6">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterContent />
            </aside>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                </div>
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
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
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
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-2">Chưa có sản phẩm bán chạy</h2>
                  <p className="text-muted-foreground text-sm">Quay lại sau nhé!</p>
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
