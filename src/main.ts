// core
import { createApp } from 'vue';
import App from '@/App.vue';
import store from '@/store';
import router from '@/router';
// 导入路由权限控制
import '@/router/permission';
// load
import { loadSvg } from '@/icons';
import { loadPlugins } from '@/plugins';
import { loadDirectives } from '@/directives';
// css
import 'uno.css';
import 'normalize.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@/styles/index.scss';
// 初始化主题系统
import { initThemeSystem } from '@/utils/env-theme';

const app = createApp(App);

// 初始化主题系统（在应用启动时立即执行）
initThemeSystem();

// 加载插件
loadPlugins(app);
// 加载全局 SVG
loadSvg(app);
// 加载自定义指令
loadDirectives(app);

// 使用路由
app.use(router);
// 使用状态管理
app.use(store);

app.mount('#app');
