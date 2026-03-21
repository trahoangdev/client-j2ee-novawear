import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Loader2, Calendar, Link as LinkIcon, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationsApi } from '@/lib/customerApi';
import type { NotificationDto, Page } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function NotificationsTab() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<Page<NotificationDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchNotifs = (page = 0) => {
    setLoading(true);
    notificationsApi.list({ page, size: 20 })
      .then((res) => setData(res.data))
      .catch(() => toast.error('Không thể tải thông báo'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifs();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = () => {
    if (!data || data.content.every(n => n.isRead)) return;
    setMarking(true);
    notificationsApi.markAllAsRead()
      .then(() => {
        toast.success("Đã xóa dấu thông báo chưa đọc");
        fetchNotifs(data.number);
      })
      .catch(() => toast.error("Có lỗi xảy ra"))
      .finally(() => setMarking(false));
  };

  const handleDeleteRead = () => {
    if (!data || data.content.every(n => !n.isRead)) return;
    setDeleting(true);
    notificationsApi.deleteRead()
      .then(() => {
        toast.success("Đã xóa các thông báo đã đọc");
        fetchNotifs(data.number);
      })
      .catch(() => toast.error("Có lỗi xảy ra khi xóa"))
      .finally(() => setDeleting(false));
  };

  const handleMarkRead = (notif: NotificationDto) => {
    if (notif.isRead) return;
    notificationsApi.markAsRead(notif.id)
      .then(() => {
        if (data) {
          setData({
            ...data,
            content: data.content.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
          });
        }
      })
      .catch(() => {});
  };

  if (!isAuthenticated) return null;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Thông báo của bạn
        </h2>
        <div className="flex gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteRead} 
            disabled={deleting || !data || data.content.every(n => !n.isRead)}
            className="gap-2 bg-background hover:bg-muted font-bold tracking-widest uppercase text-[10px]"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Xóa đã đọc
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllRead} 
            disabled={marking || !data || data.content.every(n => n.isRead)}
            className="gap-2 bg-background hover:bg-muted font-bold tracking-widest uppercase text-[10px]"
          >
            {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-2 sm:p-4 shadow-sm border border-border min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-medium animate-pulse text-sm">Đang tải thông báo...</p>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center px-4">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10 text-muted-foreground/30" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Bạn đã xem hết thông báo!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Hiện tại hệ thống không có cập nhật mới nào dành cho bạn.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {data.content.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, scale: 0.98, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                  className={cn(
                    "group relative flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-xl overflow-hidden transition-all duration-300",
                    notif.isRead ? "bg-background hover:bg-muted/50 border border-transparent" : "bg-primary/5 border border-primary/20 hover:border-primary/40"
                  )}
                  onClick={() => handleMarkRead(notif)}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-80" />
                  )}
                  
                  {/* Icon */}
                  <div className="shrink-0 flex items-start">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-base",
                      notif.isRead ? "bg-muted text-foreground/50" : "bg-background shadow-sm text-primary font-bold border border-primary/20"
                    )}>
                      {notif.type === 'ORDER' ? '📦' : notif.type === 'PROMO' ? '🎉' : '🔔'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant="outline" className={cn(
                        "px-2 py-0 text-[9px] tracking-wider font-bold uppercase rounded-full",
                        notif.type === 'ORDER' ? "border-blue-500/30 text-blue-600 bg-blue-500/5" :
                        notif.type === 'PROMO' ? "border-pink-500/30 text-pink-600 bg-pink-500/5" :
                        "border-zinc-500/30 text-zinc-600 bg-zinc-500/5"
                      )}>
                        {notif.type || 'HỆ THỐNG'}
                      </Badge>
                      <div className="flex items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 className={cn("text-sm sm:text-base leading-snug mb-1", notif.isRead ? "font-medium text-foreground/80" : "font-black text-foreground")}>
                      {notif.title}
                    </h3>
                    <p className={cn("text-xs leading-relaxed", notif.isRead ? "text-muted-foreground/80" : "text-muted-foreground/90 font-medium")}>
                      {notif.message}
                    </p>

                    {notif.linkTo && (
                      <Button asChild variant="link" className="px-0 mt-2 h-auto text-primary hover:text-primary font-bold text-xs uppercase tracking-widest">
                         <Link to={notif.linkTo}><LinkIcon className="w-3 h-3 mr-1.5" /> Xem chi tiết</Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */ }
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 pb-2 border-t border-border/40 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shadow-sm"
              disabled={data.number === 0 || loading}
              onClick={() => fetchNotifs(data.number - 1)}
            >
              Trang Trước
            </Button>
            <span className="text-xs font-semibold text-muted-foreground mx-2">
              {data.number + 1} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shadow-sm"
              disabled={data.number >= data.totalPages - 1 || loading}
              onClick={() => fetchNotifs(data.number + 1)}
            >
              Trang Sau
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
