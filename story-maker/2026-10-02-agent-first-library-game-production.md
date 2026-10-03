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
