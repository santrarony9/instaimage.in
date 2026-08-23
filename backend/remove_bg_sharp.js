const sharp = require('sharp');

async function removeWhiteBg() {
  try {
    const inputPath = '../frontend/public/logo.png';
    const outputPath = '../frontend/public/logo_transparent.png'; // temporary name
    
    // Get raw pixel data
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Loop through pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If color is very close to white, set alpha to 0
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }

    // Save the new image, overwriting the old logo
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    }).toFile('../frontend/public/logo.png');

    console.log('White background removed and saved to logo.png');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeWhiteBg();
