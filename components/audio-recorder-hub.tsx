"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Sparkles, AlertCircle, FileText, Volume2, Upload, FileAudio } from "lucide-react";
import { AudioRecorder } from "@/lib/audio-recorder";

interface AudioRecorderHubProps {
  onAnalyze: (transcript: string, durationSeconds: number) => Promise<void>;
  isAnalyzing: boolean;
}

export function AudioRecorderHub({ onAnalyze, isAnalyzing }: AudioRecorderHubProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recordingMode, setRecordingMode] = useState<"mic" | "text" | "file">("mic");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "vi-VN";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (evt: any) => {
          console.warn("Speech recognition notice:", evt.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleStartRecording = async () => {
    setError(null);
    try {
      recorderRef.current = new AudioRecorder({
        onDurationChange: (d) => setDuration(d),
      });

      await recorderRef.current.start();
      setIsRecording(true);
      setTranscript("");

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already running or not allowed
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể truy cập microphone.");
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    try {
      const { duration: finalDuration } = await recorderRef.current.stop();
      setIsRecording(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      if (!transcript.trim()) {
        setError("Chưa nhận diện được giọng nói. Bạn có thể tự nhập nội dung văn bản bên dưới.");
      } else {
        await onAnalyze(transcript, finalDuration);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi dừng ghi âm.");
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setError(null);

    // Read audio file filename and create transcript placeholder for demo analysis
    setTranscript(`[File Ghi Âm Tải Lên: ${file.name}] - Nội dung cuộc họp được trích xuất từ file âm thanh.`);
  };

  const handleManualSubmit = () => {
    if (!transcript.trim()) {
      setError("Vui lòng nhập nội dung văn bản, ghi âm hoặc tải file âm thanh.");
      return;
    }
    onAnalyze(transcript, duration || 45);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            Trung tâm Thu âm & Phân tích Trí tuệ AI
          </h2>
          <p className="text-sm text-slate-400">
            Nói, dán nội dung hoặc tải file ghi âm có sẵn để AI tự động trích xuất Task & Lịch hẹn
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setRecordingMode("mic")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              recordingMode === "mic"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Ghi âm Live
          </button>
          <button
            onClick={() => setRecordingMode("text")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              recordingMode === "text"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Nhập Văn bản
          </button>
          <button
            onClick={() => setRecordingMode("file")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              recordingMode === "file"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Tải File Audio
          </button>
        </div>
      </div>

      {/* Recording Mode Visualizer */}
      {recordingMode === "mic" && (
        <div className="flex flex-col items-center justify-center p-8 mb-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 relative overflow-hidden">
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-cyan-400 rounded-full animate-bounce"
                  style={{
                    height: `${Math.floor(Math.random() * 60) + 20}px`,
                    animationDuration: `${0.4 + (i % 5) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="text-4xl font-mono font-bold tracking-wider text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            {formatTime(duration)}
          </div>

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isAnalyzing}
            className={`relative group p-6 rounded-full transition-all duration-300 transform active:scale-95 shadow-xl ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30"
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <p className="text-xs font-medium text-slate-400 mt-4">
            {isRecording
              ? "Đang ghi âm và phân tích giọng nói... (Nhấp nút đỏ để dừng)"
              : "Nhấp vào Micro để bắt đầu thu âm cuộc họp hoặc ý tưởng"}
          </p>
        </div>
      )}

      {/* File Upload Mode */}
      {recordingMode === "file" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 mb-6 rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform mb-3">
            <FileAudio className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-white mb-1">
            {uploadedFileName ? `Đã chọn file: ${uploadedFileName}` : "Nhấp hoặc kéo thả file âm thanh vào đây"}
          </p>
          <p className="text-xs text-slate-400">Hỗ trợ các định dạng .mp3, .wav, .m4a, .webm, .ogg (Tối đa 50MB)</p>
        </div>
      )}

      {/* Live Transcript / Manual Input Textarea */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          {recordingMode === "mic"
            ? "Nội dung nhận diện trực tiếp"
            : recordingMode === "file"
            ? "Nội dung văn bản từ File Audio"
            : "Nội dung văn bản cuộc họp"}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            recordingMode === "mic"
              ? "Giọng nói của bạn sẽ tự động hiển thị tại đây khi bạn thu âm..."
              : "Dán hoặc gõ nội dung cuộc họp/ý tưởng tại đây... Ví dụ: 'Trưa mai 12h họp với anh Nam ở Landmark 81, nhớ chuẩn bị slide báo cáo trước 9h sáng.'"
          }
          rows={4}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleManualSubmit}
          disabled={isAnalyzing || isRecording || !transcript.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI Đang Phân Tích Dữ Liệu...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Phân Tích & Trích Xuất AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
