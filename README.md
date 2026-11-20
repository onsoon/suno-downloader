# Suno 가사·MP3 다운로더

Suno 노래 링크를 넣으면 가사를 **SRT·LRC** 파일로 만들고, 내 곡이면 **MP3**까지 받는 웹앱입니다.

## 기능
| 무엇 | 어떻게 |
|---|---|
| 곡 정보·가사 | 링크(`suno.com/song/…`, `suno.com/s/…`)를 넣으면 `/api/clip`이 Suno 공개 API에서 가져옴 |
| SRT·LRC (자동 추정) | 곡 길이와 줄 길이 비율로 시간 배치. 첫 가사 시작·마지막 가사 끝 시각을 맞추면 정확도가 올라감 |
| SRT·LRC (탭으로 맞추기) | 노래를 들으며 각 줄 시작에 Space를 누르면 실제 타이밍으로 기록 |
| MP3 + Suno 원본 타이밍 | "내 곡 모드" 북마크 버튼. suno.com에 로그인한 상태로 내 노래 페이지에서 누르면 MP3와 Suno 단어별 정렬 타이밍으로 만든 SRT·LRC를 받음 |

Suno는 로그인하지 않은 요청에 MP3 주소와 단어별 가사 타이밍(aligned lyrics)을 주지 않습니다. 그래서 MP3와 원본 타이밍은 곡 주인의 로그인 세션이 있는 suno.com 안에서만 처리하고, 로그인 정보는 이 앱 서버로 보내지 않습니다.

## Vercel 배포
1. Vercel → Add New → Project → 이 저장소 Import
2. Framework Preset: Other, 빌드 설정 없이 Deploy

## 파일
- `index.html`: 화면과 SRT·LRC 생성, 북마크 버튼 코드
- `api/clip.js`: Suno 곡 정보 프록시 (Vercel 서버리스 함수)

본인이 만든 곡에만 사용하세요. 다른 사람의 곡을 받아 재배포하면 Suno 이용약관과 저작권에 어긋날 수 있습니다.
