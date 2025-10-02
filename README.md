
# ZP Command — v2.2 (Ready for Netlify)
### 새 기능 (C2 전환)
- **AOV 워터폴**: 기본+업셀+번들+할인 구성으로 평균 AOV 계산
- **상품×소스 히트맵(수익 비중)**: SKU×소스 격자에 수익 기여도 농도 표시
- **체크아웃 누수 트리(최근 7일)**: 방문→장바→결제 단계별 비율

### 포함 (이전)
- C0: 캡 게이지, 이상치 배지, 3줄 요약
- C1: 크리에이티브 리그
- C4: 보상 타임라인, 락업 캘린더, 원장

## 배포
1) 이 폴더 내용을 GitHub **리포지토리 최상단**에 업로드(덮어쓰기)
2) Netlify 자동 빌드(netlify.toml 포함)
3) HashRouter(`/#/commerce`)로 라우팅

## 데이터 교체
- `/src/data/commerce_items.csv` : `order_id,kind,amount,source,sku`
  - kind: base|upsell|bundle|discount (할인은 음수)
- `/src/data/kpi_daily.csv` : 최근 7일 집계로 누수 트리 계산
