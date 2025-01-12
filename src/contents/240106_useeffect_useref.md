---
date: '2024-01-06'
title: 'useEffect 완벽 가이드 (번역)'
categories: ['트러블슈팅', '바이언스', '학부생인턴', 'rete.js']
summary: 'retejs 라이브러리 공식 문서와 원본 레포 이슈 확인하여 노드 생성시 오류 원인 분석 및 해결하여 최초 로딩 시간 단축 (1.6s → 1.0s) 및 중복 생성되는 노드를 제거하기 위해 BE, 딥러닝 개발자 분과 소통하여 데이터구조 변경하여 해결'
thumbnail: './images/vience-mlops-train-panel-light2.png'
---

# 240106\_useEffect\_useRef

## 개요

![캡처|vience.io/vience-canvas/mlops](./images/vience-mlops-train-panel-light2.png)

## 바이언스 MLOps 소개

* 코딩 없이 **노드를 연결하면** python 코드로 변환하여 딥러닝 모델을 만들고&#x20;
* 서버에서 딥러닝 모델을 학습을 시키고,
* &#x20;그 결과를 시각적으로 확인&#x20;

할 수 있는 시각적 프로그래밍 서비스입니다.&#x20;

## 문제 상황

그 중 노드를 연결하고, 각 노드의 property를 설정하는 UI를 만드는 작업 중 만난 문제상황 입니다.&#x20;

캔버스에 그려지는 노드 UI는 트리 형태 데이터를 기반으로 rete.js 프레임워크를 활용해 그렸고, \
right panel로 트리의 각 노드에 저장된 property(options)를 조작하는 UI를 만드는 작업입니다.

이 때, 어떤 데이터를 표시해야할지 구분이 필요했습니다.

1. 서버에서 보내준 트리 데이터에 저장된 내용을 UI에 반영
2. FE에서 preset으로 설정한 모델 데이터를 UI에 반영
3. 유저로 인해 변경된 데이터를 UI에 반영
4. 위 모든 상황에 해당되지 않으면 초기값을 반영

|             | 동작              |                 |
| ----------- | --------------- | --------------- |
| 노드의 options | 데이터 저장          | 데이터 업데이트        |
| -           | _⬇️ 저장된 데이터 전달_ | _⬆️ 사용자 입력값 전달_ |
| 인풋 컴포넌트     | 저장된 데이터 표시      | 사용자 입력값 받기      |

이 과정에서 겪었던 어려움을 기록하려고 합니다.

## 문제상황 1 - useEffect 무한루프

1. 문제점 : 무한루프 생성
   1. input값이 바뀔 때마다 Node의 option에 전달
   2. input이 바뀔때마다 Node에 setValue
   3. Node에서 받아온 prevOption이 변화 감지
   4. 초기화 함수가 다시 작동
2. 해결 방법:
   1. **받아오는 데이터와 올려보내는 데이터를 분리** (prevOption <-> Option)
   2. **loading** 상태 추가
      1. 초기값이 전달이 완료되면 loading을 false로 설정
3. 작동 방식:
   1. 최상위 컴포넌트에서 `loading`, `setLoading`을 선언하고
   2. 노드에서 받아오는 option을 `prevOption`, useRef으로,
   3. setValue로 올려주는 `option은` useState 상태로 분리를 해준 뒤에
   4. `prevOption` 이 최하위 컴포넌트 input ui에 표시되고,
   5. 최하위 상태 `setTuple` 에 저장될때까지 `loading`을 `true`로 만들었고,
   6. 그동안 `setValue` 와 같은 값을 설정해주는 함수들은 loading이 false여야만 작동

이렇게 하니 기존에는 node의 option에 이미 값이 설정되어 있는 경우에 이것을 input에 표시를 해주고, 이를 state에 적용을 시키면 setValue가 일어났지만, loading이 true여서 노드의 업데이트가 되지 않았습니다.

## 문제상황 2 - 노드에 저장된 데이터로 input 초기값 설정하기

1. 문제점
   1. 노드에 저장된 값이 있는데도 불구하고,
   2. 값이 없을 때 자동으로 설정되는 초기값이 나타남
2. 원인
   1. option의 값을 useRef로 `prevOption`에 전달하는 시점보다
   2. 최하위의 input 컴포넌트들이 렌더링이 완료되고  componentDidMount()처럼 사용하는 빈 useEffect가 실행되어 `prevOption`의 값을 확인하는 시점이 더 앞이다.
3. 해결 방안
   1. 이를 해결하고자 useEffect의 실행 시점,
   2. 그에 따른 상태와 props 값을 전달 받는 시점에 대해서 알아보았고,&#x20;
   3. input컴포넌트에서 `prevOption`의 값을 확인하는 시점을 수정
      1. As-is: 컴포넌트가 렌더링이 완료된 시점 === useEffect 의존 배열이 빈 배열
      2. To-be: 최상위 컴포넌트에서 전달받는 `option`의 특정 값이 변경되는 시점 === useEffect의 의존 배열이 `option.current[id]`

### 두 문제 상황을 해결하는 과정에서 배운 점

1. useEffect의 의미는 렌더링의 부수효과이다.
   1. 렌더링이 되면(!) 따라오는 동작으로 렌더링이 끝난 이후에 실행되기 때문에 ref에 DOM 노드가 바인딩 되었다고 가정할 수 있다.
2. useEffect의 목적은 동기화다.&#x20;
3. 의존 배열에 객체를 넣지 말자.
   1. 어떤 effect가 `prevOption` 내의 특정 키의 (객체타입이 아닌)값이 바뀔 때마다 작동하도록 하고 싶다면, 콕 집어서 `prevOption.current.name`과 같이 의존 배열에 명시해주자. prevOption만 넣을 경우에 객체는 변해도 useEffect가 감지할 수 없다.
   2. useRef를 쓰는 경우에 주의하자. 리렌더링을 유도하지 않는 데이터를 담는 객체이므로 리렌더링을 유도하고 싶다면 useState를 사용해야 된다.
4. state는 const, 상수이다. 즉, 하나의 리렌더 시점에 값을 바꾸고 해도 const 변수는 재할당이 불가능 하다. 값을 바꾸고 싶다면 리렌더가 한 번 더 일어나게 해야한다.

아래는 JavaScript의 작동 방식에 대해서 공부한 내용과 useEffect에 대해서 공부하기 위해 [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)라는 글을 한글로 번역한 내용입니다.

***

## Effect를 사용하기 위한 완전 가이드

### 매 렌더마다의 props와 state가 있다

effects에 대해서 이야기하기 전에, 우리는 rendering에 대한 이야기를 해야 합니다. 여기 Counter가 있습니다. 강조표시된 줄을 자세히 들여다 보세요.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
 
  return (
    <div>
        // --- 여기!! ----
      <p>You clicked {count} times</p>
       // ----
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

이 줄이 의미하는 바가 무엇일까요? count가 어떻게든 우리의 상태의 변화를 "지켜보고" 있고, 자동으로 update해주는 걸까요? 처음 배울때에는 유용한 비유였을지 모르지만 이것은 정확한 멘탈 모델은 아닙니다.

이 예시에서 count는 그저 하나의 숫자일 뿐입니다. 그것은 "data binding", "watcher", "proxy" 과 같은 마술이 아닙니다. 아래와 같은 좋은 오래된 숫자입니다.

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

우리의 컴포넌트가 처음 렌더링 될 때, 우리가 useState()로 부터 얻어온 count 변수는 0 입니다. 우리가 setCount(1)함수를 호출할 때, 리액트는 우리의 컴포넌트를 다시 호출해요. 이번에는 count 변수의 값이 1이 될 겁니다. 이걸 계속 반복 합니다.

우리가 상태를 업데이트 할 때마다, 리액트는 우리의 컴포넌트를 다시 호출해요. 매 렌더 결과는 그 자체의 counter 상태 값을 "보고" 있습니다. 그리고 그 상태값은 우리의 함수 안에 있는 상수죠.

그러니 위의 코드 한 줄은 어떠한 특별한 data binding을 하는게 아닙니다. 그저 하나의 숫자 값을 렌더 결과에 포함시키는 것 뿐이죠. 그 숫자는 리액트로부터 제공되었고요.

우리가 count를 set할 때(setCount할 때), 리액트는 우리의 함수를 다시 호출합니다. 이 때 count 의 값은 달라져 있습니다. 그러면 리액트는 우리의 가장 최근 렌더 렬과와 맞추기 위해서 DOM을 업데이트 합니다.

중요하게 가져가야할 점은 어떤 특정 렌더 안에 있는 count 상수가 시간이 지나도 변하지 않을 것이라는 점입니다. 다시 호출된 것은 "우리의 컴포넌트"입니다. 그리고 매 렌더 마다 그 자체의 count 값을 "보고" 있는 거예요. 렌더 사이에 고립되어있는.

## 매 렌더마다 그 자체의 event handler들을 가진다

지금까지 잘 따라오셨나요? 좋아요. 그렇다면 event handler는 어떤가요?

아래의 예시를 봅시다. count 변수와 함께 3초 뒤에 경고창을 보여주네요.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
 
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
 
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

제가 이 일련의 과정을 실행해본다고 해봅시다.

* 카운터를 3까지 증가시킵니다.
* alert 보여주기 버튼을 누릅니다.
* timeout 버저가 울리기 전에 5까지 증가시킵니다.

경고창이 뭐라고 보여줄 것 같으신가요? 경고창이 뜨는 당시의 카운터 상태 값인 5일까요? 아니면 show alert 버튼을 클릭한 시점의 상태값인 3일까요?

***

스포 주의

***

가서 직접 해보세요!

만약 이 행동이 이해가 되지 않는다면 현재 수신자의 id가 상태로 저장되어 있고 send 버튼이 있는 채팅 앱과 같은 더 실용적인 예시를 상상해 봅시다. 경고창은 그 버튼이 클릭되던 당시의 상태값을 "포착"합니다. 다른 행동을 실행할 수 있는 방법들도 있지만, 저는 지금으로써는 기본적인 상황에만 집중하려고 합니다. 멘탈 모델을 구축할 때는 opt-in escape hatches(원할 때 시스템의 일부를 비활성화하거나 변경하기 위한 옵션, 시스템의 일부를 유연하게 컨트롤 하는 방법, 효과적으로 관리하고 적응하는 방법)로부터 저항을 최소화하는 경로를 구분해내는 것(그냥 빠르고 효율적인 방법을 찾는 것이라는 뜻)이 중요합니다.

***

하지만 그게 어떻게 작동하나요?

우리는 count 값이 매 특정 호출마다 우리의 함수에서 상수라고 이야기 해왔습니다. 이것을 강조하는 것은 중요합니다. 우리의 함수는 호출 됩니다 여러번, 매 렌더마다 한 번씩, 하지만 그 많은 횟수 중 매 번 그 안에 있던 count 값은 상수이고 특정한 값, 그 렌더를 위한 상태값 으로 설정 되어 있지요.

이것은 리액트에만 국한된 것이 아닙니다. 일반적인 함수도 비슷한 방식으로 동작해요.

```jsx
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}
 
let someone = {name: 'Dan'};
sayHi(someone);
 
someone = {name: 'Yuzhi'};
sayHi(someone);
 
someone = {name: 'Dominic'};
sayHi(someone);
```

이 예시에서 외부 변수인 someone 변수는 몇 번 재 할당 되었습니다. 리액트의 어딘가에서와 같이, "현재" 컴포넌트의 상태는 변할 수 있습니다. 그러나 sayHi 함수 안에는 특정한 호출로부터 person으로 연관되어진 지역 상수인 name 이 있습니다. 그 상수는 지역적이고, 그래서 매 호출 사이에서 독립적입니다! 결과적으로 시간이 다 되었을 때, 매 경고창은 그 자체의 name 변수를 "기억"합니다.

이것은 우리의 이벤트 핸들러들이 어떻게 클릭 당시의 count를 포착하는지를 설명해줍니다. 만약 우리가 같은 대체 원칙을 적용하였다면, 매 렌더는 그 자체의 count를 다음과 같이 "보았을" 것입니다.

```jsx
// During first render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
 
// After a click, our function is called again
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
 
// After another click, our function is called again
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

그래서 효과적으로, 매 렌더는 그 자체의 "버전"의 handleAlertClick 함수를 반환합니다. 그 버전들의 각각은 그 자체의 count 값을 "기억"합니다.

```jsx
// During first render
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 0 inside
  // ...
}
 
// After a click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 1 inside
  // ...
}
 
// After another click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 2 inside
  // ...
}
```

그래서 이 예시에서 이벤트 핸들러가 특정 렌더에 "소속"되어 있고, 여러분이 클릭했을 때 컴포넌트가 그 렌더"로 부터 가져온" counter 상태를 계속해서 사용하는 것입니다.

특정 렌더 안에서 props와 상태는 영원히 같은 상태로 남아있습니다. 하지만 props와 state가 매ㅐ 렌더 사이에 독립적이고, 그것들을 사용하는 어떤 값들(이벤트 핸들러도 포함)도 그러합니다. 그들 또한 특정한 렌더에 "속해" 있는 것이죠. 그래서 이벤트 핸들러 안에 있는 async 함수 조차도 같은 count 값을 "볼" 것입니다.

Side Note: 나는 handleAlertClick 함수 위에서 함수 바로 안으로 구체적인 count 값을 inline 했는데요. 이 멘탈 대체는 안전하죠 왜냐하면 count가 혹시라도 변할 리 없으니까요. 특정 렌더 안에서. 그것은 상수로써 선언되었고, 숫자 입니다. 이것 또한 ㅇ객체 처럼 다른 값들에 대해서 같은 방법으로 생각하기에 안전합니다. 하지만 오직 상태를 돌연변이 하는 것을 피하는 것에 동의한 상황에서만요. rmrjtdmf qusgudtlzlsms rjt eotlsdp 새롭게 생성된 객체로 setState함수를 호출하는 것은 괜찮습니다. 왜냐하면 이전 렌더에 속해있는 상태가 온전하니까요.

## 매 렌더마다 그 자체의 Effect를 갖는다

이 글이 effects에 관련된 글이어야 하는데 우리는 이제서야 이펙트에 대한 이야기를 하네요. 우리는 이제 바로잡을 것입니다. 결과적으로, 이펙트는 정말로 전혀 다르지 않습니다.

문서의 예시 중 하나로 돌아가 봅시다.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
 
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
 
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

당신에게 질문 하나 드리겠습니다. 이펙트는 어떻게 최근 count 상태를 읽을까요?

아마도, effect 함수 안에 실시간으로 count를 업데이트 하는 일종의 "data binding"이라거나 "watching" 같은 것이 있겠죠? 아마도 count는 리액트가 우리의 컴포넌트 안에서 설정해서 우리의 이펙트가 항상 최근의 값을 보도록 하는 변형가능한 변수겠죠?

아니요.

우리는 이미 count가 특정한 컴포넌트 렌더 안에서 변치 않는 상수라는 것을 압니다. 이벤트 핸들러는 count 상태를 그들이 속한 바로 그 렌더로부터 봅니다. 왜냐하면 count값은 그들의 scope 안의 변수니까요. 이펙트에서도 마찬가지 입니다!

그것은 변하지 않는 effect 안에서 어찌됐든 변화하는 변수는 count가 아닙니다. 매 렌더마다 다른 것은 effect 함수 그자체입니다.

매 버전은 그것이 속한 렌더로 부터 가져온 count value를 바라봅니다.

```jsx
// During first render
function Counter() {
  // ...
  useEffect(
    // Effect function from first render
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}
 
// After a click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from second render
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}
 
// After another click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from third render
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

리액트는 여러분이 제공한 이펙트 함수를 기억하고 변화를 DOM에 flushing하고, 브라우저가 스크린에 그리도록 한 후에 실행시킵니다. 그래서 우리가 하나의 개념적인 이펙트를 여기서 이야기 한다고 하더라도 그것은 다른 함수를 매 렌더마다 보여주기 때문에 매 이팩트 함수는 프롭스와 상태를 그것이 속한 특정 렌더로부터 바라봅니다.

개념적으로 이펙트가 렌더 결과의 일부라는 것을 상상할 수 있을 것입니다.

엄격히 말하면 그것들은 복잡한 문법이나 런타임 오버헤드 없이 훅 구성을 허용하기 위한 것이 아닙니다. 그것은 멘탈 모델내에서 우리가 이벤트 핸들러가 동작하는 것과 같은 방식으로 특정 렌더에 속하는 이펙트 함수를 구축할 수 있게 하는 것입니다.

***

우리가 견고한 이해를 확실히 하기 위해서 우리의 첫 번째 렌더를 복기해 봅시다.

리액트: state가 9일 때 UI를 내게 줘. 여러분의 컴포넌트: 여기 렌더 결과야 `<p>You clicked 0 times</p>` 너 할일 마치면 이 이펙트를 실행 시키도록 하는 것도 기억해줘. `() => { document.title = 'You clicked 0 times' }` 리액트: 물론이지. UI를 업데이트 하고 있어. 브라우저야, 나 DOM에 몇가지를 추가하려고 해. 브라우저: 좋아, 스크린에 그걸 그렸어. 리액트: 좋아, 이제 너가 내게 준 이펙트를 실행시킬게. `() => { document.title = 'You clicked 0 times' }` 를 실행시키고 있어.

이제 우리가 클릭한 후에 어떤 일이 일어나는지 복기해 보자.

컴포넌트: 리액트야, 내 상태를 1 로 설정해. 리액트: 상태가 1일 때 UI를 내게 줘. 컴포넌트: 렌더 결과야. `<p>You clicked 1 times</p>` 너 할일 마치면 이 이펙트를 실행 시키도록 하는 것도 기억해줘. `() => { document.title = 'You clicked 0 times' }` 리액트: 물론이지. UI를 업데이트 하고있어. 브라우저야, 나 DOM을 바꿨어. 브라우저: 좋아, 내가 너가 변화시킨 걸 스크린에 표시했어. 리액트: 알겠어, 이제 내가 방금 한 렌더에 속한 이펙트를 실행 시키자. `() => { document.title = 'You clicked 1 times' }`.를 실행시키고 있어.

## 매 렌더마다 그 자체의 ... 모든 것을 가지고 있다

우리는 이제 effect 들이매 렌더 이후에 실행되고, effect들은 개념적으로 컴포넌트의 결과물의 일부이며, 그것들은 그 특정 렌더로부터의 props와 상태값을 "본다"는 것을 압니다.

생각 실험을 해봅시다. 아래의 코드를 보세요.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
 
  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  });
 
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

제가 약간의 딜레이를 가지고 여러번 클릭하면 로그에 어떤 것이 표시될까요? (로그가 어떻게 생겼을까요? 로그가 어떻게 보일까요?)

이게 확률 게임이고 마지막 결과는 직관적이지 않다고 생각할 지도 모릅니다. 그렇지 않습니다! 일련의 로그를 보게 될거예요. 각각은 특정 렌더에 속해있으므로 그 자체의 count 값과 함께요.

여러분은 당연히 그렇게 작동하겠지, 아니면 어떻게 작동하겠어? 라고 생각할지도 모릅니다. 음, 그건 this.state가 클래스에서 작동하는 방식이 아니에요. 이 클래스 실행이 아래의 코드와 같다는 생각과 같은 실수를 만들기 쉽습니다.

```jsx
componentDidUpdate() {
    setTimeout(() => {
    console.log(`You clicked ${this.state.count} times`);
    }, 3000);
}
```

hook들이 자바스크립트의 클로저에 정말 많이 의존한다는 것이 모순적이라고 생각합니다. 그리고 하지만 캐노니컬 타임아웃 혼란에서의 잘못된 값으로 고통받는 클래스 실행이에요. 종종 클로저와 관련이 있는. 이 예시에서의 혼란의 실제 원인은 변형이고 클로저 그 자체가 아닙니다. 리액트가 이 클래스 안에서의 this.state가 가장 최신의 상태를 가리킬 수 있도록 this.state를 변형했어요.

클로저는 너가 닫은 값이 절대로 바뀌지 않을 때 훌륭하죠. 그것은

## 리액트에게 의존배열에 대해서 거짓말 하지 마라

리액트에게 의존배열을 제대로 알려주지 않는 것은 나쁜 결말을 초래합니다. 직관적으로 무슨 말인지 이해가 되시죠. 하지만 클래스로부터의 멘탈모델을 가지고 꽤 많은 사람들이 useEffect를 사용하시려는 사람들이 이 규칙을 위반하려고 하십니다. 저도 처음엔 그랬어요.

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }
 
  useEffect(() => {
    fetchData();
  }, []); 
  // 이거 괜찮나요? 아닐 때도 있을 걸요. 더 좋은 방법도 있구요.
```

마운트 되었을 때 한 번만 실행시키고 싶다고요? 이제부터는 기억하세요. 의존배열을 명시해주면 이펙트에 의해서 사용되는 여러분의 컴포넌트 안에서의 모든 값들은 거기 있어야만 합니다. props, 상태, 함수를 포함해서 컴포넌트 안의 전-부 다요.

때때로 당신이 그렇게 할 때, 문제를 일으키죠. 예를 들면 무한 루프를 돈다거나, 소켓이 너무 자주 재생성 된다거나요. 그러한 문제들에 대한 해결책은 의존 배열을 지우는 것이 아니에요. 곧 해결책이 나옵니다. 해결책으로 넘어가기 전에 문제에 대해서 더 잘 이해해 보자구요.

## 의존배열이 거짓말을 하면 어떻게 되나

의존배열이 이펙트 안에서 사용되는 모든 값을 가지고 있다면, 리액트는 언제 재실행되어야 하는지를 알겁니다.

```jsx
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

하지만 의존배열을 `[]` 이렇게 명시한다면, 새로운 effect가 실행되지 않겠죠. 이런 경우에 문제는 명확히 보이죠. 하지만 직관은 여러분을 속여요. 클래스 solution이 여러분의 기억 속에서 "튀어 나오는" 다른 경우에 말이죠.

예를 들어서, 매 초마다 카운터가 증가하게 코드를 작성했다고 해봅시다. 클래스로, 우리의 직관은 "setInterval 하고, 나중에 destory 한 번 해주면 되는 거 아님?" 이라고 생각할 수도 있죠. 하지만 아래의 예시를 봅시다? 우리가 생각하기에 이 코드를 useEffect로 번역한다면 우리는 직관적으로 의존배열에 빈 배열을 집어 넣겠죠. 한 번만 실행됐으면 하잖아요?

```jsx
function Counter() {
  const [count, setCount] = useState(0);
 
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
 
  return <h1>{count}</h1>;
}
```

하지만, 이 예시는요. 증가를 한 번 밖에 시키지 않아요.

당신의 멘탈모델이 '의존배열은 내가 이 이펙트를 언제 다시 촉발할 지 명시하도록 한다'라면, 이 예시는 당신에게 존재적 위기를 안겨줄지도 모르겠네요. 당신은 이걸 한 번만 트리거하고 싶었잖아요. 이건 Interval이니까요. 그래서, 왜 이게 문제를 일으키는 거죠?

의존배열은 이펙트가 그 렌더 스코프에서 사용하는 모든 것에 대한 힌트를 제공하는 것이라는 것을 안다면 이해가 될 것입니다. 이 이펙트는 count 상태를 사용하는데, 우리가 안 한다고 거짓말을 친 게 되는 것이죠. 이게 우리를 공격하는 것은 시간 문제예요. (이제 곧 나쁜일이 일어날거예요!!!)

첫 번째 렌더에서 count의 값은 0이에요. 그러므로, 첫 번째 렌더의 이펙트는 setCount(0+1)을 의미하죠. 빈 의존배열 때문에 우리는 never 다시 이펙트를 실행시키지 않으므로, 이펙트는 계속해서 setCount(0+1)을 호출 하는 거예요 매 초마다요!&#x20;

우리가 리액트에게 우리 이펙트가 우리 컴포넌트 안의 어떤 값에도 의존하지 않는다고 거짓말을 했어요. 실제로는 의존 하는데요.

우리의 이펙트는 카운트를 사용해요. 컴포넌트 안에 존재하는 값이죠. 하지만 effect 밖에 존재해요.

그러므로, 의존 배열로 빈 배열을 명시하는 것은 버그를 만들어 낼겁니다. 리액트는 의존 배열을 비교하고 이 이펙트를 업데이트 하는 것을 건너 뛸 것이에요.

이러한 이슈들은 생각하기에 어렵습니다. 그러므로, effect 의존 배열에 대해서 항상 솔직할 것을 강력한 규칙으로써 채택할 것을 권고 드립니다. 우리는 lint rule을 제공하고 있습니다. 당신의 팀을 강화하길 원하신다면요.

## 의존 배열에 대해 솔직해지는 두 가지 방법

먼저 일반적으로 첫 번째 방법으로 시작들 하십니다. 그리고 두 번 째 것을 필요하다면 적용하시죠.

첫 번째 전략은 의존 배열을 컴포넌트 안에서 이펙트 안에서 사용된 모든 값들을 포함하는 거예요. count를 포함해봅시다.

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

의존 배열을 옳게 만들었습니다. 이상적이지는 않을지 몰라도우리가 고쳐야했던 첫 번재 이슈였던 거죠. 이제 count를 변화시키는 것은 매 번 다음 인터벌은 그때의 렌더안의 setCount(count+1)로부터 count를 참조하면서 이펙트를 재실행 시킬겁니다.

그건 아마 문제를 해결하겠지만, 우리의 인터벌은 카운트값이 바뀔 때마다 지워지고, 다시 설정되겠죠. 제가 별로 원하는 방식은 아니네요.

두 번째 전략은 우리의 이펙트 코드가 우리가 원하는 것보다 너무 자주 변하는 값을 필요로 하지 않도록 수정하는 거예요. 우리는 의존배열에 거짓말을 하고싶지 않아요. 그저 우리의 이펙트가 그 값들을 더 적게 갖도록 수정하고 싶은 것 뿐이에요.

의존 배열을 삭제하기 위한 몇 가지 기술들을 살펴봅시다.

## 이펙트를 자급자족하도록 만들어라

우리는 우리의 이펙트 안에서 count에 대한 의존을 제거하고 싶어요.

그러려면, 스스로에게 물어봐야돼요. 우리가 count를 무엇을 위해서 쓰고 있는가? 우리가 그러 오직 setCount를 호출하기 위해서 사용하고 있잖아요. 이런 경우에는 우린 사실 count를 이 스코프에서 전혀 필요하지 않거든요. 우리가 이전 상태에 기반해서 상태를 업데이트 하고 싶을 때는 함수형 업데이트를 사용할 수 있어요.

```jsx
setState((prev) => {
    return prev + 1;
})
```

하지만 함수형 업데이트도 막 그렇게 좋지는 않아요. 조금 이상해보이고 사용 범위 자체도 매우 제한적이에요. 예를 들어서, 우리가 그 값이 서로에게 의존하는 두개의 상태 변수가 있다면, 혹은 우리가 다음 state를 props에 기반해서 계산해야 한다면, 이 함수형 업데이트가 도움이 되지 않을 거예요. 다행히도, 이러한 함수형 업데이트는 강력한 자매 패턴을 가지고 있습니다. 이름하야 useReducer.

## 액션으로부터 업데이트 분리하기

앞선 예시를 두 개의 변수를 갖도록 수정해봅시다. 카운트와 스텝. 우리의 interval은 카운트를 스텝 인풋 값 만큼 증가시킬 겁니다.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
 
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);
 
  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

우리가 반칙을 쓰지 않을 것임을 명심하세요. 우리가 step을 effect 안에서 사용을 시작할 것이기 때문에 저는 의존배열에 추가할 겁니다. 그리고 그래서 코드가 올바르게 작동할 겁니다.

이 예시에서의 현재 행동은 스텝을 변경하는 것이 인터벌을 재시작한다는 것입니다. 왜냐하면 의존 배열에 포함되어 있으니까요. 그리고 많은 경우에 그것은 정확히 당신이 원하는 것이죠. 문제될 것이 없어요. 이펙트를 쪼개고 새롭게 세팅하는 것에, 우리는 피해서는 안됩니다. 우리에게 합당한 이유가 없다면요.

그러나 우리가 인터벌의 시계를 스텝의 변화마다 리셋시키고 싶지 않다고 해봅시다? 우리의 이펙트에서 스텝 의존을 어떻게 제거할 수 있죠?

상태 변수를 또다른 상태 변수의 현재 값에 의존하도록 세팅할 때에는 useReducer를 통해서 둘 다 교체하도록 시도하고 싶을 것입니다.

함수형 setState함수를 쓰고 있다면 그 대신 리듀서를 쓰도록 고려해보기에 좋은 타이밍 입니다. 리듀서는 너의 컴포넌트 안에서 일어나는 액션을 표현하는 것과 상태가 그것에 대한 반응으로 어떻게 업데이트 되어야 할지를 분리하도록 해줍니다.

스텝 디펜던시를 우리의 이펙트 안에서 디스패치 디펜던시로 교환해줍시다.

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;
 
useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

이게 뭐가 어떻게 더 좋은 건지 질문하실 수도 있지만, 그 대답은 리액트가 디스패치 함수가 컴포넌트의 생명 주기 전체를 통틀어서 상수이도록 보장한다는 점입니다. 그래서 위의 예시는 인터벌을 재 구독할 필요가 다시는 없습니다.

우리의 문제를 해결했네요!

이펙트 안의 상태를 읽는 것 대신에, 이펙트는 무엇이 일어났는지에 대한 정보를 해독하는 어떤 액션을 감시합니다. 이것은 우리의 이펙트가 스템 상태로부터 분리되어 유지될 수 있도록 만들어주죠. 우리의 이펙트는 우리가 상태를 어떻게 업데이트 하는지에 대해서는 관심 없어요, 그저 우리에게 무엇이 일어났는지에 대해서 얘기할 뿐이죠. 그리고 리듀서는 업데이트 로직을 centralize(중앙집중화) 합니다.

```jsx
const initialState = {
  count: 0,
  step: 1,
};
 
function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```
