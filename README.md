
# ZP Command — v2.3 (Ready for Netlify)
### 새 기능 (C6 실험)
- **Experiments 테이블**: 표본/전환/`uplift%`/승패(게이트: 각 표본 ≥500 & uplift ≥ +10%)
- **A/A vs A/B 분포(Scatter)**: Control% vs Variant% 시각화(대각선=무변화, 우상향=개선)
- CSV: `/src/data/experiments.csv`

### 기존 포함
- C0: 캡 게이지, 이상치 배지, 3줄 요약
- C1: 크리에이티브 리그
- C2: AOV 워터폴, 체크아웃 누수, SKU×소스 히트맵
- C4: 보상 타임라인, 락업 캘린더, 원장

## 배포
1) 이 폴더를 GitHub 리포지토리 최상단에 업로드(덮어쓰기)
2) Netlify는 `netlify.toml`로 자동 빌드/배포
3) 라우팅: `/#/experiments`

## 데이터 교체
- `src/data/experiments.csv`만 교체해도 C6는 즉시 업데이트됩니다.
