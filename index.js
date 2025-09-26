import express from 'express'
import cors from 'cors'
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/chat', async(req, res) => {
    try {
        const { messages } = req.body
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 150,
            stream: false // Handle streaming on client or server
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data)
    } catch (error) {
        console.error('Chat error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});