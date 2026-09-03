// server.js
// 역할: 브라우저(프론트엔드)의 요청을 받아, Claude API에 블로그 글 작성을 대신 요청하고
//       결과를 다시 브라우저로 돌려주는 중계 서버입니다. (로컬 컴퓨터에서 실행하는 용도)
// (API 키가 브라우저 코드에 노출되지 않도록, 반드시 서버를 거쳐서 호출합니다.)
//
// 실제 Claude API 호출 로직은 lib/generate.js에 모아뒀어요.
// 인터넷에 배포할 때 쓰는 api/generate.js도 같은 lib/generate.js를 사용해서
// 로직이 두 곳에서 따로 관리되지 않게 했습니다.

require('dotenv').config();
const express = require('express');
const { generateBlogDraft } = require('./lib/generate');

const app = express();
const PORT = process.env.PORT || 3000;

// 사진을 base64로 주고받으려면 기본 요청 크기 제한(100kb)로는 부족해서 넉넉하게 늘립니다.
app.use(express.json({ limit: '30mb' }));
app.use(express.static('public')); // public 폴더의 index.html, style.css, script.js를 그대로 제공

app.post('/api/generate', async (req, res) => {
  try {
    const resultText = await generateBlogDraft(req.body);
    res.json({ result: resultText });
  } catch (err) {
    console.error('Claude API 호출 오류:', err.message);
    const statusCode = err.statusCode || 500;
    const message = statusCode === 400
      ? err.message
      : 'AI 글 생성 중 오류가 발생했어요. API 키가 올바른지 확인해 주세요.';
    res.status(statusCode).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
