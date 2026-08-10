// Speech-to-Text (STT) Manager using Web Speech API Recognition

export interface STTOptions {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechToTextManager {
  private recognition: any = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.isSupported = true;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public start(options: STTOptions): boolean {
    if (!this.isSupported || !this.recognition) {
      if (options.onError) {
        options.onError('Trình duyệt không hỗ trợ Web Speech Recognition API.');
      }
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = options.language || 'vi-VN';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (options.onResult) {
        if (finalTranscript) {
          options.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          options.onResult(interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('STT Error:', event.error);
      if (options.onError) {
        options.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) {
        options.onEnd();
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      console.error('STT Start exception:', err);
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error('STT Stop error:', err);
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const sttManager = new SpeechToTextManager();
