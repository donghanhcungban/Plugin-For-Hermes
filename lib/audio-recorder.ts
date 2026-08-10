/**
 * Utility for handling Browser Audio Recording using MediaRecorder API
 */

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private durationSeconds: number = 0;
  private onDurationChange?: (duration: number) => void;
  private onDataAvailable?: (chunk: Blob) => void;

  constructor(options?: {
    onDurationChange?: (duration: number) => void;
    onDataAvailable?: (chunk: Blob) => void;
  }) {
    this.onDurationChange = options?.onDurationChange;
    this.onDataAvailable = options?.onDataAvailable;
  }

  async start(): Promise<void> {
    this.audioChunks = [];
    this.durationSeconds = 0;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          if (this.onDataAvailable) {
            this.onDataAvailable(event.data);
          }
        }
      };

      this.mediaRecorder.start(1000); // Collect data every 1s

      this.timerInterval = setInterval(() => {
        this.durationSeconds += 1;
        if (this.onDurationChange) {
          this.onDurationChange(this.durationSeconds);
        }
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("Microphone access denied or not supported.");
    }
  }

  stop(): Promise<{ blob: Blob; url: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("MediaRecorder is not initialized."));
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      const currentDuration = this.durationSeconds;

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getSupportedMimeType();
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all tracks in stream
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve({
          blob: audioBlob,
          url: audioUrl,
          duration: currentDuration,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/wav",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "";
  }
}
