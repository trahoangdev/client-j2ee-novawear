import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    { from: 'bot', text: 'Xin chào! 👋 Tôi là trợ lý ảo của NovaWear. Tôi có thể giúp gì cho bạn?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemContext, setSystemContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (open && !systemContext) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      fetch(`${apiUrl}/api/products?size=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.content) {
            const list = d.content
              .map((p: any) => `- ${p.name}: Giá ${p.salePrice || p.price}đ (Tồn kho: ${p.stock})`)
              .join('\n');
            const contextStr = `DANH SÁCH NHỮNG SẢN PHẨM HIỆN CÓ TẠI CỬA HÀNG (Dữ liệu thực tế):\n${list}\n\nTUYỆT ĐỐI CHÚ Ý: Không được bịa ra bất cứ sản phẩm nào không nằm trong danh sách trên! Chỉ dùng thông tin từ danh sách này để báo cho khách. Nếu khách hỏi những món đồ lệch với danh sách, xin lỗi khách và tư vấn các món liên quan có trong danh sách.`;
            setSystemContext(contextStr);
          }
        })
        .catch((e) => console.error('Failed to load context', e));
    }
  }, [open, systemContext]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');
    setIsLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    try {
      const response = await fetch(`${apiUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Backend API Error');
      }

      setMessages((prev) => [...prev, { from: 'bot', text: '' }]);
      setIsLoading(false); // remove dot-bounce while streaming

      if (!response.body) throw new Error('No body in response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let textContent = '';
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // keep the last potentially incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            if (line.startsWith('data:')) {
              try {
                const rawData = line.replace(/^data:\s*/, '');
                const data = JSON.parse(rawData);
                if (typeof data.content === 'string') {
                  textContent += data.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = textContent;
                    return newMessages;
                  });
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Thành thật xin lỗi, hiện tại tôi đang gặp một chút sự cố hệ thống nên chưa thể phản hồi. Bạn hãy thử lại sau nhé!' },
      ]);
      setIsLoading(false);
    }
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
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm overflow-hidden',
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                {msg.from === 'user' ? (
                  msg.text
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      a: ({node, ...props}) => <a className="underline underline-offset-2 hover:opacity-80 break-words" target="_blank" rel="noopener noreferrer" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-bold text-base mb-2" {...props} />,
                      img: ({node, ...props}) => <img className="max-w-full h-auto rounded-md my-2 shadow-sm border border-border" loading="lazy" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-3 text-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
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
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend(input)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
