# 서버 배포 가이드 (210.99.215.195:5000 Registry)

## 1) 이미지 빌드 + 푸시 (로컬 개발 PC)

`doc-diff` 루트에서 실행:

```bash
# 필요 시 로그인
docker login 210.99.215.195:5000

# 백엔드 이미지 빌드/푸시
docker build -t 210.99.215.195:5000/docdiff-backend:latest ./backend
docker push 210.99.215.195:5000/docdiff-backend:latest

# 프론트 이미지 빌드/푸시
docker build -t 210.99.215.195:5000/docdiff-frontend:latest ./frontend
docker push 210.99.215.195:5000/docdiff-frontend:latest
```

태그를 분리하고 싶으면 `latest` 대신 날짜/버전을 사용하세요.

## 2) 서버 준비 (210.99.215.195)

서버에 아래 파일/폴더를 올립니다.

- `docker-compose.server.yml`
- `db/init` 폴더

예: `/opt/doc-diff` 디렉터리

```bash
mkdir -p /opt/doc-diff
cd /opt/doc-diff
```

## 3) 서버 실행

```bash
docker login 210.99.215.195:5000
docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
docker compose -f docker-compose.server.yml ps
```

## 4) 확인 URL

- 프론트: `http://210.99.215.195:5173`
- 백엔드 헬스체크: `http://210.99.215.195:8000/health`

## 5) 업데이트 배포

```bash
# 로컬에서 새 이미지 push 후
docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
```

## 6) Insecure Registry를 쓰는 경우

`210.99.215.195:5000` 이 HTTPS가 아닌 HTTP registry라면,
이미지 push/pull을 하는 모든 서버의 Docker 데몬 설정에 registry를 추가해야 합니다.

`/etc/docker/daemon.json` 예시:

```json
{
  "insecure-registries": ["210.99.215.195:5000"]
}
```

설정 후 Docker 재시작:

```bash
sudo systemctl restart docker
```
