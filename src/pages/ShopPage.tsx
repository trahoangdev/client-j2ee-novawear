import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, Check, ChevronRight } from 'lucide-react';
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
import { SEO } from '@/components/SEO';
import { ColorFilter } from '@/components/shop/ColorFilter';
import { SizeFilter } from '@/components/shop/SizeFilter';
import { RatingFilter } from '@/components/shop/RatingFilter';
import { motion, AnimatePresence } from 'framer-motion';

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
  const topRef = useRef<HTMLDivElement>(null);

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
  const [sliderRange, setSliderRange] = useState<number[] | null>(null);

  useEffect(() => {
    if (availableFilters) {
      setSliderRange([
        minPrice ?? availableFilters.minPrice ?? 0,
        maxPrice ?? availableFilters.maxPrice ?? 10000000
      ]);
    }
  }, [minPrice, maxPrice, availableFilters]);

  // Debounced URL updates when user drags slider (bypasses potential Radix onValueCommit failures)
  useEffect(() => {
    if (!sliderRange || !availableFilters) return;
    const [sMin, sMax] = sliderRange;
    const cMin = minPrice ?? availableFilters.minPrice ?? 0;
    const cMax = maxPrice ?? availableFilters.maxPrice ?? 10000000;
    
    // Only dispatch update if values actually changed to prevent infinite loops
    if (sMin !== cMin || sMax !== cMax) {
      const timeoutId = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        params.set('minPrice', String(sMin));
        params.set('maxPrice', String(sMax));
        setSearchParams(params);
        setPage(0);
      }, 500); // 500ms delay after dragging stops
      return () => clearTimeout(timeoutId);
    }
  }, [sliderRange, minPrice, maxPrice, searchParams, availableFilters, setSearchParams]);

  useEffect(() => {
    productsApi.getFilters().then(({ data }) => setAvailableFilters(data)).catch(console.error);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

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
      .finally(() => {
        setLoading(false);
        if (page > 0 && topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
  }, [page, effectiveCategoryId, searchQuery, onSale, genderParam, isNew, bestseller, minPrice, maxPrice, sizes, colors, rating]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      default:
        break;
    }
    return list;
  }, [products, sortBy]);

  const handleCategoryChange = (id: number | null) => {
    if (id != null) {
      searchParams.set('categoryId', String(id));
      searchParams.delete('category');
    } else {
      searchParams.delete('categoryId');
      searchParams.delete('category');
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
    searchParams.delete('categoryId');
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
  const hasActiveFilters = selectedCategoryId != null || !!searchQuery || onSale || !!searchParams.get('gender') || isNew || bestseller || minPrice || maxPrice || sizes.length > 0 || colors.length > 0 || rating;
  const hideGenderFilter = location.pathname === '/nam' || location.pathname === '/nu' || location.pathname === '/unisex';

  const categoryName = selectedCategoryId != null ? categories.find((c) => c.id === selectedCategoryId)?.name : null;
  const genderName = genderParam === 'MALE' ? 'Nam' : genderParam === 'FEMALE' ? 'Nữ' : genderParam === 'UNISEX' ? 'Unisex' : null;

  const FilterContent = () => (
    <div className="space-y-8 pr-2">
      {/* Category Filter */}
      <div>
        <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Danh Mục</h4>
        <div className="flex flex-col gap-1">
          <button
            className={cn(
              'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              selectedCategoryId == null && !onSale && !searchParams.get('gender') && !hideGenderFilter ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-muted text-foreground/80 hover:text-foreground'
            )}
            onClick={() => handleCategoryChange(null)}
          >
            Tất cả sản phẩm
            {selectedCategoryId == null && !onSale && !searchParams.get('gender') && !hideGenderFilter && <Check className="w-4 h-4 ml-2" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                selectedCategoryId === cat.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-muted text-foreground/80 hover:text-foreground'
              )}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
              {selectedCategoryId === cat.id && <Check className="w-4 h-4 ml-2" />}
            </button>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Bộ sưu tập đặc biệt</h4>
        <div className="flex flex-col gap-1">
          <button
            className={cn(
               'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isNew ? 'bg-primary/15 text-primary' : 'hover:bg-muted text-foreground/80 hover:text-foreground'
            )}
            onClick={() => updateFilters({ isNew: isNew ? null : 'true' })}
          >
            ✨ Hàng Mới Về
          </button>
          <button
            className={cn(
               'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              bestseller ? 'bg-primary/15 text-primary' : 'hover:bg-muted text-foreground/80 hover:text-foreground'
            )}
            onClick={() => updateFilters({ bestseller: bestseller ? null : 'true' })}
          >
            🔥 Bán Chạy Nhất
          </button>
          <button
            className={cn(
               'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              onSale ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'hover:bg-muted text-foreground/80 hover:text-foreground'
            )}
            onClick={() => updateFilters({ sale: onSale ? null : 'true' })}
          >
            💥 Đang Khuyến Mãi
          </button>
        </div>
      </div>

      {/* Gender Filter for generic /shop */}
      {!hideGenderFilter && (
        <div className="border-t border-border pt-6">
          <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Giới tính</h4>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'MALE', label: 'Nam' },
              { id: 'FEMALE', label: 'Nữ' },
              { id: 'UNISEX', label: 'Unisex' }
            ].map((g) => (
              <button
                key={g.id}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border',
                  genderParam === g.id ? 'bg-foreground text-background border-foreground shadow-md' : 'bg-background hover:bg-muted border-border/60 hover:border-foreground/30'
                )}
                onClick={() => handleGenderChange(genderParam === g.id ? null : g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="border-t border-border pt-6">
        <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Khoảng Giá</h4>
        <div className="px-2">
          <PriceRangeSlider
            value={sliderRange || [availableFilters?.minPrice || 0, availableFilters?.maxPrice || 10000000]}
            min={availableFilters?.minPrice || 0}
            max={availableFilters?.maxPrice || 10000000}
            step={50000}
            onValueChange={setSliderRange}
            className="mb-4"
          />
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>{formatCurrency(sliderRange?.[0] || availableFilters?.minPrice || 0)}</span>
            <span>{formatCurrency(sliderRange?.[1] || availableFilters?.maxPrice || 10000000)}</span>
          </div>
        </div>
      </div>

      {/* Colors Filter */}
      {availableFilters?.colors && availableFilters.colors.length > 0 && (
        <div className="border-t border-border pt-6">
          <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Màu sắc</h4>
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
        <div className="border-t border-border pt-6">
          <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Kích thước</h4>
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
      <div className="border-t border-border pt-6 pb-4">
        <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Đánh giá</h4>
        <RatingFilter
          rating={rating}
          onChange={(val) => updateFilters({ rating: val ? String(val) : null })}
        />
      </div>

      {hasActiveFilters && (
        <div className="sticky bottom-4 z-10 mx-[-8px] px-2 bg-background/80 backdrop-blur-md pb-4 pt-2">
           <Button variant="destructive" className="w-full rounded-xl font-bold shadow-lg" onClick={clearFilters}>
             <X className="h-4 w-4 mr-2" />
             Xoá Tất Cả Bộ Lọc
           </Button>
        </div>
      )}
    </div>
  );

  const seoTitle = genderName ? `Thời Trang ${genderName}` : categoryName ? categoryName : 'Cửa Hàng';
  const seoDesc = genderName
    ? `Khám phá bộ sưu tập thời trang ${genderName.toLowerCase()} mới nhất tại NOVAWEAR.`
    : 'Mua sắm quần áo, phụ kiện thời trang tại NOVAWEAR với giá tốt nhất.';

  // Determine dynamic gradient for hero section
  let heroGradient = 'from-zinc-900 to-zinc-800';
  let heroIcon = null;
  
  if (genderParam === 'MALE') {
    heroGradient = 'from-blue-900 via-slate-800 to-indigo-900';
  } else if (genderParam === 'FEMALE') {
    heroGradient = 'from-rose-500 via-pink-600 to-fuchsia-700';
  } else if (genderParam === 'UNISEX') {
    heroGradient = 'from-emerald-700 via-teal-800 to-cyan-900';
  } else if (onSale) {
    heroGradient = 'from-orange-600 via-red-600 to-rose-700';
  } else if (isNew) {
    heroGradient = 'from-indigo-600 via-purple-600 to-fuchsia-600';
  }

  const PageTitle = genderName ? `THỜI TRANG ${genderName?.toUpperCase()}` 
                   : categoryName ? categoryName.toUpperCase() 
                   : (isNew ? 'HÀNG MỚI VỀ' : bestseller ? 'BÁN CHẠY NHẤT' : onSale ? 'KHUYẾN MÃI ĐẶC BIỆT' : 'KHÁM PHÁ BỘ SƯU TẬP');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <SEO title={seoTitle} description={seoDesc} url={location.pathname + location.search} keywords="thời trang, quần áo, mua sắm, novawear" />
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <div className={cn("relative overflow-hidden w-full transition-colors duration-700 pt-16 pb-20 md:pt-24 md:pb-28 text-white bg-gradient-to-r", heroGradient)}>
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
          
          <div className="container px-4 sm:px-6 relative z-10 flex flex-col items-center text-center" ref={topRef}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium uppercase tracking-widest mb-4 justify-center">
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => { setSearchParams({}); }}>Shop</span>
                {genderName && <><ChevronRight className="w-3.5 h-3.5" /> <span>{genderName}</span></>}
                {categoryName && <><ChevronRight className="w-3.5 h-3.5" /> <span>{categoryName}</span></>}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight drop-shadow-lg mb-6 leading-tight">
                {PageTitle}
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                {searchQuery ? `Hiển thị kết quả tìm kiếm cho "${searchQuery}"` : seoDesc}
              </p>
            </motion.div>
          </div>
        </div>

        {/* MAIN STORE CONTAINER */}
        <div className="container py-8 md:py-12 px-4 sm:px-6">
          <div className="flex gap-8 lg:gap-12">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card rounded-[2rem] border border-border/50 shadow-sm p-6 max-h-[calc(100vh-8rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <FilterContent />
              </div>
            </aside>

            {/* PRODUCT GRID AREA */}
            <div className="flex-1 w-full min-w-0">
              <div className=" bg-card rounded-[2rem] border border-border/50 shadow-sm p-4 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden rounded-xl h-12 px-5 font-semibold bg-background shadow-sm">
                        <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
                        Lọc & Phân loại
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[400px] sm:max-w-[400px] overflow-y-auto">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold">Bộ Lọc</SheetTitle>
                      </SheetHeader>
                      <FilterContent />
                    </SheetContent>
                  </Sheet>

                  <div className="hidden md:block">
                     <p className="text-muted-foreground font-medium">
                       Hiển thị <span className="text-foreground font-bold">{loading ? '...' : total}</span> sản phẩm phù hợp
                     </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px] h-12 rounded-xl bg-background border-border/60 shrink-0 font-medium">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="newest" className="rounded-lg">Mới nhất</SelectItem>
                      <SelectItem value="price-asc" className="rounded-lg">Giá: Thấp đến cao</SelectItem>
                      <SelectItem value="price-desc" className="rounded-lg">Giá: Cao đến thấp</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-xl p-1.5 shrink-0 border border-border/30">
                    <Button variant={gridCols === 2 ? 'default' : 'ghost'} size="icon" className={cn("h-9 w-9 rounded-lg transition-all", gridCols === 2 && 'bg-background shadow font-bold text-foreground hover:bg-background')} onClick={() => setGridCols(2)}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={gridCols === 3 ? 'default' : 'ghost'} size="icon" className={cn("h-9 w-9 rounded-lg transition-all", gridCols === 3 && 'bg-background shadow font-bold text-foreground hover:bg-background')} onClick={() => setGridCols(3)}>
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant={gridCols === 4 ? 'default' : 'ghost'} size="icon" className={cn("h-9 w-9 rounded-lg transition-all", gridCols === 4 && 'bg-background shadow font-bold text-foreground hover:bg-background')} onClick={() => setGridCols(4)}>
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

              {/* PRODUCT GRID */}
              <div className="relative min-h-[500px]">
                {loading ? (
                  <div
                    className={cn(
                      'grid gap-6',
                      gridCols === 2 && 'grid-cols-2',
                      gridCols === 3 && 'grid-cols-2 md:grid-cols-3',
                      gridCols === 4 && 'grid-cols-2 lg:grid-cols-4'
                    )}
                  >
                    {Array.from({ length: pageSize }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : sortedProducts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-24 bg-card rounded-[2rem] border border-border/50 shadow-sm"
                  >
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <X className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-3">Không tìm thấy sản phẩm</h2>
                    <p className="text-muted-foreground mb-8 max-w-sm">Chúng tôi không tìm thấy kết quả nào phù hợp với các tiêu chí lọc của bạn. Hãy thử thay đổi bộ lọc.</p>
                    <Button onClick={clearFilters} variant="default" size="lg" className="rounded-xl h-12 px-8 font-bold">
                      Xóa toàn bộ lọc
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className={cn(
                        'grid gap-6',
                        gridCols === 2 && 'grid-cols-2',
                        gridCols === 3 && 'grid-cols-2 md:grid-cols-3',
                        gridCols === 4 && 'grid-cols-2 lg:grid-cols-4'
                      )}
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {sortedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                          }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* PAGINATION */}
                    {total > pageSize && (
                      <div className="flex justify-center items-center gap-2 mt-16 pb-8">
                        <Button 
                          variant="outline" 
                          className="rounded-xl h-12 px-6 font-semibold bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm"
                          disabled={page === 0} 
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Trang Trước
                        </Button>
                        <div className="flex items-center justify-center min-w-[100px] h-12 bg-card rounded-xl font-bold text-foreground border border-border shadow-sm px-4">
                          {page + 1} / {Math.ceil(total / pageSize)}
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl h-12 px-6 font-semibold bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm"
                          disabled={(page + 1) * pageSize >= total}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Trang Sau
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
