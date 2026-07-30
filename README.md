# community-react

Spring Boot 백엔드와 React 프론트를 함께 관리하는 저장소입니다.

## 구조

- `backend/`
  - Spring Boot API 서버
- `frontend/`
  - Vite 기반 React 클라이언트
- `nginx/`
  - Docker Compose 배포용 리버스 프록시 설정

## Docker 배포용 구조

과제 2번 진행을 위해 아래 파일을 기준으로 구성합니다.

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `nginx/default.conf`
- `docker-compose.yml`
- `.dockerignore`

## Docker Compose 실행

```bash
docker compose up --build
```

브라우저 접속 주소:

```bash
http://localhost
```

## 실행 방법

### backend

```bash
cd backend
./gradlew bootRun
```

### frontend

```bash
cd frontend
pnpm install
pnpm dev
```

기본 API 주소는 `http://localhost:8080`입니다.

프론트에서 다른 주소를 쓰려면 `frontend/.env` 파일에 아래 값을 넣으면 됩니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 메모

- 빌드 산출물(`build/`, `dist/`, `node_modules/` 등)은 저장소에서 제외합니다.
- 백엔드와 프론트 소스를 분리해서 관리해 구조를 더 읽기 쉽게 정리했습니다.
