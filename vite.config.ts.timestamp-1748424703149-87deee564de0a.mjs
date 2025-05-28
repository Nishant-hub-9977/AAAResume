// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import nodePolyfillsPlugin from "file:///home/project/node_modules/rollup-plugin-polyfill-node/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfillsPlugin({
      include: ["process"]
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  define: {
    "process.env": process.env
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfillsPlugin({
          include: ["process"]
        })
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgbm9kZVBvbHlmaWxsc1BsdWdpbiBmcm9tICdyb2xsdXAtcGx1Z2luLXBvbHlmaWxsLW5vZGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBub2RlUG9seWZpbGxzUGx1Z2luKHtcbiAgICAgIGluY2x1ZGU6IFsncHJvY2VzcyddXG4gICAgfSlcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXVxuICB9LFxuICBkZWZpbmU6IHtcbiAgICAncHJvY2Vzcy5lbnYnOiBwcm9jZXNzLmVudlxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgbm9kZVBvbHlmaWxsc1BsdWdpbih7XG4gICAgICAgICAgaW5jbHVkZTogWydwcm9jZXNzJ11cbiAgICAgICAgfSlcbiAgICAgIF1cbiAgICB9XG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8seUJBQXlCO0FBRWhDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLG9CQUFvQjtBQUFBLE1BQ2xCLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDckIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGVBQWUsUUFBUTtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUCxvQkFBb0I7QUFBQSxVQUNsQixTQUFTLENBQUMsU0FBUztBQUFBLFFBQ3JCLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
