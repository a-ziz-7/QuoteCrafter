const OpenAI = require("openai");
require('dotenv').config();
const openai = new OpenAI( {apiKey: process.env.OPENAI_API_KEY} );


async function generateQuotes() {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Generate 2 romantic quotes splitted by '|'" },
        ],
    });

    return completion.choices[0].message.content;
}

// Call the async function
const s = generateQuotes();
s.then(result => console.log(result));