// script.js
// 역할: 폼 입력값을 모아서 서버(/api/generate)에 전달하고, 결과를 화면에 표시합니다.

const form = document.getElementById('blog-form');
const generateBtn = document.getElementById('generate-btn');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy-btn');
const photosInput = document.getElementById('photos');
const photoPreview = document.getElementById('photo-preview');

const MAX_PHOTOS = 5;
const MAX_PHOTO_MB = 5;

// 사진을 선택하면, 몇 번째 사진인지 알 수 있도록 작은 미리보기를 보여줍니다.
photosInput.addEventListener('change', () => {
  photoPreview.innerHTML = '';
  const files = Array.from(photosInput.files);

  if (files.length > MAX_PHOTOS) {
    alert(`사진은 최대 ${MAX_PHOTOS}장까지만 올릴 수 있어요.`);
    photosInput.value = '';
    return;
  }

  files.forEach((file, index) => {
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      alert(`"${file.name}" 파일이 너무 커요 (최대 ${MAX_PHOTO_MB}MB). 더 작은 사진으로 올려주세요.`);
      photosInput.value = '';
      photoPreview.innerHTML = '';
      return;
    }
    const url = URL.createObjectURL(file);
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.innerHTML = `<img src="${url}" alt="사진 ${index + 1}"><div class="photo-num">사진 ${index + 1}</div>`;
    photoPreview.appendChild(item);
  });
});

// 사진 파일을 서버로 보낼 수 있게 base64 문자열로 바꿔줍니다.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result 형식: "data:image/png;base64,AAAA..." → 앞부분(콤마 앞)을 잘라내야 함
      const [, base64] = reader.result.split(',');
      resolve({ mediaType: file.type, data: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const photoFiles = Array.from(photosInput.files);
  const photos = await Promise.all(photoFiles.map(fileToBase64));

  const payload = {
    title: document.getElementById('title').value.trim(),
    target: document.getElementById('target').value.trim(),
    keyInfo: document.getElementById('keyInfo').value.trim(),
    photos,
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
