const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, 'public', 'images', 'products');

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      try {
        const buffer = await sharp(fullPath)
          .resize(800, null, { withoutEnlargement: true })
          .jpeg({ quality: 75 })
          .toBuffer();
        
        const tempPath = fullPath + '.tmp';
        fs.writeFileSync(tempPath, buffer);
        fs.renameSync(tempPath, fullPath);
        console.log('Compressed:', fullPath);
      } catch (err) {
        console.error('Error on', fullPath, err.message);
      }
    }
  }
}

processDirectory(targetDir).then(() => console.log('Done compressing all images!'));
