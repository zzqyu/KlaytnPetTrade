Contract 폴더: bapp에서 사용할 컨트랙트들을 모아둠(웹 사이트 돌아가는 데 지장 없음) 

Migrations 폴더: 컨트랙트들을 truffle를 통해 디플로이 하기 위한 js파일이 있음 (truffle deploy --network klaytn 명령어를 입력하면 디플로이 되고, 필요에 따라 ABI, Contract 주소를 파일화 할 수 있다. 이거도 마찬가지로 웹 사이트 돌아가는 데 지장 없음 

재배포: truffle deploy --compile-all ?reset --network klaytn) 

Truffle.js : 컨트랙트 배포할 블록체인 네트워크 연결 관련 파일 

빌드 폴더: 컨트랙트 배포하면 생성됨  

Webpack.config.js: 웹앱의 전역 상수 관리, 디플로이한 ABI, 컨트랙트 주소 등이 있음 

 

index.html : ui 

Index.js : ui 변경에 따른 처리, 컨트랙트 함수 실행 

 

 

npm run dev 실행하면 서버 실행 

 

file-upload-master에 들어가서 node app.js 실행하면 사진파일 서버 실행 