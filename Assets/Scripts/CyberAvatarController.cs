using UnityEngine;

namespace CyberAI
{
    public class CyberAvatarController : MonoBehaviour
    {
        public enum AvatarStatus { Idle, Listening, Thinking, Speaking }

        [Header("Status & State")]
        public AvatarStatus currentStatus = AvatarStatus.Idle;

        [Header("Transform References")]
        public Transform headTransform;
        public Transform chestTransform;
        public Transform jawTransform;
        public Transform leftEyelid;
        public Transform rightEyelid;
        public Transform leftEarRing;
        public Transform rightEarRing;

        [Header("Materials for URP Neon Glow")]
        public Material neonEmissiveMaterial;

        [Header("Colors for States")]
        public Color cyanColor = new Color(0f, 0.95f, 1f);
        public Color magentaColor = new Color(0.67f, 0f, 1f);
        public Color blueColor = new Color(0f, 0.53f, 1f);

        private Vector3 initialJawPos;
        private float blinkTimer = 0f;
        private float nextBlinkTime = 3f;

        private void Start()
        {
            if (jawTransform != null)
            {
                initialJawPos = jawTransform.localPosition;
            }
        }

        private void Update()
        {
            HandleMouseTracking();
            HandleBreathing();
            HandleBlinking();
            HandleLipSync();
            HandleEmissiveGlow();
        }

        private void HandleMouseTracking()
        {
            if (headTransform == null) return;

            Vector3 mousePos = Input.mousePosition;
            float normalizedX = (mousePos.x / Screen.width - 0.5f) * 2f;
            float normalizedY = (mousePos.y / Screen.height - 0.5f) * 2f;

            Quaternion targetHeadRot = Quaternion.Euler(-normalizedY * 20f, normalizedX * 30f, 0f);
            headTransform.localRotation = Quaternion.Slerp(headTransform.localRotation, targetHeadRot, Time.deltaTime * 5f);

            if (chestTransform != null)
            {
                Quaternion targetChestRot = Quaternion.Euler(0f, normalizedX * 10f, 0f);
                chestTransform.localRotation = Quaternion.Slerp(chestTransform.localRotation, targetChestRot, Time.deltaTime * 3f);
            }
        }

        private void HandleBreathing()
        {
            float breath = Mathf.Sin(Time.time * 2.2f) * 0.02f;
            transform.position = new Vector3(transform.position.x, breath, transform.position.z);
        }

        private void HandleBlinking()
        {
            blinkTimer += Time.deltaTime;
            if (blinkTimer > nextBlinkTime)
            {
                float blinkProgress = Mathf.Sin((blinkTimer - nextBlinkTime) * 25f);
                if (blinkProgress > 0f)
                {
                    if (leftEyelid != null) leftEyelid.localRotation = Quaternion.Euler(-90f + blinkProgress * 70f, 0f, 0f);
                    if (rightEyelid != null) rightEyelid.localRotation = Quaternion.Euler(-90f + blinkProgress * 70f, 0f, 0f);
                }
                else
                {
                    if (leftEyelid != null) leftEyelid.localRotation = Quaternion.Euler(-90f, 0f, 0f);
                    if (rightEyelid != null) rightEyelid.localRotation = Quaternion.Euler(-90f, 0f, 0f);
                    blinkTimer = 0f;
                    nextBlinkTime = Random.Range(2.5f, 6.0f);
                }
            }
        }

        private void HandleLipSync()
        {
            if (jawTransform == null) return;

            float audioVol = (TTSManager.Instance != null) ? TTSManager.Instance.currentAudioVolume : 0f;

            if (currentStatus == AvatarStatus.Speaking)
            {
                float mouthOpening = audioVol * 0.08f + Mathf.Sin(Time.time * 24f) * 0.015f;
                jawTransform.localPosition = initialJawPos + new Vector3(0f, -Mathf.Max(0f, mouthOpening), 0f);
            }
            else
            {
                jawTransform.localPosition = Vector3.Lerp(jawTransform.localPosition, initialJawPos, Time.deltaTime * 10f);
            }
        }

        private void HandleEmissiveGlow()
        {
            if (neonEmissiveMaterial == null) return;

            Color targetColor = cyanColor;
            float targetIntensity = 2.0f;

            switch (currentStatus)
            {
                case AvatarStatus.Listening:
                    targetColor = cyanColor;
                    targetIntensity = 3.5f + Mathf.Sin(Time.time * 9f) * 1.5f;
                    break;
                case AvatarStatus.Thinking:
                    targetColor = magentaColor;
                    targetIntensity = 3.8f + Mathf.Cos(Time.time * 14f) * 1.8f;
                    break;
                case AvatarStatus.Speaking:
                    targetColor = blueColor;
                    float vol = (TTSManager.Instance != null) ? TTSManager.Instance.currentAudioVolume : 0f;
                    targetIntensity = 2.8f + vol * 5f;
                    break;
                default:
                    targetIntensity = 2.0f + Mathf.Sin(Time.time * 2.5f) * 0.5f;
                    break;
            }

            neonEmissiveMaterial.SetColor("_EmissionColor", targetColor * targetIntensity);

            if (leftEarRing != null) leftEarRing.Rotate(0f, 0f, 40f * Time.deltaTime);
            if (rightEarRing != null) rightEarRing.Rotate(0f, 0f, -40f * Time.deltaTime);
        }

        public void SetStatus(AvatarStatus newStatus)
        {
            currentStatus = newStatus;
        }
    }
}
