
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Role, ChatState } from './types';
import { INITIAL_WELCOME } from './constants';
import EmergencyBanner from './components/EmergencyBanner';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        role: Role.MODEL,
        text: INITIAL_WELCOME,
        timestamp: new Date()
      }
    ],
    isLoading: false,
    error: null
  });
  
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'auto' // 串流時使用 auto 會比較跟得上
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  useEffect(() => {
    if (!state.isLoading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    const currentInput = inputValue;
    const userMessage: Message = {
      role: Role.USER,
      text: currentInput,
      timestamp: new Date()
    };

    // 建立一個空的模型訊息佔位
    const placeholderMessage: Message = {
      role: Role.MODEL,
      text: "",
      timestamp: new Date()
    };

    setInputValue('');
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, placeholderMessage],
      isLoading: true,
      error: null
    }));

    try {
      const sources = await geminiService.streamMessage(
        state.messages, 
        currentInput,
        (updatedText) => {
          // 更新最後一則訊息 (佔位訊息) 的內容
          setState(prev => {
            const newMessages = [...prev.messages];
            const lastIdx = newMessages.length - 1;
            if (newMessages[lastIdx].role === Role.MODEL) {
              newMessages[lastIdx] = {
                ...newMessages[lastIdx],
                text: updatedText
              };
            }
            return { ...prev, messages: newMessages };
          });
        }
      );
      
      // 最後更新來源資料
      if (sources) {
        setState(prev => {
          const newMessages = [...prev.messages];
          const lastIdx = newMessages.length - 1;
          newMessages[lastIdx] = { ...newMessages[lastIdx], sources };
          return { ...prev, messages: newMessages, isLoading: false };
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "發生未知錯誤"
      }));
    }
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex items-center space-x-4 flex-shrink-0">
        <div className="bg-white p-1 rounded-full">
          <img 
            src="https://picsum.photos/seed/fju/80/80" 
            alt="FJU Logo" 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">輔大醫務室</h1>
          <p className="text-xs text-blue-200 mt-1">全人照護小幫手 (AI 助理)</p>
        </div>
      </header>

      {/* Emergency Banner */}
      <EmergencyBanner />

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-2"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs px-4 py-2 rounded-full border border-blue-100 italic text-center">
            本助理僅供諮詢校內行政資訊，不具醫療診斷功能
          </div>
        </div>

        {state.messages.map((msg, idx) => (
          // 如果是最後一則訊息且正在讀取中且內容為空，暫不顯示或顯示 loading
          !(state.isLoading && idx === state.messages.length - 1 && !msg.text) ? (
            <ChatMessage key={idx} message={msg} />
          ) : null
        ))}

        {state.isLoading && state.messages[state.messages.length - 1].text === "" && (
          <div className="flex justify-start mb-4 animate-pulse">
            <div className="flex max-w-[80%] flex-row items-center">
              <div className="w-8 h-8 rounded-full bg-blue-400 mr-2"></div>
              <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100 mb-4">
            {state.error}
          </div>
        )}
      </main>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap flex-shrink-0">
        {[
          '今天有什麼門診？', 
          '週三下午有診嗎？', 
          '家醫科門診時間', 
          '學生保險理賠流程', 
          '醫務室在哪？'
        ].map((action) => (
          <button
            key={action}
            onClick={() => handleQuickAction(action)}
            disabled={state.isLoading}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <form onSubmit={handleSend} className="flex space-x-3 items-center">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={state.isLoading}
            placeholder={state.isLoading ? "小幫手查詢中..." : "請輸入您的問題..."}
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm text-black focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || state.isLoading}
            className={`p-3 rounded-full transition-all shadow-md ${
              !inputValue.trim() || state.isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          輔大醫務室 AI 小幫手：提供的資訊僅供參考，緊急情況請撥打 (02) 2905-2999
        </p>
      </div>
    </div>
  );
};

export default App;
