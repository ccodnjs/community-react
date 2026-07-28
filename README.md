# community-frontend-react

정적 HTML/CSS/JS 프론트를 React로 옮기기 위한 작업본입니다.

## 현재 옮긴 화면

- 로그인
- 회원가입
- 게시글 목록
- 내 게시글 목록

## 아직 남은 화면

- 게시글 상세
- 게시글 작성/수정
- 프로필 수정
- 비밀번호 수정
- 보상/아이템 관련 화면

## 실행 방법

```bash
pnpm install
pnpm dev
```

기본 백엔드 주소는 `http://localhost:8080`입니다.

다른 주소를 쓰려면 `.env` 파일에 아래 값을 넣으면 됩니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 구조

- `src/contexts/AuthContext.jsx`
  - 로그인 상태, 토큰 저장, 내 정보 동기화
- `src/lib/api.js`
  - API 요청 공통 처리
- `src/lib/ui.js`
  - 날짜/숫자/프로필 fallback 공통 함수
- `src/pages/*`
  - 화면 단위 컴포넌트
- `src/components/PostCard.jsx`
  - 게시글 카드 UI

## 메모

이번 작업본은 “정적 페이지 1개씩 복사”보다는 “공통 구조부터 먼저 세우고 페이지를 옮기는 방식”으로 시작했습니다.  
그래서 먼저 인증 흐름과 게시글 목록처럼 중심이 되는 화면부터 React로 분리해두었습니다.
