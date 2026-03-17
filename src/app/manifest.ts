import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Where's Open?",
    short_name: "Where's Open",
    description: "Find what's actually open near you right now",
    start_url: "/map",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#0f0f1a",
    background_color: "#0f0f1a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
