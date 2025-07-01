## 🚀 依赖安装

```bash
# 因为需要安装 electron，建议使用yarn
yarn config set registry https://registry.npmmirror.com
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
yarn install
```

## ✔️ vite

```bash
# 启动
yarn dev

# 打包
yarn build
```

## 📦️ electron

```bash
# 启动
yarn electron:dev

# 打包
yarn electron:build
```

## 注意事项
- 修改了 electron 相关代码后需要重新运行；
- 现在的接口数据是在 api 中写死的，有需要可以自己调整，接口请求地址在 vite.config.ts中进行配置；
- 菜单目前可动态配置，在/store/modules/user 下，可修改或者新增菜单。（menus.value与router 的 name 相对应）；
- file-operations页面目前有两种文件操作方式：浏览器和 electron文件，根据实际打包环境进行不同方式的处理；
- system-features列举了一些 electron 支持的系统功能，按需使用；