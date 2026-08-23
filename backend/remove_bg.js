const Jimp = require('jimp');

async function removeWhiteBg() {
  try {
    const image = await Jimp.read('../frontend/public/logo.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is close to white, make it transparent
      if (r > 235 && g > 235 && b > 235) {
        this.bitmap.data[idx + 3] = 0; // alpha = 0
      }
    });
    
    await image.writeAsync('../frontend/public/logo.png');
    console.log('Background removed successfully!');
  } catch (err) {
    console.error('Error removing background:', err);
  }
}

removeWhiteBg();
