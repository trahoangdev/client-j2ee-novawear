import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
            .list({ gender, size: 8, page: 0 }) // Fetching 8 to show in a scrollable block or grid
            .then(({ data }) => setProducts(data.content.map(productDtoToDisplay)))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [gender]);

    if (!loading && products.length === 0) return null;

    return (
        <section className={cn("py-20 md:py-32 relative overflow-hidden", bgClass || 'bg-background')}>
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 w-full h-full opacity-5 pointer-events-none",
                gender === 'MALE' ? 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent' : 'bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-pink-600 via-transparent to-transparent'
            )} />

            <div className="container px-4 sm:px-6 max-w-[90rem] relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6"
                >
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn(
                                "w-12 h-1 rounded-full",
                                gender === 'MALE' ? "bg-blue-600" : "bg-pink-500"
                            )}></span>
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">BST Mới Nhất</span>
                        </div>
                        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-sm">{title}</h2>
                        {subtitle && <p className="text-muted-foreground text-lg sm:text-xl font-medium mt-4">{subtitle}</p>}
                    </div>
                    <Button asChild variant="outline" className="hidden md:flex rounded-full h-14 px-8 border-2 hover:bg-foreground hover:text-background transition-colors text-sm font-bold uppercase tracking-widest">
                        <Link to={gender === 'MALE' ? '/nam' : '/nu'}>
                            Khám phá tất cả <ArrowRight className="ml-3 h-5 w-5" />
                        </Link>
                    </Button>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium animate-pulse">Đang tải bộ sưu tập...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {products.slice(0, 4).map((product, idx) => (
                                <motion.div 
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="mt-10 flex justify-center md:hidden">
                            <Button asChild size="lg" className="w-full rounded-2xl h-14 font-bold text-sm uppercase tracking-widest">
                                <Link to={gender === 'MALE' ? '/nam' : '/nu'}>
                                    Xem toàn bộ <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
