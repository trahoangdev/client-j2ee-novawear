import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickReplies = [
  { q: 'Chính sách đổi trả?', a: 'Bạn có thể yêu cầu đổi trả trong 7 ngày kể từ khi nhận hàng. Xem chi tiết tại mục Chính sách đổi trả.' },
  { q: 'Thời gian giao hàng?', a: 'Đơn hàng sẽ được giao trong 2-5 ngày làm việc tùy khu vực. Miễn phí vận chuyển cho đơn từ 200.000đ.' },
  { q: 'Cách chọn size?', a: 'Vui lòng tham khảo Hướng dẫn chọn size tại website. Nếu không chắc, hãy chọn size lớn hơn.' },
  { q: 'Phương thức thanh toán?', a: 'Chúng tôi hỗ trợ thanh toán COD, VNPay, và chuyển khoản ngân hàng.' },
];

interface Message {
  from: 'user' | 'bot';
  text: string;
}

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Xin chào! 👋 Tôi có thể giúp gì cho bạn?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');

    const match = quickReplies.find(
      (qr) => text.toLowerCase().includes(qr.q.toLowerCase().replace('?', ''))
    );

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: match?.a ?? 'Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất. Bạn cũng có thể liên hệ hotline hoặc email để được hỗ trợ nhanh hơn.',
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110',
          open ? 'bg-muted-foreground text-background' : 'bg-primary text-primary-foreground'
        )}
        aria-label={open ? 'Đóng chat' : 'Mở chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-[min(22rem,calc(100vw-3rem))] rounded-2xl shadow-2xl border border-border bg-background flex flex-col overflow-hidden transition-all duration-300',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ maxHeight: 'min(70vh, 28rem)' }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">Hỗ trợ NOVAWEAR</p>
            <p className="text-xs opacity-80">Thường trả lời ngay</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '12rem' }}>
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick replies */}
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => handleSend(qr.q)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {qr.q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
