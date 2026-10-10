# 이야기 도서관용 작은 게임 — Agent-first 제작 방향

Updated: 2026-10-02  
Status: **adopted technical direction; compiler deferred**

## 1. 결정

이야기 도서관의 작은 게임 제작을 위해 처음부터 범용 `Story schema → compiler → RPG Maker JSON` 체계를 완성하려 하지 않는다.

우선은 **AI Game Agent가 실제 RPG Maker 프로젝트를 직접 읽고 수정하여 플레이 가능한 게임을 만드는 방식**을 사용한다.

이 방향의 근거는 이미 `mindslash79/neoul-sok-ai`에서 반복적으로 검증되고 있다. AI가 기존 맵, 이벤트, JSON, JavaScript, 테스트 구조를 읽고 실제 게임 파일을 직접 수정한 뒤 다시 검증할 수 있다.

따라서 초기 목표는 "모든 게임 문법을 미리 정의한 컴파일러"가 아니라 **Story-to-Game Agent / Library Game Builder**다.

## 2. 현재 Story Maker가 이미 제공하는 것

Story Maker v10은 단순 줄거리 생성기를 넘어서 다음을 구조화한다.

```text
Creator input
→ story / payload
→ audience
→ character bible
→ narrative structure
→ locations
→ scenes
→ character-state continuity
→ player-experience composition
→ creator-intent audit
→ minimal revision loop
→ scene script beats
→ RPG Maker event suggestions
```

`SCENE_SCRIPT`은 장면을 다음과 같은 production-oriented beat로 분해한다.

- STAGE_DIRECTION
- DIALOGUE
- ACTION
- PLAYER_CONTROL
- CHOICE
- SYSTEM
- TRANSITION

또한 Show Text, Set Movement Route, Show Choices, Control Switches/Variables, Play BGM/BGS/SE, Tint Screen, Wait, Transfer Player, Common Event 같은 RPG Maker 구현 제안까지 포함할 수 있다.

즉 Story Maker는 이미 **creative direction + structured production brief** 역할을 할 수 있다.

## 3. Story Maker의 역할 재정의

Story Maker를 "게임 생성기"라고 보기보다 **Creative Director / Narrative Experience Designer**로 본다.

그 결과를 AI Game Agent가 읽어 실제 runtime을 만든다.

```text
사람의 공유된 이야기 / creator input
        ↓
동의·익명화·변형
        ↓
Story Maker
        ↓
핵심 인간 경험
감정 곡선
등장인물
장면
선택
환경
연출 의도
        ↓
Library Game Builder
        ↓
RPG Maker project 직접 수정
        ↓
자동 테스트 + 실제 브라우저 확인
        ↓
Creator Intent / 심리적·서사적 QA
        ↓
사람 승인
        ↓
이야기 도서관에 출판
```

## 4. Library Game Base

작은 게임을 매번 빈 프로젝트에서 만들 필요는 없다.

공통 `Library Game Base`를 유지한다.

예:

- 플레이어 이동
- 대화창
- 선택지
- 공통 save/load 정책
- fade / transition
- BGM / BGS / SE
- 기본 tileset
- 공통 NPC/event helpers
- ending
- 이야기 도서관으로 돌아가기
- completion/report hook
- 기본 smoke tests
- 웹 runtime/deployment shell

새 게임은 이 base를 복사한 뒤 Agent가 필요한 부분만 수정한다.

## 5. 기본 제작 범위

자동화 성공률을 높이기 위해 초기 Library Story의 기본 규모를 작게 유지한다.

권장 기본값:

- 플레이 시간: 5~30분
- 핵심 경험: 1개
- 장소: 1~3개
- 주요 인물: 1~4명
- 장면: 3~8개
- 선택: 1~3개
- 전투: 기본 없음
- 메커닉: 이동 / 관찰 / 대화 / 선택 / 짧은 상호작용
- 자산: 공통 자산 우선 재사용
- 신규 이미지/스프라이트: 이야기상 필요할 때만 생성

이 제약은 약점이 아니라 **작은 정서적 경험을 빠르게 출판하기 위한 형식적 언어**다.

## 6. Agent가 실제로 하는 일

Library Game Builder의 목표 workflow:

1. Story Maker output과 creator hard facts를 읽는다.
2. Library Game Base를 새 프로젝트로 복제한다.
3. 필요한 `MapXXX.json`, common events, switches, variables, plugin/config, JavaScript를 직접 생성/수정한다.
4. 기존 공용 asset을 먼저 검색하고 재사용한다.
5. 신규 character/visual asset이 필요하면 RPG Character Factory 또는 이미지 생성 파이프라인을 호출한다.
6. scene script를 실제 event command 구조로 구현한다.
7. map/event reference, transfer, switch, variable, save compatibility를 정적 검증한다.
8. smoke test와 가능한 실제 browser play verification을 수행한다.
9. 오류가 있으면 Agent가 프로젝트를 다시 수정한다.
10. preview build를 만든다.
11. Story Maker의 Creator Intent Audit과 사람 검수를 통과한 후 publish candidate로 만든다.

## 7. 왜 범용 compiler를 먼저 만들지 않는가

범용 compiler는 미리 정의된 게임 문법 안에서만 강하다.

하지만 작은 심리 게임은 이야기마다 예상하지 못한 표현이 필요할 수 있다.

예:

- 버스를 아무 입력 없이 20초 기다리는 장면
- 오래된 사진 네 장을 한 장씩 뒤집는 상호작용
- 같은 방이 기억에 따라 조금씩 달라지는 장면
- 선택지를 누르지 않고 떠나는 것이 선택이 되는 장면
- 대사 없이 특정 물건을 반복해서 바라보는 연출

Agent는 필요한 경우 새로운 event pattern이나 JavaScript를 직접 만들 수 있다.

따라서 초기에는 **유연한 Agent가 창작 가능성을 유지**하고, 반복되는 패턴만 점차 deterministic helper/template/library로 추출한다.

## 8. 자동화 순서

원칙:

> **Agent first → repetition discovery → targeted automation**

게임을 10개, 20개, 30개 만들면서 반복되는 부분을 관찰한다.

그 뒤 반복성이 높은 것만 추출한다.

예:

- dialogue event builder
- NPC placement
- map transfer
- ending / library return
- save/completion
- common choice UI
- scene transition
- BGM/BGS handling
- standard interaction templates

이렇게 하면 미리 거대한 compiler를 설계하는 비용을 피하면서도 시간이 갈수록 제작 안정성과 속도가 올라간다.

## 9. 사람의 역할

자동화가 커져도 다음 결정은 사람의 creative direction을 유지한다.

- 왜 이 이야기를 만드는가
- 어떤 인간 경험이 핵심인가
- 플레이어에게 무엇을 강요하지 말아야 하는가
- 특정 선택이 수치심, 죄책감, 교훈 강요를 만들지 않는가
- 실제 사람의 경험이 충분히 변형되었는가
- 어떤 동의 범위에서 공개 가능한가
- 마지막에 어떤 여운을 남길 것인가
- 이 게임을 지금 도서관에 출판할 가치가 있는가

Creator Intent Audit은 사람의 판단을 대체하지 않고 **drift detector**로 사용한다.

## 10. 게임 제작의 경제성

작은 게임의 제작비가 충분히 낮아지면, 많은 사람이 플레이할 것 같은 이야기만 만들 필요가 없다.

소수에게 깊은 의미가 있는 경험도 출판 가능해진다.

```text
한 사람이 맡긴 이야기
→ 작은 게임
→ 37명이 플레이
→ 6명이 자기 경험을 남김
→ 그중 한 경험이 다시 새로운 게임의 씨앗이 됨
```

목표는 "게임 산업을 자동화"하는 것보다 **사람들의 삶에서 나온 경험을 플레이 가능한 작은 이야기로 바꾸는 출판 시스템**에 가깝다.

## 11. 기존 컴파일러 아이디어의 위치

향후 충분한 반복 패턴이 쌓이면 일부 deterministic compiler/generator를 만들 수 있다.

하지만 그것은 상위 목표가 아니다.

Compiler는 Agent를 대체하기보다:

- 반복 작업을 빠르게 만들고
- 구조적 오류를 줄이며
- 표준 event를 안정화하는

하위 도구가 된다.

현재 우선순위는 **Library Game Builder가 실제 작은 게임 하나를 end-to-end로 만들어 플레이 가능하게 하는 것**이다.


## 12. 선행 proof — 하람동 사진관

이 방향은 순수한 미래 가설이 아니다.

2026-09-03에 Vercel의 `Allstory's projects` 팀 아래 **`haramdong-photo-studio`** 프로젝트가 실제 production으로 배포되었다.

확인된 배포 기록:

- project: `haramdong-photo-studio`
- Vercel project id: `prj_HEAVc19di617tjIxXkqY9CMKMloH`
- 2026-09-03 19:38 EDT production deployment
- 2026-09-03 19:39 EDT production deployment
- 2026-09-03 19:49 EDT production deployment
- latest checked deployment state: `READY`
- deployment source: `cli`
- Git-connected source metadata는 확인되지 않았고, CLI로 직접 배포된 독립 Vercel project였다.

Creator recollection에 따르면 **「하람동 사진관」은 AI를 이용해 실제 플레이 가능한 게임 결과물까지 자동 생성해 본 첫 사례**였다.

당시 결과는 완성품이 아니었다.

- 수정할 부분이 많았고
- 맵/연출/대사/세부 동선 등에서 사람 손질이 필요했으며
- 현재의 Story Maker v10, Creator Intent Audit, Conversation/experience 설계, 반복 테스트 같은 기반도 아직 없었다.

그럼에도 중요한 것은 **AI가 아이디어나 문서만 만든 것이 아니라 실제로 플레이 가능한 게임을 만들어냈고, 그것이 웹에 production 배포까지 되었다는 사실**이다.

따라서 하람동 사진관은 현재의 Library Game Builder 방향에서 다음과 같이 본다.

> **Prototype 0 / First Playable Proof**

즉 현재 목표는 "AI가 게임을 만들 수 있는가?"를 처음 증명하는 것이 아니다.

이미 한 번 작동한 흐름을:

```text
AI가 실제 게임 생성
→ 플레이
→ 사람이 부족한 부분 발견
→ 수정
→ 다시 플레이
```

에서

```text
사람의 이야기
→ Story Maker가 인간 경험과 의도를 구조화
→ Library Game Builder가 실제 RPG Maker 프로젝트 생성/수정
→ 자동 구조 검증 + smoke/browser test
→ Creator Intent Audit
→ 사람의 정서적/윤리적 최종 검수
→ preview / publication
```

으로 체계화하고 반복 가능하게 만드는 것이다.

### 이 prototype에서 얻는 설계 원칙

하람동 사진관의 가장 중요한 교훈은 **초기 자동 생성물에 수정이 필요했다는 사실 자체가 실패가 아니라 specification source라는 것**이다.

앞으로 기존 결과물을 회수할 수 있다면 다음을 역분석한다.

- AI가 처음부터 잘 만든 부분
- 사람이 반복적으로 고친 부분
- 맵 크기와 동선 문제
- 대사 길이와 자연스러움
- 이벤트 연결 오류
- 필요한 연출과 불필요한 연출
- 재사용 가능한 공통 자산
- 자동 테스트로 잡을 수 있었던 문제
- 사람만 판단하기 좋은 감정적/심리적 문제

이 데이터를 Library Game Base, Story Maker validation, smoke test, agent instructions의 실제 설계 근거로 사용한다.

따라서 **하람동 사진관 → 너울 속 아이의 AI 직접 수정 경험 → Story Maker v10 → Library Game Builder**는 서로 별개의 프로젝트가 아니라, 자동 게임 제작 방식이 실제 경험을 통해 점진적으로 성숙해온 하나의 계보로 기록한다.


## 13. 2026-10-10 보완 — 제작 병목과 공통 스토리 계층

**지향:** Story Maker가 만들어 낸 구조화된 이야기와 창작자 의도는 RPG Maker 게임 외에도 이미지·영상 등 다른 매체의 입력이 될 수 있다. 향후 통합 스튜디오가 생기더라도 Story Maker를 독립된 **Creative Director / Narrative Experience Layer**로 유지한다. 이것은 장기 통합 비전이며 현재 작동 중인 배포 파이프라인을 변경하라는 지시가 아니다.

### RPG Maker 제작 병목 완화 — Stock-first, Sprite-lite

- **Sprite-lite**: 플레이 가능한 최초 버전에서는 고급 캐릭터 스프라이트 제작을 필수 게이트로 두지 않는다. 인물 구분, 4방향 기본 이동 등 해당 장면에 필요한 최소 표현을 우선하고, 감정은 텍스트·초상화·효과음·연출로 보완한다.
- **Stock-first maps**: 빈 캔버스에 새 맵과 타일셋을 제작하기보다, 이미 소유·이용 권한이 있는 RPG Maker 기본 자산이나 검증된 Library Game Base의 맵을 출발점으로 삼아 동선·소품·분위기·이벤트를 수정한다.
- **Scene-to-playable**: Story Maker의 SCENES/SCENE_SCRIPT를 작은 맵+실제 이벤트로 옮긴 뒤 브라우저에서 직접 플레이하고 검증한다. 완벽한 자산 세트 완성 전에 한 장면이 플레이 가능한지 확인한다.
- **License gate**: 사용자 계정의 RPG Maker 번들/기본 자산이라도 엔진 밖 배포, 공개 재배포, 타인 제작 시스템 제공 전에는 관련 이용 약관과 각 타일·에셋 라이선스를 확인한다. 확인 전 권한을 추정하지 않는다.

이 접근은 2026-10-02의 **agent-first → 실제 게임 → 반복 발견 → 필요한 도구만 추출** 결정을 그대로 유지한다. 스프라이트/맵 품질 향상은 작품이 요청할 때만 추가 작업으로 승격한다.

### UI 부담 규칙

스프라이트·타일·이벤트 JSON 같은 항목은 제작자의 최상위 할 일이 아닌 하위 실행 단계다. 사람에게는 '이 장면이 원하는 감정/행동을 전달하는가?', '미리 보기를 승인할 것인가?'라는 **의미 중심 판단**을 우선 보여 주고, 기술 세부는 필요할 때만 펼쳐 본다.

**상태:** 설계 방향 보완만 반영. 2026-10-10 현재 이 문서를 이유로 실제 신규 게임 빌드, 스프라이트 생성, 맵 수정 또는 배포가 수행되지는 않았다.
