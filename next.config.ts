import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in `out/` for Firebase Hosting. render.yaml remains a fallback.
  // TODO(billing): 綠界 ECPay needs a server callback. When membership billing
  // is added, remove `output: "export"` or host the webhook on a separate service.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
