
# ZP Command — v2.1 (Ready for Netlify)
### 추가된 것
- C0: 보상 **캡 게이지**, **이상치 배지**, **상태→판단→지시** 3줄
- C4: **보상 타임라인(누적)**, **락업 캘린더(예정/해제)**

## 배포
1) 이 폴더 내용을 GitHub **리포지토리 최상단**에 업로드
2) Netlify → New site from Git → 리포 선택 (netlify.toml 자동)
3) 끝

## 데이터 교체
- /src/data/*.csv 헤더 유지, 행만 수정/추가
- settings.csv 의 last_month_profit, cap_ratio로 캡 게이지 계산
- ledger.csv 의 lock_until 로 락업 캘린더 표시
