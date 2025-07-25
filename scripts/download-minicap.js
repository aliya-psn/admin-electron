#!/usr/bin/env node

/**
 * MiniCap 下载和安装脚本
 * 自动下载并安装 MiniCap 到 tools/minicap 目录
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const MINICAP_DIR = path.join(__dirname, '../tools/minicap');
const MINICAP_REPO = 'https://github.com/openstf/minicap.git';
const SUPPORTED_ABIS = ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'];

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 执行命令
 */
function execCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`执行命令: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出码: ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

/**
 * 检查是否已安装
 */
function isInstalled() {
  return (
    fs.existsSync(MINICAP_DIR) &&
    fs.existsSync(path.join(MINICAP_DIR, 'arm64-v8a', 'minicap')) &&
    fs.existsSync(path.join(MINICAP_DIR, 'arm64-v8a', 'minicap.so'))
  );
}

/**
 * 下载并安装 MiniCap
 */
async function installMinicap() {
  try {
    console.log('开始安装 MiniCap...');

    // 确保目录存在
    ensureDir(MINICAP_DIR);

    // 如果已存在，先删除
    if (fs.existsSync(path.join(MINICAP_DIR, '.git'))) {
      console.log('删除现有 MiniCap 目录...');
      fs.rmSync(MINICAP_DIR, { recursive: true, force: true });
      ensureDir(MINICAP_DIR);
    }

    // 克隆 MiniCap 仓库
    console.log('克隆 MiniCap 仓库...');
    await execCommand('git', ['clone', MINICAP_REPO, '.'], MINICAP_DIR);

    // 构建 MiniCap
    console.log('构建 MiniCap...');
    await execCommand('npm', ['install'], MINICAP_DIR);

    // 为每个架构构建
    for (const abi of SUPPORTED_ABIS) {
      console.log(`构建 ${abi} 架构...`);
      try {
        await execCommand('make', [abi], MINICAP_DIR);
      } catch (error) {
        console.warn(`构建 ${abi} 失败:`, error.message);
      }
    }

    console.log('MiniCap 安装完成！');

    // 验证安装
    if (isInstalled()) {
      console.log('✅ MiniCap 安装验证成功');
    } else {
      console.log('❌ MiniCap 安装验证失败');
    }
  } catch (error) {
    console.error('MiniCap 安装失败:', error.message);
    process.exit(1);
  }
}

/**
 * 显示使用说明
 */
function showUsage() {
  console.log(`
MiniCap 安装脚本

使用方法:
  node scripts/download-minicap.js [选项]

选项:
  --help, -h     显示帮助信息
  --force, -f    强制重新安装
  --check, -c    检查安装状态

示例:
  node scripts/download-minicap.js --force
  node scripts/download-minicap.js --check
`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  if (args.includes('--check') || args.includes('-c')) {
    if (isInstalled()) {
      console.log('✅ MiniCap 已安装');
      console.log('安装路径:', MINICAP_DIR);

      // 显示支持的架构
      for (const abi of SUPPORTED_ABIS) {
        const minicapPath = path.join(MINICAP_DIR, abi, 'minicap');
        const minicapSoPath = path.join(MINICAP_DIR, abi, 'minicap.so');

        if (fs.existsSync(minicapPath) && fs.existsSync(minicapSoPath)) {
          console.log(`  ✅ ${abi}`);
        } else {
          console.log(`  ❌ ${abi}`);
        }
      }
    } else {
      console.log('❌ MiniCap 未安装');
      console.log('运行以下命令安装:');
      console.log('  node scripts/download-minicap.js');
    }
    return;
  }

  const force = args.includes('--force') || args.includes('-f');

  if (isInstalled() && !force) {
    console.log('MiniCap 已安装，使用 --force 选项强制重新安装');
    return;
  }

  await installMinicap();
}

// 运行主函数
main().catch(console.error);
