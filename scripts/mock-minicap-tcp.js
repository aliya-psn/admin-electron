import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 兼容 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 9002;
const imgDir = path.join(__dirname, '../images');
const imgFiles = fs.readdirSync(imgDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

const banner = Buffer.alloc(32, 0x01); // bannerLength 要与electron里的保持一致

const server = net.createServer(socket => {
  // 发送banner
  socket.write(banner);
  let idx = 0;
  const sendImage = () => {
    const file = imgFiles[idx % imgFiles.length];
    const imgPath = path.join(imgDir, file);
    const buf = fs.readFileSync(imgPath);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32LE(buf.length, 0);
    socket.write(lenBuf);
    socket.write(buf);
    idx++;
    if (!socket.destroyed) {
      setTimeout(sendImage, 1000);
    }
  };
  sendImage();
});

server.listen(PORT, () => {
  console.log(`Mock minicap TCP 服务已启动: tcp://localhost:${PORT}`);
});
