# 나의 에이전트 작업 명세

> 대괄호 안의 안내를 지우고 자신의 문장으로 작성하세요. 에이전트가 대신 작성하면 안 됩니다.

## 1. 목표

잘못된 입력은 거절하고, 같은 요청으로 영수증이 중복 생성되지 않게 한다

## 2. 현재 문제와 확인한 사실

- 현재 동작: 기본 실행과 핵심 기능 성공, 입력 통제와 중복 통제 실패
- 실패 증거: 
✖ 입력 통제: 잘못된 상호명과 금액을 거절한다 (17.8765ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  201 !== 400
  
      at TestContext.<anonymous> (file:///C:/%EC%84%9C%EC%98%81%EC%BB%A4/mission2-agent-project-v2/test/mission.test.js:64:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async Test.run (node:internal/test_runner/test:797:9)
      at async Test.processPendingSubtests (node:internal/test_runner/test:526:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 201,
    expected: 400,
    operator: 'strictEqual'
  }

✖ 중복 통제: 같은 키는 같은 결과, 다른 키는 다른 결과를 만든다 (22.7551ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  201 !== 200
  
      at TestContext.<anonymous> (file:///C:/%EC%84%9C%EC%98%81%EC%BB%A4/mission2-agent-project-v2/test/mission.test.js:87:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async Test.run (node:internal/test_runner/test:797:9)
      at async Test.processPendingSubtests (node:internal/test_runner/test:526:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 201,
    expected: 200,
    operator: 'strictEqual'
  }
- 아직 모르는 것: 같은 키로 다른 상호명과 금액을 보내면 기존 영수증을 돌려줘야 하는지, 에러를 내야 하는지

## 3. 내가 선택한 제약

- 선택: 단순성 우선
- 이유: 원하지 않는 코드를 추가나 수정하지 않고, 수정된 코드를 확인 및 이해하기 쉽도록 단순성 우선을 선택

## 4. 변경 허용 범위

- `src/receipt-policy.js`
- `src/receipt-store.js`

## 5. 변경 금지 범위

- `AGENTS.md`, `TASK_SPEC.md`, `AI_WORKLOG.md`
- `package.json`
- `src/app.js`, `src/server.js`
- `test/`와 `scripts/` 아래 모든 파일
- 새로운 외부 패키지나 서비스 추가
- 기존 API 경로와 응답 형식 변경

## 6. 완료 조건

- 잘못된 상호명, 0원, 숫자가 아닌 금액 등 잘못된 입력 시 400, `invalid_receipt` 반환
- 같은 키로 다시 보낸 요청은 200, 같은 id, `duplicate: true`를 반환하며 다른 키로 보낸 요청은 201과 새 id 반환
- `npm test` 4개 모두 통과, `npm run check` 성공

## 7. 에이전트 작업 순서

1. README.md, AGENTS.md, TASK_SPEC.md를 읽고 `npm test`의 결과를 확인함
2. 전체 수정 계획 제시 후, 한 단계씩 승인을 요청함 / 승인 전에는 코드를 절대 수정하지 않음
3. `receipt-policy.js`와 `receipt-store.js`의 TODO 1, 2, 3, 4를 구현함 
4. `npm test`와 `npm run check`를 실행 후 수정한 파일, 테스트 결과, 남은 위험, 추가 계획을 보고

## 8. 중단하고 질문할 조건

- 허용되지 않은 파일을 수정해야 하는 경우
- 문서에 기술되지 않은 동작을 결정해야 하는 경우

