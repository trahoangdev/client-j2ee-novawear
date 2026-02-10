import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductDto } from '@/types/api';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface RelatedProductsProps {
    productId: number;
    type?: 'related' | 'similar';
    title?: string;
    limit?: number;
}

const RelatedProducts = ({
    productId,
    type = 'related',
    title,
    limit = 4,
}: RelatedProductsProps) => {
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [productId, type]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const endpoint = type === 'related'
                ? `/api/products/${productId}/related`
                : `/api/products/${productId}/similar`;

            const res = await api.get<ProductDto[]>(endpoint, { params: { limit } });
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const defaultTitle = type === 'related' ? 'Sản phẩm liên quan' : 'Sản phẩm tương tự';

    if (loading) {
        return (
            <section className="mt-16">
                <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3">
                    {title || defaultTitle}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: limit }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] rounded-xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8">
                {title || defaultTitle}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => {
                    const hasDiscount = product.salePrice && product.salePrice < product.price;
                    const displayPrice = product.salePrice || product.price;
                    const discountPercent = hasDiscount
                        ? Math.round(((product.price - displayPrice) / product.price) * 100)
                        : 0;

                    return (
                        <Link
                            key={product.id}
                            to={`/product/${product.slug || product.id}`}
                            className="group block rounded-xl border border-transparent hover:border-border bg-card overflow-hidden transition-all hover:shadow-soft"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                <img
                                    src={product.images?.[0] || product.imageUrl || '/placeholder.jpg'}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {hasDiscount && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded">
                                        -{discountPercent}%
                                    </span>
                                )}
                                {product.isNew && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded">
                                        Mới
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {product.categoryName}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="font-display font-bold text-primary">
                                        {formatCurrency(displayPrice)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {formatCurrency(product.price)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default RelatedProducts;
