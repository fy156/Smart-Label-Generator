# 智能标签生成器

一款专为UE/CIM数字孪生项目设计的智能标签生成工具，支持多种标签风格、批量导出和JSON格式输出。

## 功能特点

- 🎨 20种标签风格可选
- 📊 Excel导入批量生成
- 💾 多种格式导出（PNG/BMP/JPG/TGA/JSON）
- 🎯 6大类标签分类
- ✨ 自定义字体和样式
- 🖼️ 图标emoji支持

## 技术栈

- HTML5 + CSS3 + JavaScript
- Electron（桌面应用框架）
- XLSX（Excel处理）
- html2canvas（截图导出）

## 安装使用

### 开发模式

```bash
npm install
npm start
```

### 打包应用

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# 全部平台
npm run build:all
```

## 标签分类

- 行政区（省级、市级、区县等）
- 交通设施（高速公路、国道、省道等）
- 基础设施（发电厂、变电站等）
- 服务设施（医院、学校、商场等）
- 工业设施（工厂、仓库、矿山等）
- 水系设施（河流、湖泊、水库等）

## 导出格式

- CIM孪大师格式（JSON）
- CIM标准格式（POI JSON）
- 图片格式（PNG/BMP/JPG/TGA）

## 修复历史

### 2026-03-26 Electron 打包版导入/导出功能修复

#### 修复1：导入Excel功能
- **问题**: 打包后导入弹出两次选择框，提示 "XLSX.read is not a function"
- **修复措施**:
  - 新增 `importExcel()` 函数分离 Electron/浏览器路径
  - Electron环境直接调用 IPC (`open-file`)
  - 浏览器环境才触发 file input
  - 修改按钮 `onclick="importExcel()"`

#### 修复2：批量导出标签（JSON/CIM格式）
- **问题**: 打包后导出失败，无错误提示
- **修复措施**:
  - JSON格式导出添加 IPC 支持 (`save-file`)
  - CIM格式导出添加 IPC 支持
  - 使用 `TextEncoder` 将 JSON 转为 Uint8Array
  - 浏览器环境保持原有 `link.click()` 方式

#### 修复3：导出示例数据
- **问题**: 选择示例数据后无法导出Excel
- **修复措施**:
  - `exportSampleData()` 改为 async 函数
  - Electron环境使用 `XLSX.write()` + IPC
  - 浏览器环境保持 `XLSX.writeFile()`

#### 修复4：下载模板
- **修复措施**:
  - `downloadTemplate()` 改为 async 函数
  - Electron环境使用 `XLSX.write()` + IPC
  - 浏览器环境保持 `XLSX.writeFile()`

#### 修复5：XLSX 库本地离线化 - 2026-03-28
- **问题**: GitHub Actions 打包后 XLSX 库加载失败 (CDN 网络问题)
- **修复措施**:
  - 下载 `xlsx.full.min.js` 到 `src/lib/` 目录
  - 修改引用路径为本地路径 `lib/xlsx.full.min.js`
  - 避免打包后网络加载失败问题

#### 修复6：批量导出图片（PNG/JPG/BMP/TGA）- 2026-03-28
- **问题**: 打包后批量导出图片失败 (`link.click()` 被阻止)
- **修复措施**:
  - 添加 Electron IPC 支持 (`save-file`)
  - 将 Blob 转为 ArrayBuffer 再转为数组传输
  - 浏览器环境保持原有 `link.click()` 方式

#### 修复7：强制 XLSX 挂载到 window（方案A）- 2026-03-28
- **问题**: 打包后提示 "XLSX.read is not a function"
- **根因**: Electron `nodeIntegration: true` 时，XLSX 检测到 Node.js 环境，将自身导出为 `module.exports` 而不是挂载到 `window.XLSX`
- **修复措施**:
  - 在 XLSX 脚本后添加代码，检测 `typeof XLSX`
  - 未定义时使用 `require('./lib/xlsx.full.min.js')` 强制挂载到 `window.XLSX`
  - 确保渲染进程代码中 XLSX 全局可用

## 许可证

MIT License
