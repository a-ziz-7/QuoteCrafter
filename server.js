require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");
require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const d_model = "dall-e-3";

async function generateQuotes(topic) {
  //
  const quoteGenerationPrompt = `Generate 3 unique, thought-provoking quotes about "${topic}". Follow these guidelines:
  1. Each quote should be between 10 to 25 words long.
  2. Vary the style: include one inspirational quote, one reflective quote, and one challenging or controversial quote.
  3. Use metaphors, analogies, or vivid imagery related to ${topic} where appropriate.
  4. Ensure each quote offers a different perspective or insight on ${topic}.
  5. Avoid clichés and overly common phrases.
  6. If applicable, subtly incorporate current events or modern context related to ${topic}.
  7. Make the quotes sound as if they could have been said by experts or thought leaders in fields related to ${topic}.

  Format the output as three distinct quotes, separated by the '|' character. Do not include attribution or quotation marks.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: quoteGenerationPrompt },
    ],
  });
  return completion.choices[0];
}

function createImagePrompt(topic, mood) {
  return `Create a square image related to "${topic}" with a ${mood} mood:

1. Style: Modern and visually striking.
2. Composition: Balanced, with a clear focal point.
3. Elements: Include symbolic or abstract elements related to ${topic}.
4. Color: Use a palette that evokes a ${mood} feeling.
5. Lighting: Enhance mood and draw attention to key elements.
6. Background: Contextual but not overpowering.
7. Detail: Include subtle details related to ${topic}.

Image should be thought-provoking and relate to ${topic} without text.`;
}

function quoteSplitter(quotes) {
  let arr = []
  let spl = quotes.split('|').map(quote => quote.trim());
  spl.forEach(q => {
    const proper_q = q.replace(/"/g, '');
    // console.log(proper_q);
    arr.push(proper_q);
  });
  return arr;
}

async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

function generateUniqueName(topic) {
  const uniqueId = crypto.randomBytes(4).toString('hex');
  return `image_${topic}_${uniqueId}.png`;
}

async function combineQuoteAndImage(quote, imageBuffer, topic) {
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
        background: { r: 0, g: 0, b: 0, alpha: 0.1 }
      }
    }).png().toBuffer();

    // Function to create text buffer
    const createTextBuffer = async (lines) => {
      const lineHeight = 40;
      const totalHeight = lines.length * lineHeight;
      const startY = 700 - (totalHeight / 2);

      const textElements = lines.map((line, index) => {
        const y = startY + (index * lineHeight);
        return `<text x="400" y="${y}" text-anchor="middle" class="title">${line}</text>`;
      }).join('');

      const svgImage = `
        <svg width="800" height="800">
          <style>
            .title { fill: #ffffff; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif; }
          </style>
          ${textElements}
        </svg>
      `;
      return Buffer.from(svgImage);
    };

    // Split the quote into lines
    const words = quote.split(' ');
    let lines = [];
    let currentLine = '';
    const maxLineLength = 45; // Adjust this value to change line length

    for (let word of words) {
      if ((currentLine + word).length > maxLineLength) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          // If a single word is longer than maxLineLength, we need to add it as is
          lines.push(word);
          currentLine = '';
        }
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Create text overlay
    const textSvg = await createTextBuffer(lines);

    // Combine image, overlay, and text
    const buffer = await sharp(image)
      .composite([
        { input: overlay, blend: 'over' },
        { input: textSvg, blend: 'over' }
      ])
      .toBuffer();

    // Convert buffer to base64
    const base64Image = buffer.toString('base64');

    const base64Url = `data:image/png;base64,${base64Image}`;

    const uniqueName = generateUniqueName(topic.toLowerCase());
    const quotesFolderPath = 'quotes';
    const uniquePath = path.join(quotesFolderPath, uniqueName);

    await sharp(buffer)
      .toFile(uniquePath);

    return base64Url;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

async function generateImage(topic, quote) {
  const imagePrompt = createImagePrompt(topic, quote);
  const image = await openai.images.generate({
    model: d_model,
    // size: '512x512',
    size: '1024x1024',
    prompt: imagePrompt
  });

  const imageUrl = image.data[0].url;

  const imageBuffer = await downloadImage(imageUrl);

  let url = await combineQuoteAndImage(quote, imageBuffer, topic);
  return url;
}

app.post('/generate', async (req, res) => {
  // refresh the page
  try {
    const { topic } = req.body;
    const quotes_completion = await generateQuotes(topic);
    let quotes = quoteSplitter(quotes_completion.message.content);
    console.log(quotes);

    let urls = await Promise.all(quotes.map(async (quote) => {
      return await generateImage(topic, quote);
    }));

    res.json({ urls, quotes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
  console.log(`QuoteCrafter app listening at http://localhost:${port}`);
});
