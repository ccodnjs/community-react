# 과제 제출 정리

## 1. Git Repository

- Repository: https://github.com/ccodnjs/community-react
- 배포 주소: http://13.125.50.220
- 테스트 계정: `12345@email.com`
- 테스트 계정 비밀번호: 제출 전 실제 비밀번호 입력 필요

## 2. EC2 직접 배포 + Nginx 리버스 프록시

React + Spring Boot 프로젝트를 EC2 1대에 직접 설치하고, Nginx를 앞단 리버스 프록시로 구성했다.

- Region: ap-northeast-2, Seoul
- OS: Ubuntu 26.04 LTS
- Kernel: GNU/Linux 7.0.0-1009-aws x86_64
- Instance type: t3.micro
- Public IP: 13.125.50.220
- Storage: EBS 20 GiB, root filesystem 약 19 GiB
- Swap: 1 GiB
- 설치 확인: Node.js 20.20.2, pnpm 10.34.5, Java 21, Git, Nginx

직접 배포 과정에서는 React를 `pnpm build`로 빌드한 뒤 `/var/www/community`에 정적 파일을 배치했고, Nginx에서 `/posts`, `/comments`, `/users` 요청을 Spring Boot 백엔드로 프록시하도록 구성했다.

## 3. Docker Compose 통합 배포

React와 Spring Boot에 각각 멀티스테이지 Dockerfile을 작성하고, Docker Compose로 backend, frontend, nginx 컨테이너를 통합 실행했다.

- `backend`: Spring Boot 애플리케이션, 내부 포트 8080
- `frontend`: React 빌드 결과를 Nginx로 서빙, 내부 포트 80
- `nginx`: 외부 80 포트를 열고 frontend/backend로 리버스 프록시
- `backend-data`: H2 파일 DB 저장용 Docker volume

배포 명령:

```bash
ssh -i ~/Desktop/11/community-key.pem ubuntu@13.125.50.220
cd ~/community-react
git pull origin main
sudo docker compose build backend frontend
sudo docker compose up -d --force-recreate backend frontend nginx
sudo docker compose ps
```

현재 컨테이너 구성:

```text
community-backend   Spring Boot backend   8080/tcp
community-frontend  React frontend        80/tcp
community-nginx     Reverse proxy         0.0.0.0:80->80/tcp
```

Nginx 라우팅:

- `/posts`, `/comments`, `/users`, `/h2-console` -> backend
- `/` -> frontend

## 4. 환경 변수

Docker Compose에서 backend에 다음 환경 변수를 주입했다.

```text
SPRING_DATASOURCE_URL=jdbc:h2:file:/app/data/community
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

frontend는 같은 도메인에서 Nginx가 API를 프록시하도록 `VITE_API_BASE_URL`을 빈 값으로 빌드했다.

```text
VITE_API_BASE_URL=
```

## 5. 프로젝트 고도화 및 오류 수정

- 게시글 조회수 증가 API를 추가하고, 조회수 요청 실패 시 상세 조회로 fallback 처리했다.
- Nginx 라우팅 문제로 발생하던 `405 Not Allowed`를 `/posts`, `/comments`, `/users` API 프록시 설정으로 해결했다.
- 게시글 작성 시 `POST /posts`가 frontend Nginx로 들어가던 문제를 Docker Nginx 라우팅 수정으로 해결했다.
- 아이템 구매 가격이 frontend/backend에서 다르게 계산되던 문제를 수정했다.
- 아이템 장착 위치 CSS를 조정했다.
- 새싹 머리핀 이미지의 배경을 제거한 PNG 파일로 교체했다.
- EC2 디스크 부족 문제는 EBS를 20 GiB로 확장하고 root filesystem을 resize해서 해결했다.
- Docker 빌드 중 메모리 부족 문제는 1 GiB Swap을 추가해서 해결했다.

## 6. 선택 과제

RDS와 S3는 이번 제출 범위에서는 적용하지 않았다.

- DB: Docker volume 기반 H2 파일 DB 사용
- 이미지: frontend public asset 및 요청 body 기반 이미지 사용

## 7. AWS 서비스 스크린샷 체크리스트

제출 시 아래 화면을 캡처하면 된다.

- EC2 인스턴스 목록: `community-server`, running, t3.micro
- EC2 상세 정보: Public IP `13.125.50.220`
- EBS 볼륨 상세: 20 GiB
- 보안 그룹 인바운드 규칙: HTTP 80, SSH 22
- 브라우저 배포 화면: `http://13.125.50.220`
- EC2 터미널의 `sudo docker compose ps` 결과
- GitHub Repository 화면

## 8. 회고

이번 배포 과정에서 로컬 Mac 환경과 EC2 Ubuntu 환경의 차이를 명확히 구분하는 것이 중요하다는 점을 배웠다. 처음에는 로컬 터미널에서 `apt`를 실행하거나 EC2 경로와 Mac 경로를 혼동하는 문제가 있었지만, 이후 작업 위치를 분리하면서 배포 흐름을 정리할 수 있었다.

Nginx 리버스 프록시는 단순히 정적 파일을 서빙하는 것뿐 아니라, API 요청을 올바른 백엔드로 전달해야 한다는 점을 확인했다. 특히 Docker Compose 환경에서는 서비스 이름과 Docker DNS 동작을 고려해야 해서, Nginx resolver 설정과 upstream 경로를 함께 조정했다.

EC2의 작은 디스크와 메모리 환경에서는 Docker 이미지 빌드가 쉽게 실패할 수 있다는 것도 경험했다. 디스크를 확장하고 Swap을 추가하면서 실제 배포 환경에서 리소스 관리가 중요하다는 점을 알게 되었다.

## 9. AI 사용 기록

AI는 다음 작업에 활용했다.

- EC2 배포 순서 정리
- Nginx 리버스 프록시 설정 방향 확인
- Dockerfile과 Docker Compose 구성 보조
- GitHub push, rebase 충돌, 토큰 인증 문제 해결 안내
- Docker 빌드 중 디스크 부족 및 메모리 부족 문제 진단
- 게시글 조회수, 게시글 작성, 댓글 수정, 아이템 가격 차감 오류 원인 분석
- 제출 문서 작성 및 회고 정리
