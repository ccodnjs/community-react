# AWS 서비스 스크린샷 목록

제출 시 아래 스크린샷을 첨부한다.

## 1. EC2 인스턴스 실행 화면

AWS Console > EC2 > 인스턴스 화면에서 다음 정보가 보이도록 캡처한다.

- 인스턴스 이름: `community-server`
- 인스턴스 상태: running
- 인스턴스 유형: t3.micro
- Public IP: 13.125.50.220
- 상태 검사: 통과

## 2. EC2 상세 정보 화면

인스턴스를 클릭한 뒤 상세 정보에서 다음 정보가 보이도록 캡처한다.

- Public IPv4 address
- Private IPv4 address
- OS 또는 AMI 정보
- 보안 그룹 연결 정보

## 3. EBS 볼륨 화면

AWS Console > EC2 > Elastic Block Store > 볼륨 화면에서 다음 정보가 보이도록 캡처한다.

- 볼륨 크기: 20 GiB
- 볼륨 상태: 사용 중
- 연결된 인스턴스: community-server

## 4. 보안 그룹 인바운드 규칙

인스턴스에 연결된 보안 그룹에서 인바운드 규칙을 캡처한다.

- SSH 22
- HTTP 80

## 5. 배포된 웹 서비스 화면

브라우저에서 아래 주소에 접속한 화면을 캡처한다.

- http://13.125.50.220

로그인, 게시글 목록, 게시글 작성 등 주요 기능 화면 중 하나 이상을 함께 캡처하면 좋다.

## 6. Docker Compose 실행 상태

EC2 터미널에서 아래 명령 실행 결과를 캡처한다.

```bash
ssh -i ~/Desktop/11/community-key.pem ubuntu@13.125.50.220
cd ~/community-react
sudo docker compose ps
```

확인되어야 하는 컨테이너:

- `community-backend`
- `community-frontend`
- `community-nginx`

## 7. 디스크 확장 확인

EC2 터미널에서 아래 명령 실행 결과를 캡처한다.

```bash
ssh -i ~/Desktop/11/community-key.pem ubuntu@13.125.50.220
df -h
```

`/dev/root`가 약 19G로 표시되면 EBS 20 GiB 확장이 정상 반영된 것이다.
