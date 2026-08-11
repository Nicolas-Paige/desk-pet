const sharp = require('sharp');
const path = require('path');

const files = [
  'src/assets/happy.png',
  'src/assets/hello.png',
  'src/assets/rest.png',
  'src/assets/wink.png',
  'build/logo.png'
];

async function processImage(inputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  const raw = await image.ensureAlpha().raw().toBuffer();
  const channels = 4;
  
  // Find bounding box of non-transparent content
  let minX = width, maxX = 0, minY = height, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = raw[idx + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  // Add small padding and crop
  const padding = 5;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  
  // Remove white-ish edge pixels (semi-transparent white fringe)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];
      const a = raw[idx + 3];
      
      // If pixel is mostly white and semi-transparent, make it more transparent
      if (a > 0 && a < 255) {
        const whiteness = (r + g + b) / 3;
        if (whiteness > 200) {
          // Reduce alpha based on whiteness
          const factor = (255 - whiteness) / 55;
          raw[idx + 3] = Math.max(0, Math.floor(a * factor));
        }
      }
    }
  }
  
  // Create output buffer from cropped region
  const outBuffer = Buffer.alloc(cropWidth * cropHeight * channels);
  
  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const srcIdx = ((minY + y) * width + (minX + x)) * channels;
      const dstIdx = (y * cropWidth + x) * channels;
      outBuffer[dstIdx] = raw[srcIdx];
      outBuffer[dstIdx + 1] = raw[srcIdx + 1];
      outBuffer[dstIdx + 2] = raw[srcIdx + 2];
      outBuffer[dstIdx + 3] = raw[srcIdx + 3];
    }
  }
  
  await sharp(outBuffer, {
    raw: {
      width: cropWidth,
      height: cropHeight,
      channels: channels
    }
  })
  .png()
  .toFile(inputPath);
  
  console.log(`Processed: ${inputPath} (${cropWidth}x${cropHeight})`);
}

async function main() {
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    try {
      await processImage(fullPath);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
  console.log('Done!');
}

main();
