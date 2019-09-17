// truffle.js config for klaytn.
//컨트랙트 배포할 블록체인 네트워크 관련 파일
const PrivateKeyConnector = require('connect-privkey-to-provider')
const NETWORK_ID = '1001' //바오밥 네트워크 고유 아이디
const GASLIMIT = '40000000'  //배포시 가스 한도
//블록체인 네트워크 주소(바오밥 주소)
const URL = 'https://api.baobab.klaytn.net:8651'
//개인 계정 인증키
const PRIVATE_KEY = '0xa9ef6ce6c07ab8fa547dee304b2ba89b3b1dde7d864d1d2649972098a5185b91'

module.exports = {
    networks:{
        klaytn: {
            //클라이튼 노드 제공 네트워크
            provider: new PrivateKeyConnector(PRIVATE_KEY, URL),
            network_id: NETWORK_ID,
            gas: GASLIMIT,
            gasPrice: null,//자동
        }
    },
}