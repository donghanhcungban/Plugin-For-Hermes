'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, MessageSquare, Send, Key, X, Cpu, Globe } from 'lucide-react';
import { ChatMessage } from '@/lib/gemini';

interface Props {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioVolume: number;
  messages: ChatMessage[];
  transcriptPreview: string;
  language: string;
  isMuted: boolean;
  apiKey: string;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  onToggleMute: () => void;
  onChangeLanguage: (lang: string) => void;
  onSaveApiKey: (key: string) => void;
}

export const CyberHUD: React.FC<Props> = ({
  status,
  messages,
  transcriptPreview,
  language,
  isMuted,
  apiKey,
  onToggleMic,
  onSendMessage,
  onToggleMute,
  onChangeLanguage,
  onSaveApiKey,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSaveKey = () => {
    onSaveApiKey(tempApiKey);
    setShowSettings(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10 animate-pulse';
      case 'thinking':
        return 'text-purple-400 border-purple-400 bg-purple-500/10 animate-pulse';
      case 'speaking':
        return 'text-blue-400 border-blue-400 bg-blue-500/10 animate-pulse';
      default:
        return 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'ĐANG LẮNG NGHE (STT)...';
      case 'thinking':
        return 'CYRA ĐANG XỬ LÝ (GEMINI)...';
      case 'speaking':
        return 'CYRA ĐANG NÓI (TTS)...';
      default:
        return 'CYRA SẴN SÀNG';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Brand Badge */}
        <div className="cyber-glass px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white cyber-text-glow flex items-center gap-2">
              CYRA <span className="text-xs px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">v3.0 3D</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">CYBERNETIC AI ASSISTANT</p>
          </div>
        </div>

        {/* Status Indicator & Settings */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-2 ${getStatusColor()}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {getStatusText()}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl cyber-glass text-muted-foreground hover:text-white hover:border-cyber-cyan transition-colors"
            title="Cài đặt API Key & Voice"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Overlay: Speech Recognition Live Transcript */}
      {status === 'listening' && (
        <div className="self-center my-auto pointer-events-auto max-w-lg w-full text-center">
          <div className="cyber-glass-glow px-6 py-4 rounded-2xl animate-bounce">
            <p className="text-xs font-mono text-cyber-cyan tracking-widest uppercase mb-1">STT Voice Input</p>
            <p className="text-base text-white font-medium italic">
              {transcriptPreview || 'Hãy nói điều gì đó với CYRA...'}
            </p>
          </div>
        </div>
      )}

      {/* Right Drawer: Chat History */}
      <div
        className={`absolute top-20 right-4 bottom-28 w-80 sm:w-96 cyber-glass rounded-2xl p-4 flex flex-col pointer-events-auto transition-all duration-300 ${
          showChatHistory ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyber-cyan" /> Nhật ký trò chuyện
          </span>
          <button onClick={() => setShowChatHistory(false)} className="text-muted-foreground hover:text-white text-xs">
            Ẩn
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl max-w-[85%] ${
                msg.sender === 'user'
                  ? 'ml-auto bg-cyber-blue/20 border border-cyber-blue/40 text-white'
                  : 'mr-auto bg-cyber-panel border border-cyber-border text-foreground'
              }`}
            >
              <div className="text-[10px] text-muted-foreground mb-1 flex items-center justify-between">
                <span>{msg.sender === 'user' ? 'Bạn' : 'CYRA AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-cyber-border">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan"
          />
          <button
            type="submit"
            className="p-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan rounded-xl hover:bg-cyber-cyan hover:text-black transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Toggle Chat Drawer Button (If hidden) */}
      {!showChatHistory && (
        <button
          onClick={() => setShowChatHistory(true)}
          className="absolute top-20 right-4 pointer-events-auto p-3 cyber-glass rounded-xl text-cyber-cyan hover:border-cyber-cyan"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Bottom Main Controls Bar */}
      <div className="flex items-center justify-center gap-4 pointer-events-auto mb-2">
        {/* Language Toggle */}
        <button
          onClick={() => onChangeLanguage(language === 'vi-VN' ? 'en-US' : 'vi-VN')}
          className="cyber-glass px-3 py-2 rounded-xl text-xs font-mono text-white hover:border-cyber-cyan flex items-center gap-1.5"
          title="Đổi ngôn ngữ STT/TTS"
        >
          <Globe className="w-4 h-4 text-cyber-cyan" />
          {language === 'vi-VN' ? 'VI' : 'EN'}
        </button>

        {/* Main Microphone Button (STT Trigger) */}
        <button
          onClick={onToggleMic}
          className={`p-5 rounded-full border-2 transition-all transform hover:scale-105 active:scale-95 ${
            status === 'listening'
              ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse'
              : 'cyber-button text-white shadow-[0_0_20px_rgba(0,243,255,0.4)]'
          }`}
          title={status === 'listening' ? 'Tắt Micro' : 'Bật Micro nói chuyện với CYRA'}
        >
          {status === 'listening' ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7 text-cyber-cyan" />}
        </button>

        {/* Mute Audio Button (TTS Control) */}
        <button
          onClick={onToggleMute}
          className="cyber-glass p-3 rounded-xl text-muted-foreground hover:text-white hover:border-cyber-cyan"
          title={isMuted ? 'Bật tiếng AI' : 'Tắt tiếng AI'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyber-cyan" />}
        </button>
      </div>

      {/* Settings Modal Dialog */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="cyber-glass-glow max-w-md w-full rounded-2xl p-6 relative text-white space-y-4">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold flex items-center gap-2 text-cyber-cyan">
              <Key className="w-5 h-5" /> Cài đặt Gemini API Key
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhập khóa **Google Gemini API Key** của bạn để trò chuyện trực tiếp với trí tuệ nhân tạo Gemini 2.5 Flash.
              Nếu bỏ trống, ứng dụng sẽ chạy ở chế độ **Demo Simulation**.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-cyber-cyan">Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyber-cyan text-black hover:bg-cyber-neon transition-colors"
              >
                Lưu Cài Đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
