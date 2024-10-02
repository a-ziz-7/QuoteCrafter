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
  const quoteGenerationPrompt = `Generate 2 unique, thought-provoking quotes about "${topic}". Follow these guidelines:
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
// return a promise

async function generateQuotes(topic) {
  //
  const quoteGenerationPrompt = `Generate 2 unique, thought-provoking quotes about "${topic}". Follow these guidelines:
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

async function generateRealisticQuotes(topic) {
  const realisticPrompt = `Generate 2 unique, realistic quotes about "${topic}". Follow these guidelines:
  1. Each quote should be between 10 to 20 words long.
  2. Use simple, conversational language that is easy to understand.
  3. Avoid metaphors, analogies, or overly abstract ideas—keep the quotes grounded and direct.
  4. Focus on practical, real-world advice or observations related to ${topic}.
  5. Provide different perspectives on ${topic} but avoid any philosophical, overly inspirational, or reflective tones.
  6. Make the quotes feel as though they are said by everyday people with relatable experiences.

  Format the output as two distinct quotes, separated by the '|' character.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: realisticPrompt },
    ],
  });
  return completion.choices[0];
}

async function generateAmoneStyleQuotes(topic) {
  const amonePrompt = `Generate 2 unique, whimsical, eccentric quotes about "${topic}" in the 'amone style'. Follow these guidelines:
  1. Each quote should be between 15 to 30 words long.
  2. Use abstract, surreal language and imaginative imagery to evoke a sense of wonder or oddity.
  3. Incorporate playful, unexpected metaphors or analogies that create a dream-like or otherworldly tone.
  4. Each quote should feel unconventional, as if it was spoken by a mysterious or eccentric character.
  5. Allow the quotes to be loosely connected to ${topic}, with room for interpretation and creativity.
  
  Format the output as two distinct quotes, separated by the '|' character.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: amonePrompt },
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

function createRealisticImagePrompt(topic, mood) {
  return `Create a square image related to "${topic}" with a ${mood} mood:

1. Style: Realistic, straightforward, and natural.
2. Composition: Clear, with focus on real-world objects or scenes related to ${topic}.
3. Elements: Use familiar, everyday elements that people associate with ${topic}.
4. Color: Stick to natural, subdued colors that evoke a ${mood} feeling.
5. Lighting: Soft, natural lighting that creates a realistic sense of space and mood.
6. Background: Keep it simple and realistic, with minimal distractions.
7. Detail: Focus on practical, real-world details that reflect ${topic}.

The image should look believable and directly connected to ${topic} without text.`;
}

function createAmoneStyleImagePrompt(topic, mood) {
  return `Create a square image related to "${topic}" with a ${mood} mood in the 'amone style':

1. Style: Whimsical, surreal, and dream-like.
2. Composition: Fluid and abstract, with an unusual arrangement of elements that invite interpretation.
3. Elements: Incorporate strange or fantastical elements loosely connected to ${topic}.
4. Color: Use a bold, unexpected color palette that enhances the ${mood} and creates an eccentric feel.
5. Lighting: Use dramatic or mysterious lighting to create intrigue and unpredictability.
6. Background: Abstract and ethereal, blending seamlessly with the main elements.
7. Detail: Incorporate playful, unexpected details that challenge conventional perceptions of ${topic}.

The image should be otherworldly, inspiring curiosity, and connected to ${topic} without text.`;
}

function sleep() {
  return new Promise(resolve => setTimeout(resolve, 100)); // 0.1 seconds
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

async function combineQuoteAndImage(quote, imageBuffer, outputPath, topic) {
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
    await sharp(image)
      .composite([
        { input: overlay, blend: 'over' },
        { input: textSvg, blend: 'over' }
      ])
      .toFile(outputPath);

    const uniqueName = generateUniqueName(topic.toLowerCase()); // Replace 'topic' with the actual topic if available
    const quotesFolderPath = 'quotes';
    const uniquePath = path.join(quotesFolderPath, uniqueName);

    // Save the image with the unique name
    await sharp(outputPath).toFile(uniquePath);

    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

async function generateImage(topic, quote, indexx) {
  const imagePrompt = createImagePrompt(topic, quote);
  const image = await openai.images.generate({
    model: d_model,
    // size: '512x512', 
    size: '1024x1024',
    prompt: imagePrompt
  });

  const imageUrl = image.data[0].url;

  // Download the image to a buffer
  const imageBuffer = await downloadImage(imageUrl);
  let path = `img/output_image_${indexx}.png`;
  // console.log(path);
  // Combine the image with the quote
  const c = await combineQuoteAndImage(quote, imageBuffer, 'public/' + path, topic);
  // console.log(c, 'c');
  // console.log(path);
  sleep();
  return path;
}

async function deleteImagesAndLogDir() {
  try {
    // Read the content of the directory
    const files = await fs.readdir('public/img');

    // Delete each file in the directory
    const deletePromises = files.map(file =>
      fs.unlink(path.join('public/img', file))
    );
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error during image deletion:', err);
  }
}

app.post('/generate', async (req, res) => {
  // refresh the page
  try {

    await deleteImagesAndLogDir();

    const { topic } = req.body;
    const quotes_completion = await generateQuotes(topic);
    let quotes = quoteSplitter(quotes_completion.message.content);
    console.log(quotes);
    let imagePromises = [];
    for (let i = 0; i < quotes.length; i++) {
      let promise = generateImage(topic, quotes[i], i);
      imagePromises.push(promise);
    }
    const images = await Promise.all(imagePromises);
    let imageUrls = [
      'img/output_image_0.png',
      'img/output_image_1.png',
      'img/output_image_2.png'
    ]
    console.log(imageUrls);
    console.log("--------------------");
    const result = quotes.map((quote, index) => ({
      quote,
      imageUrl: imageUrls[index]
    }));
    sleep();
    res.json({ topic, result });
    imagePromises = [];

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
  console.log(`QuoteCrafter app listening at http://localhost:${port}`);
});
