using System;
using UnityEngine;

namespace CyberAI
{
    public class STTManager : MonoBehaviour
    {
        public static STTManager Instance { get; private set; }

        public bool isListening = false;
        public string currentLanguage = "vi-VN";

        public event Action<string, bool> OnSpeechResult;
        public event Action<string> OnSpeechError;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void StartListening()
        {
            if (isListening) return;

            isListening = true;
            Debug.Log("[STT] Micro listening started for language: " + currentLanguage);

            #if UNITY_WEBGL && !UNITY_EDITOR
            // WebGL JavaScript SpeechRecognition bridge call
            Application.ExternalCall("UnityStartSTT", currentLanguage);
            #else
            // Editor / Mobile Native Speech Recognizer simulation
            Invoke(nameof(SimulateSpeechRecognized), 3.0f);
            #endif
        }

        public void StopListening()
        {
            if (!isListening) return;

            isListening = false;
            CancelInvoke(nameof(SimulateSpeechRecognized));
            Debug.Log("[STT] Micro listening stopped.");

            #if UNITY_WEBGL && !UNITY_EDITOR
            Application.ExternalCall("UnityStopSTT");
            #endif
        }

        // Native/WebGL callback receiver
        public void OnReceiveTranscript(string jsonResult)
        {
            // Parse transcript result
            OnSpeechResult?.Invoke(jsonResult, true);
            isListening = false;
        }

        private void SimulateSpeechRecognized()
        {
            if (!isListening) return;

            string simulatedText = "Xin chào CYRA, bạn có thể giới thiệu về bản thân được không?";
            OnSpeechResult?.Invoke(simulatedText, true);
            isListening = false;
        }
    }
}
