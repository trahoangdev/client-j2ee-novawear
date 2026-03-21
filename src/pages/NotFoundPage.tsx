import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="404 - Không tìm thấy trang" description="Trang bạn đang tìm kiếm không tồn tại." />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          {/* 404 Number */}
          <div className="relative mb-6">
            <span className="text-[10rem] md:text-[12rem] font-bold leading-none tracking-tighter text-muted-foreground/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Không tìm thấy trang
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
              <span className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </span>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
