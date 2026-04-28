# 싸월급 (ssawolgeup) — 앱 정보 요약

## 한 줄 소개

**회사 화장실에서 월급을 번다** — 직장인 화장실 출석 체크 미니앱.

## 기본 정보

| 항목 | 값 |
|---|---|
| 앱 이름 (한글) | 싸월급 |
| 앱 이름 (코드) | `ssawolgeup` |
| 플랫폼 | AppsInToss (Toss 미니앱, Granite 1.0+ WebView) |
| 카테고리 | 비게임 (리워드/출석형) |
| 프라이머리 컬러 | `#FF6B35` (오렌지) |
| 언어 | 한국어 (`ko`) |

## 컨셉

직장인이 근무시간 중 **화장실에 간 시간을 타이머로 측정**하고, 누적 시간을 월급 기준으로 환산하여 "얼마만큼 벌었는지"를 보여주는 재미 기반 미니앱. 출석 체크, 랭킹, 리워드 시스템으로 재방문 유도.

## 화면 구성 (Routes)

| 경로 | 페이지 | 설명 |
|---|---|---|
| `/` | Intro | 인트로/랜딩 (심사 규정상 앱 시작 시 자동 로그인 금지) |
| `/home` | Home | 메인 대시보드 |
| `/timer` | Timer | 화장실 타이머 (핵심 기능) |
| `/stats` | Stats | 통계 (누적 시간·환산 금액) |
| `/ranking` | Ranking | 사용자 랭킹 |
| `/reward` | Reward | 리워드/상점 |
| `/settings` | Settings | 설정 (네비게이션바 액세서리 버튼) |

## 기술 스택

### Frontend
- **React 19.2** + **TypeScript 5**
- **Vite 6** (SWC) — 빌드
- **Tailwind CSS 4** + **shadcn-ui** (Radix UI) — UI
- **React Router 6** — SPA 라우팅
- **TanStack Query 5** — 서버 상태 관리
- **Zustand** — 클라이언트 상태 (authStore, shopStore)
- **Framer Motion** — 애니메이션
- **Recharts** — 통계 시각화
- **Zod + react-hook-form** — 폼/검증

### Backend
- **Supabase** — DB/Auth 백엔드
- **Vercel Serverless** (`api/` 디렉토리) — 서버 API
  - `auth/`, `check-in.ts`, `check-ins.ts`, `ranking.ts`, `promotion/`, `reward/`, `stats/`, `user/`, `achievements.ts`
- **JWT** (`jsonwebtoken`) — 자체 세션 토큰 (Toss OAuth 토큰은 서버에서만 보관)

### AppsInToss SDK
- `@apps-in-toss/web-framework` v2.0.1

## 네비게이션바 설정

```ts
navigationBar: {
  withBackButton: true,
  withHomeButton: true,
  initialAccessoryButton: {
    id: 'settings',
    title: '설정',
    icon: { name: 'icon-setting-mono' }, // 모노톤 아이콘 (규정 준수)
  },
}
```

## 예상 SDK 블록 조합

출석체크 + 리워드 형 앱이므로 다음 조합이 사용/사용 예정:

- `with-app-login` — 토스 로그인 (인트로 후 진행)
- `with-storage` — 네이티브 스토리지
- `with-rewarded-ad` / `with-banner-ad` — 광고 수익화
- `with-share-reward` — 공유 바이럴
- `with-haptic-feedback` — 타이머 인터랙션
- `promotion/` — 토스포인트 리워드 지급

참고 시나리오: `scenario-attendance-reward`, `scenario-mission-system`, `scenario-milestone-withdraw`.

## 디렉토리 구조

```
appintoss_싸월급/
├── src/
│   ├── App.tsx           # Router + Providers
│   ├── pages/            # 7개 페이지 (Intro, Home, Timer, Stats, Ranking, Reward, Settings)
│   ├── components/       # home/, layout/, ranking/, reward/, settings/, stats/, timer/, ui/
│   ├── stores/           # authStore, shopStore (Zustand)
│   ├── hooks/, lib/
│   └── test/
├── api/                  # Vercel Serverless Functions
│   ├── auth/, user/, promotion/, reward/, stats/
│   ├── check-in.ts, check-ins.ts, ranking.ts, achievements.ts
│   └── _lib/
├── supabase/             # Supabase 설정/마이그레이션
├── granite.config.ts     # AppsInToss 설정
├── index.html            # viewport pinch-zoom 비활성 적용됨
├── vercel.json           # Vercel 배포 설정
└── apps-in-toss-examples-robin/  # SDK 레퍼런스 예제 29개
```

## 심사 준수 현황 (검증 완료)

- [x] `user-scalable=no` 적용 (index.html)
- [x] 인트로(`/`) 분리 — 앱 시작 직후 `appLogin` 호출 금지 규정 준수
- [x] 네비게이션바 withBackButton/withHomeButton 활성
- [x] 네비게이션 액세서리 버튼은 1개, 모노톤 아이콘
- [x] 브랜딩 통일: `granite.config.ts` displayName = `<title>` = `og:title` = "싸월급"

## 배포

- **Frontend**: AppsInToss (Granite) — `ait build`
- **Backend API**: Vercel Serverless Functions (`api/`)
- **DB/Auth**: Supabase
