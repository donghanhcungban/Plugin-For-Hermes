using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace CyberAI
{
    [Serializable]
    public class ChatMessage
    {
        public string id;
        public string sender; // "user", "ai", "system"
        public string text;
        public string timestamp;
    }

    [Serializable]
    public class GeminiPart
    {
        public string text;
    }

    [Serializable]
    public class GeminiContent
    {
        public string role;
        public GeminiPart[] parts;
    }

    [Serializable]
    public class GeminiRequest
    {
        public GeminiContent[] contents;
    }

    [Serializable]
    public class GeminiCandidate
    {
        public GeminiContent content;
    }

    [Serializable]
    public class GeminiResponse
    {
        public GeminiCandidate[] candidates;
    }

    public class GeminiManager : MonoBehaviour
    {
        public static GeminiManager Instance { get; private set; }

        [Header("API Configuration")]
        [SerializeField] private string apiKey = "";
        [SerializeField] private string modelName = "gemini-1.5-flash";

        private const string CYRA_SYSTEM_INSTRUCTION = 
            "Bạn là CYRA (Cybernetic Responsive Assistant) - Trợ lý AI 3D Unity Sci-Fi thông minh, thanh lịch và thân thiện trong dạng Robot Nữ Cyber Android.\n" +
            "Nhiệm vụ của bạn là giải đáp câu hỏi ngắn gọn (2-4 câu), sinh động, hỗ trợ bằng Tiếng Việt và Tiếng Anh. Luôn xưng là CYRA.";

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                apiKey = PlayerPrefs.GetString("CYRA_GEMINI_API_KEY", "");
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void SetApiKey(string key)
        {
            apiKey = key;
            PlayerPrefs.SetString("CYRA_GEMINI_API_KEY", key);
            PlayerPrefs.Save();
        }

        public string GetApiKey() => apiKey;

        public void GenerateResponse(string userPrompt, Action<string> onSuccess, Action<string> onError)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                // Fallback Demo Simulation Response
                StartCoroutine(SimulateDemoResponse(userPrompt, onSuccess));
                return;
            }

            StartCoroutine(SendGeminiRequest(userPrompt, onSuccess, onError));
        }

        private IEnumerator SendGeminiRequest(string userPrompt, Action<string> onSuccess, Action<string> onError)
        {
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";

            GeminiRequest reqObj = new GeminiRequest
            {
                contents = new GeminiContent[]
                {
                    new GeminiContent
                    {
                        role = "user",
                        parts = new GeminiPart[]
                        {
                            new GeminiPart { text = CYRA_SYSTEM_INSTRUCTION + "\nUser: " + userPrompt }
                        }
                    }
                }
            };

            string jsonPayload = JsonUtility.ToJson(reqObj);
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);

            using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        GeminiResponse resObj = JsonUtility.FromJson<GeminiResponse>(request.downloadHandler.text);
                        if (resObj != null && resObj.candidates != null && resObj.candidates.Length > 0)
                        {
                            string reply = resObj.candidates[0].content.parts[0].text;
                            onSuccess?.Invoke(reply.Trim());
                        }
                        else
                        {
                            onSuccess?.Invoke("CYRA đã nhận được câu hỏi nhưng kết quả chưa sẵn sàng.");
                        }
                    }
                    catch (Exception ex)
                    {
                        onError?.Invoke("Lỗi giải mã JSON Gemini: " + ex.Message);
                    }
                }
                else
                {
                    onError?.Invoke("Lỗi kết nối Gemini API: " + request.error);
                }
            }
        }

        private IEnumerator SimulateDemoResponse(string userPrompt, Action<string> onSuccess)
        {
            yield return new WaitForSeconds(1.0f);

            string p = userPrompt.ToLower();
            if (p.Contains("chào") || p.Contains("hello") || p.Contains("hi"))
            {
                onSuccess?.Invoke("Xin chào! Tôi là CYRA - Trợ lý AI Unity 3D. Tôi có thể giúp gì cho bạn hôm nay?");
            }
            else if (p.Contains("bạn là ai") || p.Contains("who are you"))
            {
                onSuccess?.Invoke("Tôi là CYRA, một trí tuệ nhân tạo được xây dựng trên nền tảng Unity 3D với khả năng giao tiếp giọng nói STT và TTS.");
            }
            else
            {
                onSuccess?.Invoke($"CYRA đã lắng nghe bạn: \"{userPrompt}\". Hãy nhập Gemini API Key trong phần Cài đặt để kích hoạt toàn bộ trí tuệ Gemini AI nhé!");
            }
        }
    }
}
