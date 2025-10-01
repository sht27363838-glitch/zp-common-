
# ZP Command — Ready for Netlify v2
- C0 지휘소: KPI 카드 + 매출 추세 차트 + 바벨 엣지 도넛
- C1 유입: 크리에이티브 리그(1,000회당 매출 막대) + 원본 테이블
- C4 보상엔진: 원장/리밸런스 테이블 (v2.1에서 타임라인/락업 추가 슬롯)

## 배포
1) 이 폴더 내용을 GitHub 리포지토리 **최상단**에 업로드
2) Netlify → New site from Git → 리포 선택 (netlify.toml로 자동)
3) 끝

## 데이터 교체
- /src/data/*.csv 의 헤더는 유지하고 행만 추가하세요.
- settings.csv 의 last_month_profit=0이어도 정상 표시.
