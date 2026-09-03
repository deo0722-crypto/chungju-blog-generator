# 충주 문화도시센터 블로그 초안 생성기

공연명, 타겟, 홍보 내용을 입력하면 Claude AI가 네이버 블로그 홍보글 초안을 자동으로 써주는 웹앱입니다.

## 기술 스택

- **프론트엔드**: 순수 HTML/CSS/JS (빌드 도구 없음)
- **백엔드**: Node.js + Express
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)

## 1. 로컬에서 실행하기

```bash
# 1) 이 폴더로 이동
cd chungju-blog-generator

# 2) 필요한 패키지 설치 (최초 1회만)
npm install

# 3) .env 파일 열어서 발급받은 Claude API 키 붙여넣기
#    (파일 위치: ./​.env, 내용: ANTHROPIC_API_KEY=sk-ant-실제키)

# 4) 서버 실행
npm start
```

실행 후 브라우저에서 **http://localhost:3000** 접속.

## 2. API 키 발급 방법

1. https://console.anthropic.com 가입/로그인
2. 왼쪽 메뉴 **API Keys** → **Create Key**
3. 생성된 `sk-ant-...` 키를 `.env` 파일의 `ANTHROPIC_API_KEY=` 뒤에 붙여넣기
4. **Billing** 메뉴에서 결제 수단 등록 (사용한 만큼만 소액 청구)

## 3. 비용 절감 팁

`server.js` 안의 `model: 'claude-opus-5'` 부분을 `'claude-sonnet-5'`로 바꾸면 훨씬 저렴하면서도 블로그 글 품질은 충분히 좋습니다.

## 4. 인터넷에 배포하기 (선택, Vercel 무료 티어 기준)

로컬 테스트가 끝나고 실제로 다른 사람도 쓸 수 있게 하려면:

1. https://vercel.com 가입 (GitHub 계정으로 로그인 가능)
2. 이 프로젝트 폴더를 GitHub 저장소에 올리기
3. Vercel 대시보드 → **Add New Project** → 방금 올린 저장소 선택
4. **Environment Variables**에 `ANTHROPIC_API_KEY` 추가 (값: 발급받은 키)
5. **Deploy** 클릭 → 몇 분 뒤 `https://내프로젝트.vercel.app` 주소로 접속 가능

> 참고: 현재 코드는 Express 서버 형태라 Vercel에 그대로 올리면 서버리스 함수로 자동 변환되지 않을 수 있습니다. Vercel 배포 시에는 `server.js`의 `/api/generate` 로직을 `api/generate.js` 서버리스 함수 파일로 옮기는 작업이 추가로 필요합니다. 로컬 사용만 필요하시면 이 단계는 건너뛰셔도 됩니다.

## 폴더 구조

```
chungju-blog-generator/
├── public/
│   ├── index.html   # 입력 폼 + 출력 화면
│   ├── style.css     # 디자인
│   └── script.js     # 버튼 클릭 시 서버 호출 로직
├── server.js          # Claude API 호출 서버
├── .env               # API 키 (git에 올라가지 않음)
├── .env.example       # 키 입력 예시
└── package.json
```
