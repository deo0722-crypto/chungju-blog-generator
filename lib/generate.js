// lib/generate.js
// 역할: 실제로 Claude API를 호출해서 블로그 초안을 만드는 핵심 로직입니다.
// 로컬 서버(server.js)와 Vercel 배포용 서버리스 함수(api/generate.js) 양쪽에서
// 똑같은 로직을 그대로 가져다 쓸 수 있도록 이 파일 하나로 모아뒀습니다.

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 프롬프트 템플릿: 사용자가 입력한 값을 아래 양식에 채워서 Claude에게 전달합니다.
function buildPrompt({ title, target, keyInfo, photoCount }) {
  const photoInstruction = photoCount > 0
    ? `사진 ${photoCount}장이 순서대로 첨부되어 있어(사진1~사진${photoCount}). 각 사진을 실제로 보고, 그 내용에 어울리는 글 위치에 [사진 N: 설명] 형태로 자연스럽게 배치해 줘.`
    : `첨부된 사진은 없어. 글 흐름상 사진이 들어가면 좋을 위치에 [사진 X: 설명] 형태로 자리만 표시해 줘.`;

  return `너는 공연·예술 전문 마케터이자 블로그 콘텐츠 에디터야. 충주문화관광재단 문화도시센터의 공연 홍보 및 티켓 판매 촉진을 위한 네이버 블로그 포스팅 초안을 작성해 줘.

[작성 목표]
- 검색 노출(SEO)과 예매 전환(티켓 구매)을 동시에 달성하는 글 작성
- 정보 전달에 그치지 않고, 타겟 독자의 호기심을 유발해 가보고 싶게 구성

[입력 정보]
- 공연명: ${title}
- 타겟 독자: ${target}
- 핵심 정보: ${keyInfo}
- 사진 정보: ${photoInstruction}

[작성 가이드라인]
1. 제목: 타겟의 클릭을 유발하는 매력적인 제목 3개 추천 ('충주' 키워드 포함)
2. 본문: 도입부(공감) -> 공연 소개(매력 포인트) -> [사진 X: 설명] 위치 지정 -> 관람/예매 정보 요약 -> 예매 유도(CTA)
3. 톤앤매너: 가독성이 좋은 경쾌하고 친근한 어조 (~해요, ~해보세요), 짧은 문단과 기호 활용`;
}

// title/target/keyInfo/photos를 받아서 완성된 블로그 초안 텍스트를 돌려줍니다.
// 입력값이 부족하면 statusCode=400인 에러를 던지고, API 자체 오류는 statusCode=500으로 처리됩니다.
async function generateBlogDraft({ title, target, keyInfo, photos }) {
  const photoList = Array.isArray(photos) ? photos.slice(0, 5) : []; // 안전하게 최대 5장까지만

  if (!title || !target || !keyInfo) {
    const err = new Error('공연명, 타겟 독자, 핵심 정보는 필수 입력값이에요.');
    err.statusCode = 400;
    throw err;
  }

  const prompt = buildPrompt({ title, target, keyInfo, photoCount: photoList.length });

  // Claude에게 보낼 내용 구성: 사진(이미지 블록)들을 먼저 넣고, 그다음 글 요청(텍스트)을 넣습니다.
  const content = [
    ...photoList.map((photo) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: photo.mediaType,
        data: photo.data,
      },
    })),
    { type: 'text', text: prompt },
  ];

  const message = await anthropic.messages.create({
    // 가장 성능이 좋은 최신 모델을 기본값으로 사용합니다.
    // 비용을 아끼고 싶다면 'claude-sonnet-5'로 바꿔도 충분히 좋은 품질이 나와요.
    model: 'claude-opus-5',
    // opus 모델은 답변 전에 내부적으로 "생각하는" 블록을 함께 반환하므로,
    // 실제 블로그 글 분량까지 넉넉히 나오도록 여유 있게 잡습니다.
    max_tokens: 4096,
    messages: [{ role: 'user', content }],
  });

  // content 배열에는 'thinking'(생각 과정) 블록과 'text'(실제 답변) 블록이 섞여 올 수 있어서,
  // 첫 번째 조각을 무조건 쓰지 않고 type이 'text'인 블록을 찾아서 사용합니다.
  const textBlock = message.content.find((block) => block.type === 'text');
  const resultText = textBlock ? textBlock.text : '';

  if (!resultText) {
    throw new Error('AI 응답에서 텍스트를 찾지 못했어요.');
  }

  return resultText;
}

module.exports = { generateBlogDraft };
