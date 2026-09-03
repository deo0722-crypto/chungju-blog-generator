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
    const message = statusCode === 400
      ? err.message
      : 'AI 글 생성 중 오류가 발생했어요. API 키가 올바른지 확인해 주세요.';
    res.status(statusCode).json({ error: message });
  }
};
