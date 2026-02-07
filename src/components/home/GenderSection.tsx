import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';

interface GenderSectionProps {
    gender: 'MALE' | 'FEMALE';
    title: string;
    subtitle?: string;
    bgClass?: string;
}

export function GenderSection({ gender, title, subtitle, bgClass }: GenderSectionProps) {
    const [products, setProducts] = useState<ProductDisplay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productsApi
            .list({ gender, size: 4, page: 0 })
            .then(({ data }) => setProducts(data.content.map(productDtoToDisplay)))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [gender]);

    if (!loading && products.length === 0) return null;

    return (
        <section className={`py-16 ${bgClass || 'bg-background'}`}>
            <div className="container">
                <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
                        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                    </div>
                    <Button asChild variant="outline">
                        <Link to={`/shop?gender=${gender}`}>
                            Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
