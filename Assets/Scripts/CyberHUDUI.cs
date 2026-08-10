using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace CyberAI
{
    public class CyberHUDUI : MonoBehaviour
    {
        [Header("UI Status Text")]
        public Text statusText;

        [Header("UI Buttons")]
        public Button micButton;
        public Button muteButton;
        public Button settingsButton;
        public Button sendButton;

        [Header("UI Inputs")]
        public InputField chatInputField;
        public InputField apiKeyInputField;

        [Header("UI Panels")]
        public GameObject settingsModal;
        public Transform chatHistoryContainer;
        public GameObject chatBubblePrefab;

        [Header("References")]
        public CyberAvatarController avatarController;

        private bool isMuted = false;
        private List<ChatMessage> messages = new List<ChatMessage>();

        private void Start()
        {
            if (micButton != null) micButton.onClick.AddListener(OnMicButtonClicked);
            if (muteButton != null) muteButton.onClick.AddListener(OnMuteButtonClicked);
            if (settingsButton != null) settingsButton.onClick.AddListener(() => settingsModal.SetActive(true));
            if (sendButton != null) sendButton.onClick.AddListener(OnSendButtonClicked);

            if (STTManager.Instance != null)
            {
                STTManager.Instance.OnSpeechResult += OnSpeechRecognized;
            }

            AddChatMessage("CYRA AI", "Xin chào! Tôi là CYRA - Trợ lý AI Unity 3D. Hãy bấm nút Micro để nói chuyện với tôi nhé!");
        }

        private void OnMicButtonClicked()
        {
            if (STTManager.Instance == null) return;

            if (!STTManager.Instance.isListening)
            {
                if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Listening);
                UpdateStatusText("ĐANG LẮNG NGHE MICRO (STT)...");
                STTManager.Instance.StartListening();
            }
            else
            {
                STTManager.Instance.StopListening();
                if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Idle);
                UpdateStatusText("CYRA SẴN SÀNG");
            }
        }

        private void OnSpeechRecognized(string transcript, bool isFinal)
        {
            if (!isFinal) return;

            AddChatMessage("Bạn", transcript);
            ProcessUserPrompt(transcript);
        }

        private void OnSendButtonClicked()
        {
            if (chatInputField == null || string.IsNullOrEmpty(chatInputField.text)) return;

            string userText = chatInputField.text;
            chatInputField.text = "";
            AddChatMessage("Bạn", userText);
            ProcessUserPrompt(userText);
        }

        private void ProcessUserPrompt(string prompt)
        {
            if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Thinking);
            UpdateStatusText("CYRA ĐANG XỬ LÝ (GEMINI)...");

            GeminiManager.Instance.GenerateResponse(
                prompt,
                (replyText) =>
                {
                    AddChatMessage("CYRA AI", replyText);

                    if (!isMuted && TTSManager.Instance != null)
                    {
                        if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Speaking);
                        UpdateStatusText("CYRA ĐANG NÓI (TTS)...");

                        TTSManager.Instance.SpeakText(replyText, STTManager.Instance.currentLanguage);
                        TTSManager.Instance.OnTTSEnd += () =>
                        {
                            if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Idle);
                            UpdateStatusText("CYRA SẴN SÀNG");
                        };
                    }
                    else
                    {
                        if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Idle);
                        UpdateStatusText("CYRA SẴN SÀNG");
                    }
                },
                (errorMsg) =>
                {
                    AddChatMessage("CYRA AI", "Lỗi: " + errorMsg);
                    if (avatarController != null) avatarController.SetStatus(CyberAvatarController.AvatarStatus.Idle);
                    UpdateStatusText("CYRA SẴN SÀNG");
                }
            );
        }

        private void OnMuteButtonClicked()
        {
            isMuted = !isMuted;
            if (isMuted && TTSManager.Instance != null)
            {
                TTSManager.Instance.StopSpeaking();
            }
        }

        private void AddChatMessage(string sender, string text)
        {
            Debug.Log($"[{sender}]: {text}");
        }

        private void UpdateStatusText(string status)
        {
            if (statusText != null) statusText.text = status;
        }

        public void SaveApiKey()
        {
            if (apiKeyInputField != null && GeminiManager.Instance != null)
            {
                GeminiManager.Instance.SetApiKey(apiKeyInputField.text);
                if (settingsModal != null) settingsModal.SetActive(false);
            }
        }
    }
}
