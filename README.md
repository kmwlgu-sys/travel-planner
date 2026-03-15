# Japan Travel Itinerary Planner (Node.js/React)

이 프로젝트는 Vite + React를 사용하여 구축된 일본 여행 일정 관리 웹 앱입니다.

## 주요 기능
- **여행 기간 설정**: 출발일과 도착일을 선택하여 전체 일정을 관리합니다.
- **일자별 탭**: 기간에 맞춰 DAY 1, 2... 탭이 자동 생성됩니다.
- **드래그 앤 드롭**: 상세 일정 목록에서 마우스 드래그로 장소 순서를 변경할 수 있습니다.
- **구글 지도 연동**: 일자별 장소 마커 및 이동 경로(Polyline)가 지도에 표시됩니다.
- **장소 검색**: (모의) 검색 기능을 통해 일정을 추가할 수 있습니다.

## 실행 방법
현재 환경에 Node.js가 설치되어 있지 않으므로, 아래 단계를 따라주세요.

1. **Node.js 설치**: [nodejs.org](https://nodejs.org/)에서 LTS 버전을 설치합니다.
2. **의존성 설치**: 터미널(d:\work\travel)에서 아래 명령어를 실행합니다.
   ```bash
   npm install
   ```
3. **개발 서버 실행**:
   ```bash
   npm run dev
   ```
4. **접속**: 브라우저에서 표시되는 주소(예: `http://localhost:5173`)로 접속합니다.

## 주의 사항
- `src/components/MapContainer.jsx` 파일의 `googleMapsApiKey` 부분에 실제 구글 지도 API 키를 입력해야 지도가 정상적으로 표시됩니다.
