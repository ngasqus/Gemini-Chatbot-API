import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

// Initialize environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Send message and get response
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    
    res.json({ 
      result: response.text(),
      conversationId: Date.now().toString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from Gemini',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
