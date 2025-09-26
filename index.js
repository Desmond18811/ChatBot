import express from 'express'
import cors from 'cors'
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'ChatGPT API Server is running!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        console.log('Received chat request with', messages.length, 'messages');

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 150,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        res.json(response.data);
    } catch (error) {
        console.error('Chat error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            return res.status(500).json({ error: 'Invalid API key configuration' });
        } else if (error.response?.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Service unavailable' });
        } else {
            return res.status(500).json({
                error: 'Failed to process chat request',
                details: error.message
            });
        }
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});