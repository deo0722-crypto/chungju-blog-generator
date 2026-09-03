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

## 4. 인터넷에 배포하기 (Vercel 무료 티어)

배포하면 주소만 있으면 어느 컴퓨터/휴대폰에서든 접속해서 바로 쓸 수 있어요. **각자 컴퓨터에 .env를 따로 설정할 필요가 없어집니다.**

1. https://vercel.com 접속 → **GitHub 계정으로 로그인**
2. 대시보드에서 **Add New... → Project** 클릭
3. 이 저장소(`chungju-blog-generator`)를 목록에서 찾아 **Import** 클릭
4. **Environment Variables** 항목에 아래처럼 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: 발급받은 `sk-ant-...` 키
5. **Deploy** 버튼 클릭 → 1~2분 후 `https://프로젝트이름.vercel.app` 주소 생성됨
6. 이 주소를 아무 컴퓨터/휴대폰 브라우저에서 열면 바로 사용 가능

> 코드는 이미 Vercel용으로 준비되어 있어요: 정적 화면은 `public/`, 서버리스 함수는 `api/generate.js`가 담당하고, `vercel.json`이 홈 화면 경로를 연결해줍니다.

> ⚠️ **사진 업로드 용량 제한**: Vercel 무료 티어는 요청 하나의 크기가 **4.5MB**로 제한돼요. 로컬(내 컴퓨터)에서는 사진 5장(각 5MB)까지 넉넉히 되지만, **배포된 사이트에서는 사진을 1~2장, 그것도 가급적 1MB 이하로 줄여서 올리는 걸 권장**해요. 용량이 너무 크면 "사진 첨부 없이 다시 시도해 주세요" 식으로 실패할 수 있어요.

## 폴더 구조

```
chungju-blog-generator/
├── public/
│   ├── index.html    # 입력 폼 + 출력 화면
│   ├── style.css      # 디자인
│   └── script.js      # 버튼 클릭 시 서버 호출 로직
├── lib/
│   └── generate.js    # Claude API 호출 핵심 로직 (로컬/배포 공통)
├── api/
│   └── generate.js    # Vercel 배포용 서버리스 함수
├── server.js           # 로컬 실행용 Express 서버
├── vercel.json          # Vercel 정적 파일 경로 설정
├── .env                 # API 키 (git에 올라가지 않음, 로컬 전용)
├── .env.example         # 키 입력 예시
└── package.json
```
