# doc-diff Fullstack Starter

React(Frontend) + FastAPI(Python Backend) + PostgreSQL(DB) 구성입니다.

## 빠른 시작

```bash
docker compose up --build
```

실행 후 접속:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

## 로그인

- 아이디: `admin`
- 비밀번호: `supporter1@`

로그인해야 아이템 목록 화면을 볼 수 있습니다.

## 데이터 업로드

- `데이터 추가하기` 화면에서 그룹을 생성하거나 기존 그룹을 선택합니다.
- `.pdf`, `.xlsx` 파일을 여러 개 동시에 업로드할 수 있습니다.
- 저장 구조:
  - `data_groups`: 그룹
  - `data_owners`: 파일 단위 데이터 주인(소유자) + 원본 파일 + 업로드 시각
  - `data_records`: 각 주인에 연결된 상세 데이터(이름/전화번호/친밀도/전화 여부/당원 여부 + 기록 시각)

## 구조

- `frontend`: React + Vite
- `backend`: FastAPI + SQLAlchemy + psycopg
- `db/init`: PostgreSQL 초기 SQL 스크립트

## 종료

```bash
docker compose down
```

데이터까지 삭제하려면:

```bash
docker compose down -v
```
