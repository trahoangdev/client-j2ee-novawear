import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReactNode } from 'react';
import { SEO } from '@/components/SEO';

interface ContentPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ContentPageLayout({ title, description, children }: ContentPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={title} description={description || `${title} - NOVAWEAR`} />
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">{title}</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
