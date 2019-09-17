pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

contract PetMarketSystem {

    struct User{
        address userAddress; //사용자 클레이튼 계정 퍼블릭주소
        string bId; //빙고 id
        string bPw; //빙고 pw
        uint[] petIds; //반려견 id 목록
        string[] txHashs; //거래 목록
    }

    struct Pet{
        uint id; //일련번호
        string name; //이름
        string breed; //견종
        string birthday; //생일
        bool sex; //성별(t수컷/f암컷)
        uint weightKg; //무게
        string noseHash; //비문 해시
        address owner;
        uint price; //가격
        uint[] dailyDataIds; //수집 데이터 id 목록
    }

    struct DailyData {
        uint id;//일련번호
        string date;//날짜
        string sun;
        string uv;
        string vit;
        string act;
        string play;
        string rest;
        string cal;
        string bark;
        string dep;
        string lux;
    }
    
    struct Transaction{
        string txHash; //거래 일련번호
        address consumerAddress; //구매자 address
        address sellerAddress; //판매자 address
        uint petId; //거래된 개 일련번호
    }

    uint numPets; //강아지 일련번호 부여 관련 변수
    mapping (uint => Pet) pets; //강아지 리스트 (일련번호, 강아지)

    mapping (address => User) users;//사용자 리스트(address, 유저)

    uint numDailyData; //데일리 데이터 일련번호 부여 관련 변수
    mapping (uint => DailyData) dailyDatas; //데일리 데이터 리스트 (일련번호, 데일리 데이터)

    mapping (string => Transaction) transactions; //거래 리스트 (txHash, Transaction)

    //#일반 회원 등록
    function createUser(address _userAddress, string memory _bId, string memory _bPw) public {
        User memory user;
        user.userAddress = _userAddress;
        users[_userAddress] = user;
        users[_userAddress].bId = _bId;
        users[_userAddress].bPw = _bPw;
    }

    //#get 유저
    function getUser(address _userAddress) public view returns (User memory){
        return users[_userAddress];
    }

    //#유저의 강아지 ID 목록
    function getPetIdsOfUser(address _userAddress) public view returns (uint[] memory){
        return users[_userAddress].petIds; 
    }

    //#유저의 강아지 목록
    function getPetOfUser(address _userAddress)public view returns (Pet[] memory){
        uint[] storage ids = users[_userAddress].petIds;
        Pet[] memory userPets;
        for(uint i=0; i<ids.length; i++){
            if(i==0)
                userPets[0]=pets[ids[i]];
            else
                userPets[i]=(pets[ids[i]]);
        } 
        return userPets;
    }

    //#유저의 거래해시 목록
    function getTxHashsOfUser(address _userAddress)public view returns (string[] memory){
        return users[_userAddress].txHashs; 
    }

    //#유저의 거래 목록
    function getTransactionOfUser(address _userAddress)public view returns (Transaction[] memory){
        string[] storage txHashs = users[_userAddress].txHashs;
        Transaction[] memory userTransactions;
        for(uint i=0; i<txHashs.length; i++){
            if(i==0)
                userTransactions[0]=transactions[txHashs[i]];
            else
                userTransactions[i] = (transactions[txHashs[i]]);
        } 
        return userTransactions;
    }

    //#강아지 등록
    function createPet(address userAddress, string memory _name, string memory _breed, string memory _birthday, bool _sex, uint _weightKg) public {
        Pet memory pet;
        pet.id = numPets++;
        pet.name = _name;
        pet.breed = _breed;
        pet.birthday = _birthday;
        pet.sex = _sex;
        pet.weightKg = _weightKg;
        pet.owner = userAddress;

        pets[pet.id] = pet;
        users[userAddress].petIds.push(pet.id);
    }

    function createPets(address userAddress, string[] _name, string[] _breed, string[] _birthday, bool[] _sex, uint[] _weightKg) public {
        for(uint i=0; i<_name.length; i++){
            Pet memory pet;
            pet.id = numPets++;
            pet.name = _name[i];
            pet.breed = _breed[i];
            pet.birthday = _birthday[i];
            pet.sex = _sex[i];
            pet.weightKg = _weightKg[i];
            pet.owner = userAddress;

            pets[pet.id] = pet;
            users[userAddress].petIds.push(pet.id);
        }
    }

    //#강아지 판매가 등록
    function registerPetPrice(uint petId, uint _price) public{
        pets[petId].price = _price;
    }

    //강아지 숫자 return
    function getNumPets() public view returns (uint){
        return numPets;
    }

    //#get 강아지 정보
    function getPet(uint petId)public view returns (Pet memory){
        return pets[petId]; 
    }

    //#get 강아지의 마지막 데이터 등록 일자
    function getLastDateOfDailyDataOfPet(uint petId) public view returns(string memory){
        uint[] storage ids = pets[petId].dailyDataIds;
        uint lastId = ids[ids.length-1];
        return dailyDatas[lastId].date; 
    }

    //#get 강아지 데일리데이터id 목록
    function getDailyDataIdsOfPet(uint petId)public view returns (uint[] memory){
        return pets[petId].dailyDataIds;
    }

    //#get 강아지 데일리데이터 목록
    function getDailyDataOfPet(uint petId)public view returns (DailyData[] memory){
        uint[] storage ids = pets[petId].dailyDataIds;
        DailyData[] memory petDailyDatas;
        for(uint i=0; i<ids.length; i++){
            if(i==0)
                petDailyDatas[0]=dailyDatas[ids[i]];
            else
                petDailyDatas[i] = (dailyDatas[ids[i]]);
        } 
        return petDailyDatas;
    }
    //#강아지 비문 등록
    function registerPictureHash(uint petId, string memory _noseHash) public{
        pets[petId].noseHash = _noseHash;
    }
    //#개 비문 해시 조회
    function getPictureHash(uint petId) public view returns (string memory){
      return pets[petId].noseHash;
    }
    //#데일리 데이터 등록
    function createDailyData(uint petId, string memory date, string[] memory d) public {
        uint ddId = numDailyData++;
        dailyDatas[ddId] = DailyData(ddId, date,d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7],d[8],d[9]);
        pets[petId].dailyDataIds.push(ddId);
    }
    //#get 데일리 데이터
    function getDailyData(uint ddId)public view returns (DailyData memory){
        return dailyDatas[ddId];
    }
    //#get 거래
    function getTransaction(string memory txHash)public view returns (Transaction memory){
        return transactions[txHash];
    } 

    //#거래 등록
    function createTransaction(string memory txHash, address consumerAddress, address sellerAddress, uint petId) public{
        transactions[txHash] = Transaction(txHash, consumerAddress, sellerAddress, petId);
        users[consumerAddress].txHashs.push(txHash);
        users[sellerAddress].txHashs.push(txHash);
        users[consumerAddress].petIds.push(petId);
        pets[petId].owner = consumerAddress;
        pets[petId].price = 0;
        if(users[sellerAddress].petIds.length == 1){
            delete users[sellerAddress].petIds[0];
            users[sellerAddress].petIds.length--;
        }
        else{
            for(uint i=0; i<users[sellerAddress].petIds.length; i++){
                uint iPetId = users[sellerAddress].petIds[i];
                if(iPetId == petId){
                    users[sellerAddress].petIds[i] = users[sellerAddress].petIds[users[sellerAddress].petIds.length - 1];
                    delete users[sellerAddress].petIds[users[sellerAddress].petIds.length - 1];
                    users[sellerAddress].petIds.length--;
                    break;
                }
            }
        }
    }
    //거래를 하기전에 거래 해쉬값을 받아올 수 있나??? 만약에 저렇게 안하면 1. 유저간에 강아지 주고받기 한다. 2. 해당 트랜젝션을 등록한다. 순서로
    //그런데 Bapp에서 강아지를 가지고있어서 해당 강아지를 가진 사용자(seller address)를 알 수 없다. 그러니깐 강아지 구조체에 address를 추가해야할듯
    //정리하면 1. 강아지 구조체에 소유자의 address 추가, 2. 유저간의 강아지 주고받기, 트랙젝션 등록 추가(이게)

}