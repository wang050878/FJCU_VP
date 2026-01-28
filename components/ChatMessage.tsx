
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;
  
  return (
    <div className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm
          ${isModel ? 'bg-blue-600 mr-2' : 'bg-slate-500 ml-2'}`}>
          {isModel ? 'FJU' : '您'}
        </div>
        
        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed
          ${isModel 
            ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none'}`}>
          <div className="whitespace-pre-wrap">
            {message.text}
          </div>
          
          {/* 顯示搜尋來源 */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">參考來源：</p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] bg-slate-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-50 transition-colors truncate max-w-[150px]"
                    title={source.title}
                  >
                    {source.title || '網頁連結'}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={`text-[10px] mt-1 opacity-60 ${isModel ? 'text-slate-400 text-left' : 'text-blue-100 text-right'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
