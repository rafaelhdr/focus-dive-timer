import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(() => {
  const isExtension = process.env.BUILD_TARGET === 'extension';

  return {
    server: {
      host: "::",
      port: 8081,
    },
    plugins: [
      react(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: isExtension ? {
      // Extension-specific build configuration
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          offscreen: path.resolve(__dirname, "offscreen.html"),
          background: path.resolve(__dirname, "src/background/index.ts"),
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === "background" ? "background.js" : "assets/[name].js",
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          // Disable code splitting for extensions
          manualChunks: undefined,
        },
      },
      // Ensure compatibility with extension environment
      target: 'es2015',
      minify: false, // Easier debugging in development
      sourcemap: false,
      cssCodeSplit: false,
    } : {
      // Regular web build configuration
      outDir: 'dist',
    },
    base: isExtension ? './' : '/',
  }
});
