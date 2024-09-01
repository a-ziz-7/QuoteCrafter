const OpenAI = require("openai");
require('dotenv').config();
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const quote = "A software engineer who loves to build cool projects.";
const outputPath = 'output_image.png';

async function main() {
  // Generate the image using DALL-E
  const imageResponse = await openai.images.generate({
    model: "dall-e-2",
    size: '512x512',  // Changed size to 512x512 for better resolution
    prompt: quote
  });

  // Get the image URL
  const imageUrl = imageResponse.data[0].url;

  // Download the image to a buffer
  const imageBuffer = await downloadImage(imageUrl);

  // Combine the image with the quote
  await combineQuoteAndImage(quote, imageBuffer, outputPath);

  console.log(`Image saved to ${outputPath}`);
}

// Function to download image
async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

async function combineQuoteAndImage(quote, imageBuffer, outputPath) {
  try {
    // Resize the image to 800x800 for consistency
    const image = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'cover' })
      .toBuffer();

    // Create a semi-transparent overlay
    const overlay = await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.5 }
      }
    }).png().toBuffer();

    // Function to create text buffer
    const createTextBuffer = async (text) => {
      const svgImage = `
        <svg width="800" height="800">
          <style>
            .title { fill: #ffffff; font-size: 36px; font-weight: bold; font-family: Arial, sans-serif; }
          </style>
          <text x="400" y="700" text-anchor="middle" class="title">${text}</text>
        </svg>
      `;
      return Buffer.from(svgImage);
    };

    // Split the quote into lines
    const words = quote.split(' ');
    let lines = [];
    let currentLine = '';
    for (let word of words) {
      if ((currentLine + word).length > 20) {  // Adjusted line length
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Create text overlay
    const textSvg = await createTextBuffer(lines.join('\n'));

    // Combine image, overlay, and text
    await sharp(image)
      .composite([
        { input: overlay, blend: 'over' },
        { input: textSvg, blend: 'over' }
      ])
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

main();
