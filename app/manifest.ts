import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ambient AI Assistant",
    short_name: "Ambient AI",
    description: "Trợ lý AI Cuộc họp & Ghi chú Trí nhớ Thông minh",
    start_url: "/",
    display: "standalone",
    background_color: "#060c18",
    theme_color: "#060c18",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
