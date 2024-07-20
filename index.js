const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

app.post('/webhook', async (req, res) => {
  const events = req.body.events;
  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      // ส่งข้อความไปยัง ChatGPT
      const gptResponse = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: userMessage,
        max_tokens: 100
      }, {
        headers: {
          'Authorization': `Bearer ${openaiKey}`
        }
      });

      const replyMessage = gptResponse.data.choices[0].text.trim();

      // ส่งข้อความตอบกลับไปยัง LINE
      await axios.post('https://api.line.me/v2/bot/message/reply', {
        replyToken: replyToken,
        messages: [{
          type: 'text',
          text: replyMessage
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${lineToken}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
