import net from 'net';
import { WebSocketServer } from 'ws';

// 1. 连接 minicap 的 socket
const MINICAP_PORT = 9002;
const WS_PORT = 9003;

const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket 图片流服务已启动: ws://localhost:${WS_PORT}`);

const client = net.connect({ port: MINICAP_PORT }, () => {
  console.log('已连接到 minicap');
});

let buffer = Buffer.alloc(0);
let readBannerBytes = 0;
const bannerLength = 2 + 4 + 4 + 4 + 4 + 4 + 4 + 4 + 1 + 1; // minicap banner长度
let banner = {};
let readFrameBytes = 0;
let frameBodyLength = 0;
let frameBody = Buffer.alloc(0);

client.on('data', data => {
  buffer = Buffer.concat([buffer, data]);
  while (true) {
    if (readBannerBytes < bannerLength) {
      // 读取banner
      if (buffer.length >= bannerLength) {
        banner = {
          version: buffer.readUInt8(0),
          length: buffer.readUInt8(1),
          pid: buffer.readUInt32LE(2),
          realWidth: buffer.readUInt32LE(6),
          realHeight: buffer.readUInt32LE(10),
          virtualWidth: buffer.readUInt32LE(14),
          virtualHeight: buffer.readUInt32LE(18),
          orientation: buffer.readUInt8(22),
          quirks: buffer.readUInt8(23)
        };
        buffer = buffer.slice(bannerLength);
        readBannerBytes = bannerLength;
        // console.log('minicap banner:', banner);
      } else {
        break;
      }
    } else if (readFrameBytes < 4) {
      // 读取帧长度
      if (buffer.length >= 4) {
        frameBodyLength = buffer.readUInt32LE(0);
        buffer = buffer.slice(4);
        readFrameBytes = 4;
      } else {
        break;
      }
    } else {
      // 读取帧内容
      if (buffer.length >= frameBodyLength) {
        frameBody = buffer.slice(0, frameBodyLength);
        // 推送给所有 WebSocket 客户端
        wss.clients.forEach(ws => {
          if (ws.readyState === ws.OPEN) {
            ws.send(frameBody);
          }
        });
        buffer = buffer.slice(frameBodyLength);
        readFrameBytes = 0;
        frameBodyLength = 0;
      } else {
        break;
      }
    }
  }
});

client.on('close', () => {
  console.log('minicap 连接已关闭');
});
client.on('error', err => {
  console.error('minicap 连接错误:', err);
});
