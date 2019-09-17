const fs = require('fs')
const DogIDSystem = artifacts.require('./DogIDSystem.sol')
const BuyingPet = artifacts.require('./BuyingPet.sol')
const PetMarketSystem = artifacts.require('./PetMarketSystem.sol')

module.exports = function (deployer) {
    //네트워크에 디플로이
    deployer.deploy(DogIDSystem)
    //디플로이 정보 ABI, Address파일을 저장
    //ABI는 블록체인과 컨트랙트 간의 상호작용을 위한 정보
    .then(() => {
        if (DogIDSystem._json){
            fs.writeFile('deployed_DIS_ABI', JSON.stringify(DogIDSystem._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 DIS ABI 입력 성공");
                }
            )

            fs.writeFile('deployed_DIS_Address', DogIDSystem.address, 
                (err) => {
                    if (err) throw err;
                    console.log("파일에 DIS 주소 입력 성공");
                }
            )
        }
    })
    deployer.deploy(BuyingPet)
    //디플로이 정보 ABI, Address파일을 저장
    //ABI는 블록체인과 컨트랙트 간의 상호작용을 위한 정보
    .then(() => {
        if (BuyingPet._json){
            fs.writeFile('deployed_BP_ABI', JSON.stringify(BuyingPet._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 BP ABI 입력 성공");
                }
            )

            fs.writeFile('deployed_BP_Address', BuyingPet.address, 
                (err) => {
                    if (err) throw err;
                    console.log("파일에 DIS 주소 입력 성공");
                }
            )
        }
    })
    deployer.deploy(PetMarketSystem)
    //디플로이 정보 ABI, Address파일을 저장
    //ABI는 블록체인과 컨트랙트 간의 상호작용을 위한 정보
    .then(() => {
        if (PetMarketSystem._json){
            fs.writeFile('deployed_PMS_ABI', JSON.stringify(PetMarketSystem._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 PMS ABI 입력 성공");
                }
            )

            fs.writeFile('deployed_PMS_Address', PetMarketSystem.address, 
                (err) => {
                    if (err) throw err;
                    console.log("파일에 PMS 주소 입력 성공");
                }
            )
        }
    })
}
