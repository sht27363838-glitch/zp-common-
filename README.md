
# ZP Command — v2.1a (Ready for Netlify)
### Hotfix
- JSX 텍스트 내 '>' 를 `&gt;` 로 치환 (Netlify/esbuild 파싱 오류 방지)

### 포함 사항
- C0: 보상 **캡 게이지**, **이상치 배지**, **상태→판단→지시** 3줄
- C4: **보상 타임라인(누적)**, **락업 캘린더(예정/해제)**

## 배포
1) 이 폴더 내용을 GitHub **리포지토리 최상단**에 업로드(덮어쓰기)
2) Netlify → New site from Git → 리포 선택 (netlify.toml 자동)
3) 끝

## 데이터 교체
- /src/data/*.csv 헤더 유지, 행만 수정/추가
- settings.csv : last_month_profit, cap_ratio
- ledger.csv : stable_amt, edge_amt, lock_until
