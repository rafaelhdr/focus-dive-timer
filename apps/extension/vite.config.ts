import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isExtension = process.env.BUILD_TARGET === 'extension';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && !isExtension &&
      componentTagger(),
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
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/[name].js',
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
