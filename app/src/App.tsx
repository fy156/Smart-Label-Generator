import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, Eye, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import './App.css';

// 图标映射
const iconMap: Record<string, string> = {
  '航线': '✈️',
  '规划路': '🛤️',
  '城市道路': '🏙️',
  '省道': '🛣️',
  '高速': '🛣️',
  '铁路': '🚄',
  '地铁': '🚇',
  '机场': '🛫',
  '港口': '⚓',
  '桥梁': '🌉',
  '隧道': '🚇',
  '县道': '🚗',
  '乡道': '🛤️',
};

// 类型配色
const typeColors: Record<string, string> = {
  '航线': '#00d4aa',
  '规划路': '#d4a574',
  '城市道路': '#5aaaff',
  '省道': '#b08aff',
  '高速': '#ff6b6b',
  '铁路': '#ffd93d',
  '地铁': '#6bcf7f',
  '机场': '#4ecdc4',
  '港口': '#95e1d3',
  '桥梁': '#f38181',
  '隧道': '#6bcf7f',
  '县道': '#d4a574',
  '乡道': '#b08aff',
};

// 标签数据接口
interface TagData {
  标签名称: string;
  类型: string;
  id: string;
}

// Toast 提示接口
interface Toast {
  message: string;
  id: number;
}

// 示例数据
const sampleData: TagData[] = [
  { 标签名称: '江布拉克支线机场', 类型: '航线', id: '1' },
  { 标签名称: '规划铁路', 类型: '规划路', id: '2' },
  { 标签名称: '西黑山路', 类型: '城市道路', id: '3' },
  { 标签名称: '北环路', 类型: '城市道路', id: '4' },
  { 标签名称: '奇井路', 类型: '城市道路', id: '5' },
  { 标签名称: 'S228', 类型: '省道', id: '6' },
  { 标签名称: 'S327', 类型: '省道', id: '7' },
  { 标签名称: '五芨路', 类型: '城市道路', id: '8' },
];

// 单个标签组件
function TechTag({ data, onExport }: { data: TagData; onExport: (id: string) => void }) {
  const tagRef = useRef<HTMLDivElement>(null);
  const typeClass = `type-${data.类型}`;
  const icon = iconMap[data.类型] || '📍';

  return (
    <div className={`tag-container ${typeClass}`} ref={tagRef} id={`tag-${data.id}`}>
      {/* 标签主体 */}
      <div className="tech-tag">
        <div className="tag-icon-wrap">{icon}</div>
        <div className="tag-text">{data.标签名称}</div>
      </div>
      
      {/* 定位点 */}
      <div className="location-pin">
        <div className="pin-neck"></div>
        <div className="ripple-point">
          <div className="ripple-ring outer"></div>
          <div className="ripple-ring middle"></div>
          <div className="ripple-ring inner"></div>
          <div className="pin-dot"></div>
        </div>
      </div>
      
      {/* 导出按钮 */}
      <button
        onClick={() => onExport(data.id)}
        className="export-btn mt-4 px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10"
      >
        导出BMP
      </button>
    </div>
  );
}

function App() {
  // 页面加载时自动显示示例数据
  const [tags, setTags] = useState<TagData[]>(() => {
    // 使用函数式初始化，确保只执行一次
    return sampleData.map((tag, index) => ({ ...tag, id: `sample-${index}` }));
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastIdRef = useRef(0);

  // 显示 Toast
  const showToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { message, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  // 处理 Excel 导入
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Array<Record<string, string>>;

        if (jsonData.length === 0) {
          showToast('Excel 文件为空');
          return;
        }

        // 检查列名
        const firstRow = jsonData[0];
        const hasLabelName = '标签名称' in firstRow;
        const hasType = '类型' in firstRow;

        if (!hasLabelName || !hasType) {
          showToast('Excel 格式错误：需要包含「标签名称」和「类型」列');
          return;
        }

        // 转换数据
        const newTags: TagData[] = jsonData.map((row, index) => ({
          标签名称: String(row['标签名称'] || ''),
          类型: String(row['类型'] || ''),
          id: `${Date.now()}-${index}`,
        })).filter(tag => tag.标签名称 && tag.类型);

        setTags(newTags);
        showToast(`成功导入 ${newTags.length} 个标签`);
      } catch (error) {
        showToast('文件解析失败，请检查文件格式');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    // 清空 input 值以便可以重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showToast]);

  // 加载示例数据
  const loadSampleData = useCallback(() => {
    const newTags = sampleData.map((tag, index) => ({ ...tag, id: `${Date.now()}-${index}` }));
    console.log('Loading sample data:', newTags);
    setTags(newTags);
    showToast('已加载示例数据');
  }, [showToast]);

  // 清空数据
  const clearData = useCallback(() => {
    setTags([]);
    showToast('已清空所有标签');
  }, [showToast]);

  // 下载示例 Excel
  const downloadTemplate = useCallback(() => {
    const templateData = [
      { 标签名称: '示例标签1', 类型: '航线' },
      { 标签名称: '示例标签2', 类型: '城市道路' },
      { 标签名称: '示例标签3', 类型: '高速' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '标签模板');
    XLSX.writeFile(wb, '标签导入模板.xlsx');
    showToast('模板下载成功');
  }, [showToast]);

  // 将 Canvas 转换为 BMP 格式
  const canvasToBMP = useCallback((canvas: HTMLCanvasElement): Blob => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 canvas 上下文');

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 抠图处理：将深色背景设为透明
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 如果像素颜色接近背景色（深色），设为透明
      if (r < 20 && g < 20 && b < 20) {
        data[i + 3] = 0; // Alpha = 0
      }
    }

    // BMP 文件头 (14 字节)
    const fileHeaderSize = 14;
    // DIB 头 (40 字节，BITMAPINFOHEADER)
    const dibHeaderSize = 40;
    // 每行像素数据大小（4字节对齐）
    const rowSize = Math.ceil((width * 3) / 4) * 4;
    const pixelDataSize = rowSize * height;
    const fileSize = fileHeaderSize + dibHeaderSize + pixelDataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // 写入 BMP 文件头
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, fileSize, true); // 文件大小
    view.setUint32(6, 0, true); // 保留
    view.setUint32(10, fileHeaderSize + dibHeaderSize, true); // 像素数据偏移

    // 写入 DIB 头
    view.setUint32(14, dibHeaderSize, true); // DIB 头大小
    view.setInt32(18, width, true); // 宽度
    view.setInt32(22, height, true); // 高度
    view.setUint16(26, 1, true); // 颜色平面数
    view.setUint16(28, 24, true); // 每像素位数 (24位)
    view.setUint32(30, 0, true); // 压缩方式 (无压缩)
    view.setUint32(34, pixelDataSize, true); // 像素数据大小
    view.setInt32(38, 2835, true); // 水平分辨率 (72 DPI)
    view.setInt32(42, 2835, true); // 垂直分辨率 (72 DPI)
    view.setUint32(46, 0, true); // 调色板颜色数
    view.setUint32(50, 0, true); // 重要颜色数

    // 写入像素数据 (BGR 顺序，从下往上)
    let offset = fileHeaderSize + dibHeaderSize;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];

        // 如果透明，设为白色背景
        if (a === 0) {
          bytes[offset++] = 0xFF; // B
          bytes[offset++] = 0xFF; // G
          bytes[offset++] = 0xFF; // R
        } else {
          bytes[offset++] = b; // B
          bytes[offset++] = g; // G
          bytes[offset++] = r; // R
        }
      }
      // 填充行对齐
      const padding = rowSize - (width * 3);
      for (let p = 0; p < padding; p++) {
        bytes[offset++] = 0;
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }, []);

  // 导出单个标签
  const exportSingleTag = useCallback(async (id: string) => {
    const tagElement = document.getElementById(`tag-${id}`);
    if (!tagElement) {
      showToast('标签元素未找到');
      return;
    }

    const tagData = tags.find(t => t.id === id);
    if (!tagData) return;

    try {
      // 临时隐藏导出按钮
      const exportBtn = tagElement.querySelector('.export-btn') as HTMLElement;
      if (exportBtn) exportBtn.style.display = 'none';

      const canvas = await html2canvas(tagElement, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // 恢复导出按钮
      if (exportBtn) exportBtn.style.display = '';

      // 转换为 BMP
      const blob = canvasToBMP(canvas);
      const url = URL.createObjectURL(blob);

      // 下载文件
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tagData.标签名称}_标签.bmp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`已导出: ${tagData.标签名称}_标签.bmp`);
    } catch (error) {
      showToast('导出失败');
      console.error(error);
    }
  }, [tags, showToast, canvasToBMP]);

  // 批量导出所有标签
  const exportAllTags = useCallback(async () => {
    if (tags.length === 0) {
      showToast('没有可导出的标签');
      return;
    }

    showToast('开始批量导出...');
    let successCount = 0;

    for (const tag of tags) {
      try {
        const tagElement = document.getElementById(`tag-${tag.id}`);
        if (!tagElement) continue;

        // 临时隐藏导出按钮
        const exportBtn = tagElement.querySelector('.export-btn') as HTMLElement;
        if (exportBtn) exportBtn.style.display = 'none';

        const canvas = await html2canvas(tagElement, {
          backgroundColor: null,
          scale: 3,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        // 恢复导出按钮
        if (exportBtn) exportBtn.style.display = '';

        // 转换为 BMP
        const blob = canvasToBMP(canvas);
        const url = URL.createObjectURL(blob);

        // 下载文件
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tag.标签名称}_标签.bmp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        successCount++;

        // 添加延迟避免浏览器阻塞
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`导出标签 ${tag.标签名称} 失败:`, error);
      }
    }

    showToast(`批量导出完成: ${successCount}/${tags.length}`);
  }, [tags, showToast, canvasToBMP]);

  // 调试输出
  console.log('Render - tags count:', tags.length);
  console.log('Render - tags:', tags);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* 顶部控制面板 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 标题 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5aaaff] to-[#00d4aa] flex items-center justify-center">
                <span className="text-xl">🏷️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">智能标签生成器</h1>
                <p className="text-xs text-white/50">Excel 导入 · BMP 导出 · 科技风格</p>
              </div>
            </div>

            {/* 控制按钮组 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 导入按钮 */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 text-[#00d4aa] border border-[#00d4aa]/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                导入 Excel
              </Button>

              {/* 批量导出按钮 */}
              <Button
                onClick={exportAllTags}
                disabled={tags.length === 0}
                className="bg-[#5aaaff]/20 hover:bg-[#5aaaff]/30 text-[#5aaaff] border border-[#5aaaff]/30 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                导出全部 BMP
              </Button>

              {/* 加载示例 */}
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                加载示例
              </Button>

              {/* 清空 */}
              <Button
                onClick={clearData}
                disabled={tags.length === 0}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空
              </Button>

              {/* 下载模板 */}
              <Button
                onClick={downloadTemplate}
                variant="ghost"
                className="text-white/50 hover:text-white/70"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                下载模板
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          {tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6 text-sm">
              <span className="text-white/50">
                共 <span className="text-white font-medium">{tags.length}</span> 个标签
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(
                  tags.reduce((acc, tag) => {
                    acc[tag.类型] = (acc[tag.类型] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <span key={type} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: typeColors[type] || '#5aaaff' }}
                    />
                    <span className="text-white/70">{type}</span>
                    <span className="text-white/40">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 标签展示区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <span className="text-4xl opacity-50">📂</span>
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">暂无标签数据</h3>
            <p className="text-sm text-white/50 mb-6 max-w-md">
              请导入 Excel 文件（需包含「标签名称」和「类型」列），或加载示例数据预览效果
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 text-[#00d4aa] border border-[#00d4aa]/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                导入 Excel
              </Button>
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                加载示例
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {tags.map((tag) => (
              <TechTag
                key={tag.id}
                data={tag}
                onExport={exportSingleTag}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast 提示 */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
