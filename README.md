# DeskPet-rem 桌宠

一个基于 Electron 的桌面宠物应用，会常驻在你的屏幕角落，陪你摸鱼、卖萌、眨眼。

## 环境要求

| 依赖 | 版本 |
|------|------|
| Node.js | `v24.19.0` |
| npm | `11.17.0` |
| Electron | `^43.3.0`（通过 npm 自动安装） |
| 操作系统 | Windows 10/11 x64 |

> 说明：`electron-builder` 打包需要 Windows 环境与 .NET Framework。

可通过以下命令查看当前版本：

```bash
node -v
npm -v
```

## 安装

```bash
# 进入项目目录
cd desk-pet

# 安装依赖
npm install
```

## 使用方式

### 开发调试

```bash
npm run dev
# 或
npm start
```

启动后桌宠会出现在屏幕右下角。

### 打包

```bash
# 打包为 Windows 安装程序（NSIS .exe）
npm run build:win

# 仅打包为目录（不生成安装程序，调试用）
npm run pack
```

打包产物输出到 `release/` 目录：

- `release/win-unpacked/` — 免安装版本目录
- `release/deskpet-rem Setup x.x.x.exe` — NSIS 安装程序

## 功能介绍

桌宠是一只可爱的 rem 角色，具有以下能力：

- **常驻桌面**：透明无边框窗口，始终置顶，不占用任务栏，在所有工作区可见
- **拖动移动**：按住左键拖动桌宠到屏幕任意位置
- **点击互动**：单击桌宠会蹦跳，随机切换为「开心」或「眨眼」状态并弹出对话气泡
- **多状态切换**：通过右键菜单可切换四种心情
  - 👋 **Hello** — 打招呼
  - 😴 **Rest** — 休息
  - 😄 **Happy** — 超级开心
  - 😉 **Wink** — 眨眼俏皮
- **闲置休眠**：30 秒无操作自动进入休息状态，鼠标/键盘活动后重置计时
- **大小调节**：右键 → 设置，通过滑块调节桌宠大小（50%–200%），设置自动保存
- **单实例**：再次启动会聚焦已有窗口，不会开多个桌宠

## 项目结构

```
desk-pet/
├── main.js              # Electron 主进程（窗口、菜单、IPC）
├── preload.js           # 预加载脚本（安全暴露 API）
├── src/
│   ├── index.html       # 渲染进程页面
│   ├── renderer.js      # 前端逻辑（状态、拖拽、气泡）
│   ├── style.css        # 样式
│   └── assets/         # 桌宠图片资源
│       ├── hello.png
│       ├── happy.png
│       ├── rest.png
│       └── wink.png
├── build/
│   └── logo.png         # 应用图标
└── package.json         # 项目配置与打包脚本
```

## License

ISC
