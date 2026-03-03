import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '../db/index.js';

export function getUploadPath(subfolder: string, filename: string): string {
  const dir = path.join(UPLOADS_DIR, subfolder);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function saveFile(subfolder: string, originalName: string, buffer: Buffer): string {
  const ext = path.extname(originalName) || '';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = getUploadPath(subfolder, safeName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${subfolder}/${safeName}`;
}

export function clearDirectoryContents(dirPath: string): void {
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath).forEach(file => {
    const target = path.join(dirPath, file);
    try { if (fs.statSync(target).isFile()) fs.unlinkSync(target); } catch { /* ignore */ }
  });
}
