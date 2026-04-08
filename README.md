# spg_FE

## 작업 로그 (2026-04-07)

### 1) 채용 지원 폼(입사지원) 스텝 검증 보강
- 파일: `src/app/aboutUs/components/sections/RecruitApplyWizard.tsx`
- 레거시 PHP 최종검증(`recurit_validate_final`) 기준으로, Next 폼에서 단계별 필수값 검증을 추가함.
  - `1단계 저장`: 응시구분/응시부서, 인적 필수값, 학력 최소 1행, 증명사진 체크
  - `2단계 저장`: 자격/면허, 경력, 상벌, 어학(영/일), OA 4항목, 추가정보 4항목 체크
  - `3단계 저장`: 자기소개 5문항 체크
  - `4단계 저장`: 경력상세 최소 1행 체크
  - `최종 제출`: 1~4단계 전체 재검증 후 누락 시 해당 단계로 이동
- 서버 422 검증 오류 수신 시, 누락 항목을 표시하고 관련 단계로 자동 이동하도록 처리함.

### 2) 채용 지원 폼 필수 표시/안내 개선
- 파일: `src/app/aboutUs/components/sections/RecruitFlows.module.css`
  - 필수 표시 스타일 `.req` 추가
- 파일: `src/app/aboutUs/components/sections/RecruitApplyWizard.tsx`
  - 주요 필수 라벨에 `*` 표기 추가
  - 상벌 항목은 “제목 또는 내용 중 하나 입력” 규칙에 맞춰 힌트 문구로 안내
  - 어학 입력 라벨을 `독해/작문/회화`로 정리

### 3) 관리자 대시보드 채용지원자 미리보기 추가
- 파일: `src/app/(admin)/admin/(dashboard)/customersupport/recruit/page.tsx`
  - 목록의 기존 시스템 액션에 `미리보기` 버튼 추가
  - 클릭 시 레거시 인쇄 URL(`print_url`)을 모달 내 `iframe`으로 로드
  - `새창 인쇄` 링크는 유지(폴백 용도)
- 파일: `src/app/(admin)/admin/(dashboard)/customersupport/recruit/page.module.css`
  - 미리보기 모달/버튼/iframe 관련 스타일 추가

### 4) 레거시 인쇄 URL 관련 메모
- 관리자 목록 API(`front/recurit/applications.php`)가 `print_url`을 아래 형식으로 내려줌:
  - `/sub/recurit_print.php?wType=each_print&re_id={re_id}`
- Next 관리자 화면은 이 `print_url`을 `BACKEND_ORIGIN`과 합쳐서 사용함.
- 환경에 따라 `iframe` 미리보기가 보안 정책(`X-Frame-Options`, `CSP`) 또는 세션 문제로 막힐 수 있음.
  - 이 경우 `새창 인쇄`로는 정상 열릴 가능성이 높음.

### 5) 점검 결과
- `npm run lint` 실행: 오류 없음(기존 프로젝트 warning 다수 존재)
- `npm run build` 실행: 빌드 성공

### 내일 확인할 항목
- [ ] 관리자 채용지원자 목록에서 `미리보기` 버튼 클릭 시 실제로 인쇄 화면이 iframe에서 보이는지 확인
- [ ] iframe이 막히면 `미리보기 버튼=새창 열기`로 전환할지 결정
- [ ] 채용 폼 1~5단계에서 필수 누락 메시지/스텝 이동 UX 최종 점검
