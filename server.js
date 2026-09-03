// server.js
// 역할: 브라우저(프론트엔드)의 요청을 받아, Claude API에 블로그 글 작성을 대신 요청하고
//       결과를 다시 브라우저로 돌려주는 중계 서버입니다.
// (API 키가 브라우저 코드에 노출되지 않도록, 반드시 서버를 거쳐서 호출합니다.)

require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// .env 파일에서 API 키를 읽어옵니다.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static('public')); // public 폴더의 index.html, style.css, script.js를 그대로 제공

// 프롬프트 템플릿: 사용자가 입력한 값을 아래 양식에 채워서 Claude에게 전달합니다.
function buildPrompt({ title, target, keyInfo, photoInfo }) {
  return `너는 공연·예술 전문 마케터이자 블로그 콘텐츠 에디터야. 충주문화관광재단 문화도시센터의 공연 홍보 및 티켓 판매 촉진을 위한 네이버 블로그 포스팅 초안을 작성해 줘.

[작성 목표]
- 검색 노출(SEO)과 예매 전환(티켓 구매)을 동시에 달성하는 글 작성
- 정보 전달에 그치지 않고, 타겟 독자의 호기심을 유발해 가보고 싶게 구성

[입력 정보]
- 공연명: ${title}
- 타겟 독자: ${target}
- 핵심 정보: ${keyInfo}
- 사진 정보: ${photoInfo}

[작성 가이드라인]
1. 제목: 타겟의 클릭을 유발하는 매력적인 제목 3개 추천 ('충주' 키워드 포함)
2. 본문: 도입부(공감) -> 공연 소개(매력 포인트) -> [사진 X: 설명] 위치 지정 -> 관람/예매 정보 요약 -> 예매 유도(CTA)
3. 톤앤매너: 가독성이 좋은 경쾌하고 친근한 어조 (~해요, ~해보세요), 짧은 문단과 기호 활용`;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { title, target, keyInfo, photoInfo } = req.body;

    // 최소한의 입력값 검증
    if (!title || !target || !keyInfo) {
      return res.status(400).json({ error: '공연명, 타겟 독자, 핵심 정보는 필수 입력값이에요.' });
    }

    const prompt = buildPrompt({ title, target, keyInfo, photoInfo: photoInfo || '없음' });

    const message = await anthropic.messages.create({
      // 가장 성능이 좋은 최신 모델을 기본값으로 사용합니다.
      // 비용을 아끼고 싶다면 'claude-sonnet-5'로 바꿔도 충분히 좋은 품질이 나와요.
      model: 'claude-opus-5',
      // opus 모델은 답변 전에 내부적으로 "생각하는" 블록을 함께 반환하므로,
      // 실제 블로그 글 분량까지 넉넉히 나오도록 여유 있게 잡습니다.
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    // content 배열에는 'thinking'(생각 과정) 블록과 'text'(실제 답변) 블록이 섞여 올 수 있어서,
    // 첫 번째 조각을 무조건 쓰지 않고 type이 'text'인 블록을 찾아서 사용합니다.
    const textBlock = message.content.find((block) => block.type === 'text');
    const resultText = textBlock ? textBlock.text : '';

    if (!resultText) {
      throw new Error('AI 응답에서 텍스트를 찾지 못했어요.');
    }

    res.json({ result: resultText });
  } catch (err) {
    console.error('Claude API 호출 오류:', err.message);
    res.status(500).json({ error: 'AI 글 생성 중 오류가 발생했어요. API 키가 올바른지 확인해 주세요.' });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
