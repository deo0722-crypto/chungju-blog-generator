// api/generate.js
// 역할: server.js와 똑같은 기능이지만, Vercel(인터넷 배포 서비스)이 자동으로 인식하는
//       "서버리스 함수" 형태로 만든 버전입니다. /api 폴더 안의 파일은 Vercel이
//       자동으로 각각 하나의 API 주소(/api/generate)로 만들어줍니다.
// 실제 로직은 lib/generate.js를 그대로 재사용합니다.

const { generateBlogDraft } = require('../lib/generate');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 요청만 지원해요.' });
    return;
  }

  try {
    const resultText = await generateBlogDraft(req.body);
    res.status(200).json({ result: resultText });
  } catch (err) {
    console.error('Claude API 호출 오류:', err.message);
    const statusCode = err.statusCode || 500;

    if (statusCode === 400) {
      res.status(400).json({ error: err.message });
      return;
    }

    // 원인을 바로 알 수 있도록 실제 오류 내용을 함께 알려줍니다.
    // (API 키 값 자체는 절대 응답에 포함되지 않아요.)
    const detail = err.status === 401
      ? 'API 키가 올바르지 않아요. Vercel의 환경변수(ANTHROPIC_API_KEY) 값을 다시 확인해 주세요.'
      : err.status === 400
        ? `요청 형식 오류: ${err.message}`
        : err.status === 429
          ? '요청이 너무 많거나 사용 한도를 초과했어요. Anthropic 콘솔의 Billing을 확인해 주세요.'
          : !process.env.ANTHROPIC_API_KEY
            ? 'ANTHROPIC_API_KEY 환경변수가 설정되어 있지 않아요.'
            : `알 수 없는 오류: ${err.message}`;

    res.status(statusCode).json({ error: `AI 글 생성 실패 — ${detail}` });
  }
};
