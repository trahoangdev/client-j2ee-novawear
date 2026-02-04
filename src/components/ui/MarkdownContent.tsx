import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  /** Nội dung Markdown (có thể rỗng) */
  source: string;
  /** Text hiển thị khi source rỗng */
  emptyFallback?: string;
  className?: string;
}

/**
 * Render nội dung Markdown cho trang người dùng (mô tả sản phẩm, v.v.).
 * Nếu source rỗng thì hiển thị emptyFallback dạng text thuần.
 */
export function MarkdownContent({ source, emptyFallback, className }: MarkdownContentProps) {
  const trimmed = source?.trim() ?? '';
  if (!trimmed) {
    if (emptyFallback === undefined) return null;
    return <p className={cn('text-muted-foreground', className)}>{emptyFallback}</p>;
  }
  return (
    <div
      data-color-mode="light"
      className={cn('markdown-body product-description-markdown', className)}
      style={{ background: 'transparent' }}
    >
      <MarkdownPreview source={trimmed} />
    </div>
  );
}
