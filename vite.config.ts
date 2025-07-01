import { loadEnv, defineConfig } from 'vite';
import path, { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import svgLoader from 'vite-svg-loader';
import UnoCSS from 'unocss/vite';
import { version } from './package.json';

/** 配置项文档：https://cn.vitejs.dev/config */
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd()) as ImportMetaEnv;
  const { VITE_PUBLIC_PATH } = env;

  return {
    /** 打包时根据实际情况修改 base */
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true,
      /** 端口号 */
      port: 5173,
      /** 是否自动打开浏览器 */
      open: false,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        // 开发
        '/dev': {
          target: 'http://192.168.129.95:8080',
          ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/dev/, '')
        }
      },
      /** 预热常用文件，提高初始页面加载速度 */
      warmup: {
        clientFiles: ['./src/layouts/**/*.vue']
      }
    },
    build: {
      /** 单个 chunk 文件的大小超过 2048KB 时发出警告 */
      chunkSizeWarningLimit: 1500,
      /** 禁用 gzip 压缩大小报告 */
      reportCompressedSize: false,
      /** 打包后静态资源目录 */
      assetsDir: 'static',
      /** 构建目标 */
      target: 'esnext',
      /** 输出目录 */
      outDir: 'dist'
    },
    /** 混淆器 */
    esbuild:
      mode === 'development'
        ? undefined
        : {
            // 打包时移除 console.log
            pure: ['console.log'],
            // 打包时移除 debugger
            drop: ['debugger'],
            // 打包时移除所有注释
            legalComments: 'none'
          },
    /** Vite 插件 */
    plugins: [
      vue(),
      vueJsx(),
      /** 将 SVG 静态图转化为 Vue 组件 */
      svgLoader({ defaultImport: 'url' }),
      /** SVG */
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[dir]-[name]'
      }),
      /** UnoCSS */
      UnoCSS()
    ],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version) // 注入版本信息
    }
  };
});
