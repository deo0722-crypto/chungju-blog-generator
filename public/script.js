// script.js
// 역할: 폼 입력값을 모아서 서버(/api/generate)에 전달하고, 결과를 화면에 표시합니다.

const form = document.getElementById('blog-form');
const generateBtn = document.getElementById('generate-btn');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById('title').value.trim(),
    target: document.getElementById('target').value.trim(),
    keyInfo: document.getElementById('keyInfo').value.trim(),
    photoInfo: document.getElementById('photoInfo').value.trim(),
  };

  // 버튼/출력창을 '생성 중' 상태로 전환
  generateBtn.disabled = true;
  generateBtn.textContent = '생성 중이에요... (10~20초 소요)';
  output.value = '';
  copyBtn.disabled = true;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '알 수 없는 오류가 발생했어요.');
    }

    output.value = data.result;
    copyBtn.disabled = false;
  } catch (err) {
    output.value = `⚠️ 오류: ${err.message}`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '블로그 글 생성하기';
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    const original = copyBtn.textContent;
    copyBtn.textContent = '복사 완료!';
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 1500);
  } catch (err) {
    alert('복사에 실패했어요. 텍스트를 직접 선택해서 복사해 주세요.');
  }
});
