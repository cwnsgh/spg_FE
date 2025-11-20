# spg_FE

SPG 사이트의 프론트엔드 프로젝트입니다.

## 기술 스택

- **Next.js 15** - React 기반 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **ESLint** - 코드 품질 관리

## 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
spg/
├── src/
│   └── app/           # Next.js App Router
├── public/            # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 백엔드 연동

백엔드 API는 다른 서버에서 제공되며, `/api` 엔드포인트를 통해 연동합니다.
