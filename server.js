const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

app.post('/api/daily-dump', async (req, res) => {
  try {
    const { articles } = req.body;
    
    console.log('Daily Dump API called with', articles?.length || 0, 'articles');
    console.log('OpenAI configured:', !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'No articles provided' });
    }

    const articleSummary = articles.map((a, i) => 
      `${i + 1}. "${a.title}" (${a.source}, ${a.date})`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an enthusiastic LSU Tigers sports reporter writing the "Daily Dump" - a fun, engaging summary of everything happening in LSU sports. Write in a conversational, fan-friendly tone. Use LSU slang like "Geaux Tigers!" when appropriate. Keep it informative but entertaining. Structure with clear sections for different sports/topics. Include emojis sparingly for emphasis.`
        },
        {
          role: 'user',
          content: `Write today's LSU Sports Daily Dump based on these recent news articles:\n\n${articleSummary}\n\nCreate an engaging summary covering all the major LSU sports news. Make it feel like a morning sports briefing for die-hard LSU fans.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content || 'Unable to generate summary.';
    
    res.json({ summary, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error generating daily dump:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to generate summary: ' + error.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
