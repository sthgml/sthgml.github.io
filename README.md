# 개발블로그 개발하기

## 사용한 기술

### 1. gatsby

특징: 정적 사이트 개발 (SSG server side generation) 미리 빌드해 HTML 파일로 변환하기 때문에, 서버가 아닌 CDN(Content Delivery Network)에서 직접 파일을 제공하는 방법
장점: 정적 사이트기 때문에 속도가 중요하거나 SEO가 중요한 프로젝트에서 효과적
단점: 빌드 시 모든 페이지를 html 파일로 변환하기 때문에 오래 걸림
사용 이유: 포트폴리오와 같은 배포가 잦지 않는 프로젝트에 적합

### 2. yarn

속도: Yarn은 Gatsby 프로젝트에 자주 쓰이는 패키지를 빠르게 설치할 수 있으며, 특히 캐시 관리를 잘하기 때문에 반복적인 빌드에 적합 (개발환경에서)
결정적 설치(deterministic installs): yarn.lock 파일을 통해 모든 패키지 버전을 고정하여 동일한 종속성을 유지
호환성: Gatsby 프로젝트에서 자주 사용되는 라이브러리와 플러그인들이 Yarn과 높은 호환성. Gatsby 공식 문서에서도 종종 Yarn을 예시로 사용하고 있어 따라하기가 편리

### 3. GraphQL

장점: graphiQL ide를 제공한다
특징: 필요한 데이터만 받아올 수 있음,

### 4. TypeScript

장점: 설정한 타입에 맞지 않는 값을 지정했을 때 에러를 표시해준다.
특장점: Generic을 통해 어떠한 클래스나 함수에서 사용할 타입을, 그 클래스나 함수를 사용할 때 결정할 수 있게 만들어줄 수 있음. 컴포넌트의 규모가 커질수록 효과가 큼.

### 5. Emotion

장점: 번들 용량이 다른 라이브러리에 비해 작으며, 기능은 거의 동일. 손쉽게 확장이 가능
