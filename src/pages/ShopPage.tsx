import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Slider } from '@/components/ui/slider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { products, categories, formatCurrency } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [priceRange, setPriceRange] = useState([0, 2000000]);

  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const showSale = searchParams.get('sale') === 'true';
  const showNew = searchParams.get('new') === 'true';
  const sortBy = searchParams.get('sort') || 'newest';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category.slug === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter by sale
    if (showSale) {
      result = result.filter((p) => p.salePrice);
    }

    // Filter by new
    if (showNew) {
      result = result.filter((p) => p.isNew);
    }

    // Filter by price
    result = result.filter((p) => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default: // newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [selectedCategory, searchQuery, showSale, showNew, sortBy, priceRange]);

  const handleCategoryChange = (slug: string | null) => {
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: string) => {
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 2000000]);
  };

  const hasActiveFilters = selectedCategory || searchQuery || showSale || showNew;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3">Danh Mục</h4>
        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
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
                selectedCategory === cat.slug
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              )}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              <span className="text-sm">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3">Khoảng Giá</h4>
        <Slider
          min={0}
          max={2000000}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h4 className="font-semibold mb-3">Bộ Lọc</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sale"
              checked={showSale}
              onCheckedChange={(checked) => {
                if (checked) {
                  searchParams.set('sale', 'true');
                } else {
                  searchParams.delete('sale');
                }
                setSearchParams(searchParams);
              }}
            />
            <Label htmlFor="sale" className="text-sm cursor-pointer">
              Đang giảm giá
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="new"
              checked={showNew}
              onCheckedChange={(checked) => {
                if (checked) {
                  searchParams.set('new', 'true');
                } else {
                  searchParams.delete('new');
                }
                setSearchParams(searchParams);
              }}
            />
            <Label htmlFor="new" className="text-sm cursor-pointer">
              Hàng mới về
            </Label>
          </div>
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
        {/* Page Header */}
        <div className="bg-muted/50 py-8">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Bộ Sưu Tập'
                : searchQuery
                ? `Kết quả cho "${searchQuery}"`
                : 'Bộ Sưu Tập'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {filteredProducts.length} sản phẩm
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* Mobile Filter */}
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

                {/* Sort */}
                <div className="flex items-center gap-4 ml-auto">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                      <SelectItem value="rating">Đánh giá cao</SelectItem>
                      <SelectItem value="popular">Phổ biến</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Grid Toggle - Desktop */}
                  <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
                    <Button
                      variant={gridCols === 2 ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGridCols(2)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridCols === 3 ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGridCols(3)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridCols === 4 ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGridCols(4)}
                    >
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

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <SlidersHorizontal className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                </div>
              ) : (
                <div
                  className={cn(
                    'grid gap-4 md:gap-6',
                    gridCols === 2 && 'grid-cols-2',
                    gridCols === 3 && 'grid-cols-2 md:grid-cols-3',
                    gridCols === 4 && 'grid-cols-2 md:grid-cols-4'
                  )}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
