import iconGen from 'icon-gen';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const iconPath = process.argv[2] || process.env.ICON_PATH || path.resolve(__dirname, '../build/icon.png');
const outputDir = path.resolve(__dirname, '../build/icons');

if (!fs.existsSync(iconPath)) {
  console.error(`❌ 指定的 icon 文件不存在: ${iconPath}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

iconGen(iconPath, outputDir, {
  report: true,
  ico: { name: 'icon' },
  icns: { name: 'icon' },
  favicon: false
})
  .then(results => {
    console.log('✅ icon 生成成功:', results);
  })
  .catch(err => {
    console.error('❌ icon 生成失败:', err);
    process.exit(1);
  });
