import { useState } from 'react';

interface TagData {
  标签名称: string;
  类型: string;
  id: string;
}

const sampleData: TagData[] = [
  { 标签名称: '测试标签1', 类型: '航线', id: '1' },
  { 标签名称: '测试标签2', 类型: '规划路', id: '2' },
];

function AppSimple() {
  const [tags, setTags] = useState<TagData[]>(() => {
    console.log('Initializing with sample data');
    return sampleData.map((tag, index) => ({ ...tag, id: `sample-${index}` }));
  });

  console.log('Render - tags:', tags);

  return (
    <div style={{ padding: '20px', background: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
      <h1>测试页面</h1>
      <p>标签数量: {tags.length}</p>
      <button 
        onClick={() => {
          console.log('Button clicked');
          setTags(sampleData.map((tag, index) => ({ ...tag, id: `new-${Date.now()}-${index}` })));
        }}
        style={{ padding: '10px 20px', margin: '10px 0', cursor: 'pointer' }}
      >
        加载示例
      </button>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {tags.map((tag) => (
          <div 
            key={tag.id} 
            style={{ 
              padding: '20px', 
              background: '#333', 
              borderRadius: '8px',
              border: '1px solid #555'
            }}
          >
            <div>ID: {tag.id}</div>
            <div>名称: {tag.标签名称}</div>
            <div>类型: {tag.类型}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppSimple;
