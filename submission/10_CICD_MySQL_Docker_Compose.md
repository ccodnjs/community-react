# GitHub Actions CI/CD 및 MySQL Docker Compose 적용

## 목표

FE, BE 변경사항이 GitHub `main` 브랜치에 반영되면 GitHub Actions가 자동으로 빌드와 테스트를 수행하고, EC2에 접속해 Docker Compose로 `MySQL`, `Spring Boot BE`, `React FE`, `Nginx`를 한 번에 배포하도록 구성했다.

## 구성한 파이프라인

1. `backend-ci`
   - JDK 21 환경 구성
   - Gradle 캐시 적용
   - `./gradlew clean test bootJar --no-daemon`으로 백엔드 테스트 및 빌드 검증

2. `frontend-ci`
   - Node.js 20 환경 구성
   - pnpm 10.34.5 활성화
   - `pnpm install --frozen-lockfile`
   - `pnpm build`
   - `pnpm test`

3. `deploy`
   - GitHub Secrets에 저장된 SSH 키로 EC2 접속
   - EC2의 `~/community-react` 저장소를 `origin/main`으로 동기화
   - GitHub Secrets 기반으로 `.env` 생성
   - `sudo docker compose up -d --build mysql backend frontend nginx` 실행

## Docker Compose 구성

배포 단계에서 다음 컨테이너가 함께 생성된다.

- `community-mysql`: MySQL 8.4 데이터베이스
- `community-backend`: Spring Boot API 서버
- `community-frontend`: React 정적 파일 제공용 Nginx 컨테이너
- `community-nginx`: 외부 요청을 받는 리버스 프록시 및 HTTPS 처리 컨테이너

## Spring Boot DB 설정 변경

기존에는 `application.properties`가 H2 설정으로 고정되어 있었다. 이를 환경변수 기반으로 변경했다.

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:h2:file:./data/community}
spring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER_CLASS_NAME:org.h2.Driver}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:sa}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}
```

이렇게 구성하면 로컬 개발에서는 H2를 그대로 사용하고, Docker Compose 배포 환경에서는 MySQL 환경변수를 주입받아 MySQL에 연결된다.

## 필요한 GitHub Secrets

GitHub 저장소의 `Settings > Secrets and variables > Actions`에 아래 값을 등록해야 한다.

```text
EC2_HOST=13.125.50.220
EC2_USER=ubuntu
EC2_SSH_KEY=EC2 pem 키 내용 전체
MYSQL_ROOT_PASSWORD=루트 비밀번호
MYSQL_DATABASE=community
MYSQL_USER=community
MYSQL_PASSWORD=애플리케이션 DB 비밀번호
```

## 주의한 점

- 배포 명령은 반드시 EC2에서 실행되므로 GitHub Actions가 SSH로 EC2에 접속하도록 했다.
- GitHub Actions 러너가 EC2에 SSH 접속할 수 있어야 하므로 EC2 보안 그룹의 22번 포트 접근 범위를 확인해야 한다.
- `.github/workflows/deploy.yml` 파일을 GitHub에 push하려면 Personal Access Token에 `workflow` 권한이 필요하다.
- MySQL이 완전히 준비되기 전에 백엔드가 뜨지 않도록 `depends_on`과 `healthcheck`를 설정했다.
- 운영 Docker 환경에서는 H2 콘솔을 끄고 MySQL을 사용하도록 분리했다.
- Nginx는 `/api/` 요청을 백엔드로 넘기고, 나머지 화면 요청은 프론트엔드로 전달한다.
- HTTPS 인증서는 기존 EC2의 `/etc/letsencrypt` 경로를 Nginx 컨테이너에 읽기 전용으로 연결해 사용한다.

## 확인 명령

EC2에서 배포 상태를 확인할 때 사용한다.

```bash
ssh -i ~/Desktop/11/community-key.pem ubuntu@13.125.50.220
cd ~/community-react
sudo docker compose ps
curl -k -I https://localhost
curl -k -I https://localhost/api/posts
```

## 현재 한계

기존 H2 데이터는 MySQL로 자동 이전되지 않는다. MySQL로 전환하면 기존 계정과 게시글 데이터를 다시 넣거나, 별도 데이터 마이그레이션 SQL을 만들어 이전해야 한다.
