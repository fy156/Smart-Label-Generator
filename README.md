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

## 许可证

MIT License
