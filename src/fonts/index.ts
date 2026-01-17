import fs from 'fs';
import path from 'path';

const fontsDir = path.join(process.cwd(), 'src/fonts');

export function getYoungSerifRegular(): string {
  const fontPath = path.join(fontsDir, 'YoungSerif-Regular.ttf');
  const buffer = fs.readFileSync(fontPath);
  return buffer.toString('base64');
}

export function getOpenSansRegular(): string {
  const fontPath = path.join(fontsDir, 'OpenSans-Regular.ttf');
  const buffer = fs.readFileSync(fontPath);
  return buffer.toString('base64');
}

export function getOpenSansBold(): string {
  const fontPath = path.join(fontsDir, 'OpenSans-Bold.ttf');
  const buffer = fs.readFileSync(fontPath);
  return buffer.toString('base64');
}

export function getOpenSansItalic(): string {
  const fontPath = path.join(fontsDir, 'OpenSans-Italic.ttf');
  const buffer = fs.readFileSync(fontPath);
  return buffer.toString('base64');
}
