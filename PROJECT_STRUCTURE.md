# 项目目录结构

```
smart-label-generator/
├── src/                            # 应用源码
│   └── index.html                  # 主应用文件（单文件HTML应用）
│
├── electron/                       # Electron 主进程
│   └── main.js                     # 主进程入口文件
│
├── assets/                         # 静态资源
│   ├── README.md                   # 图标资源说明
│   ├── amap_legend_library_complete.html  # 图例库参考
│   └── screenshot.png              # 应用截图
│
├── .github/workflows/              # GitHub Actions
│   └── build.yml                   # 自动打包工作流
│
├── dist/                           # 构建输出（打包时生成）
│
├── .gitignore                      # Git 忽略文件
├── package.json                    # 项目配置和打包配置
└── README.md                       # 项目说明

```

## 文件说明

### src/index.html
- 完整的单文件HTML应用
- 包含所有CSS样式和JavaScript代码
- 依赖：xlsx (CDN), html2canvas (CDN)

### electron/main.js
- Electron 主进程入口
- 创建应用窗口
- 处理文件保存对话框

### package.json
- 项目元数据
- Electron Builder 打包配置
- 支持 Windows (exe) 和 macOS (dmg) 打包

### .github/workflows/build.yml
- GitHub Actions 自动打包配置
- 推送标签时自动创建 Release
- 同时构建 Windows 和 macOS 版本

## 打包输出

打包后会生成 `release/` 目录：

```
release/
├── 智能标签生成器 Setup 1.0.0.exe    # Windows 安装程序
├── 智能标签生成器 1.0.0.exe          # Windows 便携版
├── 智能标签生成器-1.0.0.dmg          # macOS 安装包
└── 智能标签生成器-1.0.0-mac.zip      # macOS 压缩包
```
