# 토마토 키우기 커뮤니티

React와 Spring Boot로 구현한 게임형 커뮤니티 서비스입니다. 사용자는 게시글과 댓글을 작성하며 햇빛 보상을 얻고, 보상으로 토마토 농부 아이템을 구매해 프로필을 꾸밀 수 있습니다.

- 배포 주소: http://13.125.50.220
- Repository: https://github.com/ccodnjs/community-react
- 주요 목표: React + Spring Boot 프로젝트를 EC2 1대에 배포하고, Docker Compose와 Nginx 리버스 프록시로 통합 운영

## 프로젝트 특징

- JWT 기반 로그인/회원가입 인증 흐름 구현
- 게시글 CRUD, 댓글 CRUD, 좋아요, 조회수 기능 구현
- 활동 보상으로 햇빛을 지급하고, 햇빛으로 아이템을 구매/장착하는 게임형 UX 적용
- React 정적 리소스와 Spring Boot API를 Nginx 리버스 프록시로 분리
- React와 Spring Boot 모두 멀티스테이지 Dockerfile 적용
- Docker Compose로 frontend, backend, nginx를 하나의 EC2 인스턴스에서 통합 실행
- EC2 디스크/메모리 부족, Nginx 라우팅, Docker DNS 문제를 실제 배포 환경에서 해결

## 기술 스택

### Frontend

- React
- Vite
- React Router
- pnpm
- Nginx 정적 파일 서빙

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- H2 Database
- Gradle

### Infra & Deployment

- AWS EC2
- EBS 20 GiB
- Docker
- Docker Compose
- Nginx Reverse Proxy

## 주요 기능

### 인증

- 회원가입
- 로그인
- JWT 토큰 기반 인증
- 보호 라우트 처리
- 회원 정보 수정
- 비밀번호 변경

### 커뮤니티

- 게시글 목록 조회
- 게시글 작성
- 게시글 상세 조회
- 게시글 수정/삭제
- 댓글 작성/수정/삭제
- 좋아요
- 조회수 증가
- 내가 작성한 게시글 조회

### 게임형 보상 시스템

- 사용자 활동에 따른 햇빛 보상 지급
- 햇빛 수에 따른 토마토 성장 단계 표시
- 아이템 상점
- 아이템 구매
- 아이템 장착/해제
- 프로필 꾸미기

## 시스템 구조

```text
Client Browser
    |
    v
EC2 Public IP:80
    |
    v
community-nginx
    |-- /posts, /comments, /users, /h2-console --> community-backend:8080
    |
    |-- / ---------------------------------------> community-frontend:80
```

## 프로젝트 구조

```text
.
├── backend/
│   ├── Dockerfile
│   ├── build.gradle
│   └── src/main/java/com/example/community/
│       ├── controller/
│       ├── domain/
│       ├── dto/
│       ├── exception/
│       ├── jwt/
│       ├── repository/
│       ├── security/
│       └── service/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── nginx.conf
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── nginx/
│   └── default.conf
├── docker-compose.yml
├── SUBMISSION.md
└── submission/
```

## Docker 구성

### Backend Dockerfile

Spring Boot는 Gradle JDK 이미지에서 jar를 빌드하고, JRE 이미지에 jar만 복사해 실행합니다.

```dockerfile
FROM gradle:8.14.3-jdk21 AS builder
...
RUN chmod +x gradlew && ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:21-jre
...
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Frontend Dockerfile

React는 Node 이미지에서 pnpm으로 빌드하고, Nginx 이미지에서 정적 파일을 서빙합니다.

```dockerfile
FROM node:20-alpine AS builder
...
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate && pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:1.28-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Docker Compose

```yaml
services:
  backend:
    container_name: community-backend
    expose:
      - "8080"

  frontend:
    container_name: community-frontend
    expose:
      - "80"

  nginx:
    container_name: community-nginx
    ports:
      - "80:80"
```

## Nginx Reverse Proxy

Docker Compose 환경에서 외부 요청은 `community-nginx`가 먼저 받고, 경로에 따라 frontend/backend로 전달합니다.

```nginx
location ~ ^/(posts|comments|users|h2-console)(/|$) {
    set $backend "backend";
    proxy_pass http://$backend:8080;
}

location / {
    set $frontend "frontend";
    proxy_pass http://$frontend:80;
}
```

## 로컬 실행

### Backend

```bash
cd backend
./gradlew bootRun
```

Backend 기본 주소:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend 기본 주소:

```text
http://localhost:5173
```

로컬에서 frontend가 backend API를 직접 바라보게 하려면 `frontend/.env`에 아래 값을 설정합니다.

```text
VITE_API_BASE_URL=http://localhost:8080
```

## Docker Compose 실행

```bash
docker compose up --build -d
docker compose ps
```

브라우저 접속:

```text
http://localhost
```

## EC2 배포 명령

```bash
ssh -i ~/Desktop/11/community-key.pem ubuntu@13.125.50.220
cd ~/community-react
git pull origin main
sudo docker compose build backend frontend
sudo docker compose up -d --force-recreate backend frontend nginx
sudo docker compose ps
```

## 환경 변수

Docker Compose에서 backend에 주입하는 환경 변수입니다.

```text
SPRING_DATASOURCE_URL=jdbc:h2:file:/app/data/community
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

frontend는 Nginx가 같은 도메인에서 API를 프록시하도록 `VITE_API_BASE_URL`을 빈 값으로 빌드합니다.

```text
VITE_API_BASE_URL=
```

## 배포 환경

- AWS Region: ap-northeast-2, Seoul
- OS: Ubuntu 26.04 LTS
- Instance type: t3.micro
- Public IP: 13.125.50.220
- Storage: EBS 20 GiB
- Swap: 1 GiB
- Runtime: Docker Compose

## 트러블슈팅

### 1. API 요청 405 Not Allowed

문제:

`POST /posts`, `PATCH /comments/{id}` 같은 API 요청이 backend가 아니라 frontend Nginx로 전달되어 `405 Not Allowed`가 발생했습니다.

해결:

Docker Nginx 설정에서 `/posts`, `/comments`, `/users` API 경로를 backend로 프록시하도록 수정했습니다.

### 2. Docker Nginx upstream host not found

문제:

Nginx 컨테이너가 `backend` upstream을 찾지 못해 종료되었습니다.

해결:

Docker DNS resolver인 `127.0.0.11`을 설정하고, proxy target을 변수로 분리해 컨테이너 시작 순서에 따른 DNS 문제를 줄였습니다.

### 3. no space left on device

문제:

EC2 기본 디스크 용량이 부족해 Docker 이미지 빌드가 실패했습니다.

해결:

EBS 볼륨을 20 GiB로 확장하고 root filesystem을 resize했습니다.

### 4. Gradle build daemon killed

문제:

t3.micro 환경에서 Docker 빌드 중 메모리가 부족해 Gradle 빌드가 중단되었습니다.

해결:

1 GiB Swap을 추가해 빌드 안정성을 확보했습니다.

### 5. 아이템 가격 차감 오류

문제:

frontend에 표시된 아이템 가격과 backend의 실제 차감 가격이 달라 햇빛이 잘못 차감되었습니다.

해결:

backend 아이템 가격을 기준으로 통일하고, frontend는 서버 응답의 가격을 우선 사용하도록 수정했습니다.

## 제출 문서

과제 제출용 문서는 아래 파일에 정리했습니다.

- `SUBMISSION.md`: 전체 제출 통합본
- `submission/01_제출_개요.md`
- `submission/02_작업_과정.md`
- `submission/03_AWS_스크린샷_목록.md`
- `submission/04_회고.md`
- `submission/05_AI_사용_기록.md`

## 향후 고도화 계획

- Docker Compose healthcheck 추가
- GitHub Actions CI 구성
- 게시글 검색/페이지네이션
- Swagger/OpenAPI 문서화
- RDS 적용
- S3 이미지 업로드 적용
- HTTPS 적용
