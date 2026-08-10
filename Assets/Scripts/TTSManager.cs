using System;
using System.Collections;
using UnityEngine;

namespace CyberAI
{
    [RequireComponent(typeof(AudioSource))]
    public class TTSManager : MonoBehaviour
    {
        public static TTSManager Instance { get; private set; }

        public AudioSource audioSource;
        public bool isSpeaking = false;
        public float currentAudioVolume = 0f;

        private float[] spectrumData = new float[64];

        public event Action OnTTSStart;
        public event Action OnTTSEnd;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                audioSource = GetComponent<AudioSource>();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Update()
        {
            if (isSpeaking)
            {
                // FFT Audio Spectrum Analysis for 3D Lip Sync
                audioSource.GetSpectrumData(spectrumData, 0, FFTWindow.BlackmanHarris);
                
                float sum = 0f;
                for (int i = 0; i < spectrumData.Length; i++)
                {
                    sum += spectrumData[i];
                }
                
                currentAudioVolume = Mathf.Clamp01(sum * 25f);
            }
            else
            {
                currentAudioVolume = Mathf.Lerp(currentAudioVolume, 0f, Time.deltaTime * 10f);
            }
        }

        public void SpeakText(string text, string language = "vi-VN")
        {
            StopSpeaking();
            StartCoroutine(SpeakRoutine(text, language));
        }

        public void StopSpeaking()
        {
            StopAllCoroutines();
            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Stop();
            }
            isSpeaking = false;
            currentAudioVolume = 0f;
            OnTTSEnd?.Invoke();
        }

        private IEnumerator SpeakRoutine(string text, string language)
        {
            isSpeaking = true;
            OnTTSStart?.Invoke();

            #if UNITY_WEBGL && !UNITY_EDITOR
            Application.ExternalCall("UnityStartTTS", text, language);
            #endif

            // Simulate spoken audio duration based on word count
            int wordCount = text.Split(' ').Length;
            float duration = Mathf.Max(2.0f, wordCount * 0.35f);

            float elapsed = 0f;
            while (elapsed < duration && isSpeaking)
            {
                elapsed += Time.deltaTime;
                // Procedural speech modulation simulation when playing TTS
                float rhythm = Mathf.Sin(elapsed * 18f) * Mathf.Cos(elapsed * 9f);
                currentAudioVolume = Mathf.Clamp01((rhythm + 1f) * 0.4f + UnityEngine.Random.Range(0f, 0.2f));
                yield return null;
            }

            isSpeaking = false;
            currentAudioVolume = 0f;
            OnTTSEnd?.Invoke();
        }
    }
}
