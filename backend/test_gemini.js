require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(name) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    console.log(`Sending prompt to ${name}...`);
    
    // Create a promise that rejects after 8 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout after 8s')), 8000)
    );
    
    const requestPromise = model.generateContent("Say hello!");
    
    const result = await Promise.race([requestPromise, timeoutPromise]);
    console.log(`Response from ${name}:`, result.response.text());
    return true;
  } catch (error) {
    console.error(`Error with ${name}:`, error.message || error);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-pro',
    'gemini-3.1-flash-lite',
    'gemini-2.0-flash'
  ];
  for (const m of models) {
    await testModel(m);
    console.log("---------------------------------------");
  }
}

run();
