const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, 'public', 'images', 'products');

const dataFiles = [
  path.join(__dirname, 'src', 'data', 'products.js'),
  path.join(__dirname, 'backend', 'storage', 'app', 'products.json'),
  path.join(__dirname, 'sku_images_mapping.json')
];

let convertedCount = 0;
let errorCount = 0;

async function convertDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await convertDirectory(fullPath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      try {
        const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Convert to webp with 75% quality
        await sharp(fullPath)
          .resize(800, null, { withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(webpPath);
          
        // Delete original file
        fs.unlinkSync(fullPath);
        convertedCount++;
        if (convertedCount % 10 === 0) {
          console.log(`Processed ${convertedCount} images...`);
        }
      } catch (err) {
        console.error(`Failed to process ${file}:`, err.message);
        errorCount++;
      }
    }
  }
}

function updateReferences() {
  console.log('\nUpdating file references to .webp...');
  for (const file of dataFiles) {
    if (!fs.existsSync(file)) {
      console.log(`Skipping file (not found): ${file}`);
      continue;
    }
    
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace all .jpg, .jpeg, .png (case insensitive) with .webp
      const updatedContent = content.replace(/\.(jpe?g|png)/gi, '.webp');
      
      fs.writeFileSync(file, updatedContent, 'utf8');
      console.log(`Updated references in: ${path.basename(file)}`);
    } catch (err) {
      console.error(`Failed to update references in ${file}:`, err.message);
    }
  }
}

async function run() {
  console.log('Starting image compression and format optimization to WebP...');
  console.log(`Scanning directory: ${targetDir}`);
  
  await convertDirectory(targetDir);
  
  console.log(`\nConversion complete!`);
  console.log(`Successfully converted & replaced: ${convertedCount} images.`);
  if (errorCount > 0) {
    console.log(`Errors encountered: ${errorCount}`);
  }
  
  updateReferences();
  console.log('\nAll conversion steps finished successfully.');
}

run().catch(console.error);
