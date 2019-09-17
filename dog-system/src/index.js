import Caver from "caver-js";//클레이튼 관련 js
import {Spinner} from "spin.js";
import { ok } from "assert";

//클레이튼 바오밥 프라이빗 네트워크 정보
const config = {
  rpcURL: 'https://api.baobab.klaytn.net:8651',
  mediaURL : 'http://192.168.0.2:3000',
  bingoURL :'http://13.209.110.240:8080'
};
//Caver객체
const cav = new Caver(config.rpcURL);
//컨트랙트 함수에 접근하기 위한 객체
const bpContract = new cav.klay.Contract(DEPLOYED_BP_ABI, DEPLOYED_BP_ADDRESS);
const pmsContract = new cav.klay.Contract(DEPLOYED_PMS_ABI, DEPLOYED_PMS_ADDRESS);

const App = {
  //키스토어 정보 객체
  auth:{
    accessType: 'keystore',
    keystore: '',
    password: ''
  },

  img_api:{
    upload_url: config.mediaURL+'/imgUpload',
    check_url: config.mediaURL+'/imgCmp',
    img_address: config.mediaURL+'uploads/'
  },

  //============================
  //페이지 실행시 자동 실행되는 함수
  start: async function () {
    //세션에 저장되어 있는 계정 가져오기
    const walletFromSession = sessionStorage.getItem('walletInstance');
    console.log(walletFromSession);
    //로그인 상태면 케이버 지갑에 계정 추가
    //로그인 상태 유아이로 변경
    if(walletFromSession!= null){
      

      if(walletFromSession){
        try{
          cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
          this.changeUI(JSON.parse(walletFromSession));
          if($("#pageNum").val()=="00"){
            location.replace("/blank.html");
          }
        }catch (e){
          //유효하지 않은 계정
          sessionStorage.removeWallet('walletInstance')
          
        }
      }
      else{
        //keystore파일을 통한 로그인 실행
        this.handleImport2();
        this.auth.password = this.load_keystore.password;
        this.handleLogin();
        if($("#pageNum").val()=="00"){
          location.replace("/blank.html");
        }
      }
    }
  },
  //유효한 keystore인지 확인
  handleImport: async function (input) {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0]);
      fileReader.onload = (event) => {
        try{
          //키스토어의 정보를 객체화(is, 주소, 비번)
          if(!this.checkValidKeystore(event.target.result)){
            $('#message').text('유효하지 않은 keystore 파일입니다. ');
            return;
          }
          //키스토어 json저장
          this.auth.keystore = event.target.result;
          $('#message').text('keystore 통과. 비밀번호를 입력하세요');
          document.querySelector('#input-password').focus();
        }catch (event){
          $('#message').text('유효하지 않은 keystore 파일입니다. ');
          return;
        }
      }
  },
  //유효한 keystore인지 확인
  handleImport2: async function () {
    try{
      //키스토어의 정보를 객체화(is, 주소, 비번)
      if(!this.checkValidKeystore(this.load_keystore.keystore)){
        console.log('유효하지 않은 keystore 파일입니다. 1');
        return;
      }
      //키스토어 json저장
      this.auth.keystore = this.load_keystore.keystore;
      console.log('keystore 통과. 비밀번호를 입력하세요');
      document.querySelector('#input-password').focus();
    }catch (event){
      console.log('유효하지 않은 keystore 파일입니다. 2');
      return;
    }
  },
  // Password 전역 변수에 저장
  handlePassword: async function () {
    this.auth.password = event.target.value;
  },
  //입력한 비밀번호가 키스토어에 등록된 비번과 일치하는지 확인
  //계정 인스턴스를 지갑에 추가, 세션에 저장
  handleLogin: async function () {
    if(this.auth.accessType === 'keystore'){
      try{
        //키스토어와 입력한 비밀번호를 해독해 비번이 일치하는지 확인
        //privateKey는 해독 정보 중 하나
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        //privateKey를 계정 인스턴스로 바꾸고
        //caver의 지갑에 계정 추가
        //세션에 계정 인스턴스를 저장

        
        this.integrateWallet(privateKey);
      }catch (e) {
        $('#message').text('비밀번호가 일치하지 않습니다.');
      }
    }
  },

  //로그아웃
  //케이브 월렛에 등록된 계정, 세션에 등록된 계정 지우기
  //새로고침으로 처음상태로
  handleLogout: async function () {
    this.removeWallet();
    sessionStorage.clear();
    location.href = 'login.html'
  },

  //케이브 월렛 가져오기
  getWallet: function () {
    if(cav.klay.accounts.wallet.length){
      return cav.klay.accounts.wallet[0];
    }
  },

  //키스토어의 정보를 객체화(is, 주소, 비번)
  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);
    console.log(parsedKeystore);
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;
    return isValidKeystore;
  },
  

  //privateKey를 계정 인스턴스로 바꾸고
  //caver의 지갑에 계정 추가
  //세션에 계정 인스턴스를 저장
  integrateWallet: function (privateKey) {
    //privateKey를 계정 인스턴스로 바꾸고
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    
    pmsContract.methods.getUser(walletInstance.address).call()
    .then(function(user){
      console.log(user);
      if(user.bId != ""){
        //caver의 지갑에 계정 추가
        cav.klay.accounts.wallet.add(walletInstance);
        //세션에 계정 인스턴스를 저장
        sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
        sessionStorage.setItem('bId', user.bId);
        sessionStorage.setItem('date', App.getFomatToday());
        //로그인한 결과 페이지 레이아웃 변경
        console.log($("#pageNum").val());
        location.href = 'blank.html'
        if($("#pageNum").val()=="00"){
          //ok
          
        }else{
          this.changeUI(walletInstance);
        }
      }
      else{
        alert("등록되지 않은 사용자입니다.");
      }
    });
  },
  //privateKey를 계정 인스턴스로 바꾸고
  //caver의 지갑에 계정 추가
  //세션에 계정 인스턴스를 저장
  
  //객체 초기화
  reset: function () {
    this.auth = {
      keystore: '',
      password: ''
    };
  },
//로그인한 결과 페이지 레이아웃 변경
  changeUI: async function (walletInstance) {
    //모달과 로그인 버튼 감추기
    $('#loginModal').modal('hide');
    $('#login').hide();
    //로그아웃 버튼 보이기
    $('#logout').show();
    //로그인된 후 표출할 레이아웃 보이기
    $('#blockContents').show();
    //계정 주소 표출
    $('#address').append('<br><p> 내 계정 주소: ' + walletInstance.address + '</p>');
    

    $(document).ready( function() {
      $(document).on('change', '.btn-file :file', function() {
        var input = $(this),
          label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [label]);
        });
  
      $('.btn-file :file').on('fileselect', function(event, label) {
          
          var input = $(this).parents('.input-group').find(':text'),
              log = label;
          
          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }
        
      });
    });
  },
  //케이브 월렛에 등록된 계정, 세션에 등록된 계정 지우기
  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    sessionStorage.removeItem('userInfo');
    //객체 초기화
    this.reset();
  },

  showTimer: function () {
    var seconds = 3;
    $('#timer').text(seconds);

    var interval = setInterval(()=>{
      $('#timer').text(--seconds);
      if(seconds <=0){
        $('#timer').text('');
        $('#answer').val('');
        $('#question').hide();
        $('#start').show();
        clearInterval(interval);
      }
    }, 1000);
  },

  showSpinner: function () {
    var target = document.getElementById("spin");
    return new Spinner(opts).spin(target);
  },
  regHandleKeyCheck : async function () {
    this.auth.password = $("#input-password").val();
    if(this.auth.accessType === 'keystore'){
      try{
        //키스토어와 입력한 비밀번호를 해독해 비번이 일치하는지 확인
        //privateKey는 해독 정보 중 하나
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        //privateKey를 계정 인스턴스로 바꾸고
        //caver의 지갑에 계정 추가
        //세션에 계정 인스턴스를 저장
        //privateKey를 계정 인스턴스로 바꾸고
        const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
        //caver의 지갑에 계정 추가
        cav.klay.accounts.wallet.add(walletInstance);

        $("#userKeyInput").attr('disabled',true);
        $("input-password").attr('disabled',true);
        $("#btnKeyCheck").attr('disabled',true);

        $("#bingoId").attr('disabled',false);
        $("#bingoPassword").attr('disabled',false);
        $("#registUserInfo").attr('disabled',false);

      }catch (e) {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }
  },

  regCheckBingoAccount: function(){
    var bId = $("#bingoId").val();
    var bPassword = $("#bingoPassword").val();

    $.ajax({
      type: "POST",
      url: config.bingoURL+"/login",
      data: JSON.stringify({
              ID:bId,
              Password : bPassword
            }),
      dataType:"json",
      contentType:"application/json",
      success:function(data){
        console.log(data);
          if(data['status'] == 'ok'){
            App.regUserInfo(bId,bPassword);
          }
          else{
            alert("아이디 혹은 비밀번호를 잘못 입력하셨거나 없는 계정입니다.");
          }
      }
    });

  },

  regUserInfo : async function(bId, bPassword){
    console.log("regUserInfo");
    const walletInstance = this.getWallet();

    if(!walletInstance) return;

    //public key를 이용해 유저 계정 생성
    await pmsContract.methods.createUser(walletInstance.address, bId, bPassword).send({
      from : walletInstance.address, 
      gas : '250000'
    })
    .once('transactionHash', (txHash) =>{
      console.log(`txhash: ${txHash}`);
      console.log("성공");
    })
    .once('receipt', (receipt) => {
      console.log(`(#${receipt.blockNumber})`, receipt);
      
      location.href='login.html';
    })
    .once('error', (error) => {
      alert(error.message);
    });
  },

  regPetInfo : async function(names, breeds, births, sexs, weights, petSrn){
    var bId = sessionStorage.getItem('bId');
    var walletInstance = this.getWallet();
    if(!bId || !walletInstance) return;
    
    await pmsContract.methods.createPets(walletInstance.address, names, breeds, births, sexs, weights).send({
        from : walletInstance.address,
        gas : '5000000'
      })
      .once('transactionHash', (txHash) =>{
        console.log(`txhash: ${txHash}`);
      })
      .once('receipt', (receipt) => {
        console.log(`(#${receipt.blockNumber})`, receipt);     
        //업데이트 완료되면 블록체인에 등록된 정보 불러와서 화면에 표시!
        //강아지 목록을 받아온다 -> 강아지의 데이터를 등록한다.
        console.log('regPetInfo receipt');
        pmsContract.methods.getPetIdsOfUser(walletInstance.address).call().then(function (petIds){
          App.handleDailyPetInfo(petIds, 0, petSrn);
        });
      })
      .once('error', (error) => {
        console.log(error.message);
      });
  },
  handleDailyPetInfo : async function(petIds, i, petSrn){
    var bId = sessionStorage.getItem('bId');

    if(petIds.length <= i){
      alert('업데이트 완료');
      return;
    }
    $.ajax({
      type: "GET",
      url : config.bingoURL+"/coach/stat/month?userId=" + bId + "&petSrn="+ petSrn[i] + "&inpDate="+ App.getFormatDate() + "&timearea=Asia/Seoul",
      dataType:"json",
      contentType:"application/json",
      success : function(data){
        console.log(data);
        if(data['status'] == 'ok'){
          var monthList = data['monthList'];
          App.regDailyPetInfo(petIds, i, monthList, 0, petSrn);
        }
        else{
          App.handleDailyPetInfo(petIds, i+1, petSrn);
        }
      },
      error : function(){
        App.handleDailyPetInfo(petIds, i+1, petSrn);
      }
    });
  },
  regDailyPetInfo : async function(petIds, i ,monthList, idx, petSrn){
      var walletInstance = this.getWallet();
    
      if(monthList.length <= idx){
        this.handleDailyPetInfo(petIds, i+1, petSrn);
        return;
      }

      var d = new Array();
      d.push(monthList[idx]['sunVal']+ ""); d.push(monthList[idx]['uvVal']+""); d.push(monthList[idx]['vitVal']+"");
      d.push(monthList[idx]['actVal']+""); d.push(monthList[idx]['playVal']+""); d.push(monthList[idx]['restVal']+"");
      d.push(monthList[idx]['calVal']+""); d.push(monthList[idx]['barkVal']+""); d.push(monthList[idx]['depVal']+"");
      d.push(monthList[idx]['luxpolVal']+"");
      console.log(d);
      await pmsContract.methods.createDailyData(petIds[i], App.getFormatDate() + (monthList[idx]['idx'] < 10 ? "0" + monthList[idx]['idx'] : ""+monthList[idx]['idx']), d).send({
        from : walletInstance.address, 
        gas : '500000'
      })
      .once('transactionHash', (txHash) =>{
        console.log(`txhash: ${txHash}`);
      })
      .once('receipt', (receipt) => {
        console.log(`(#${receipt.blockNumber})`, receipt);
        console.log(i + "번째 Pet   " + App.getFormatDate() + monthList[idx]['idx']+" 성공");
        App.regDailyPetInfo(petIds, i, monthList, idx+1, petSrn);
        //setTimeout(async function(){ }, 500);
      })
      .once('error', (error) => {
        alert(error.message);
      });
  },
  handleUpdate : async function(){
    var bId = sessionStorage.getItem('bId');
    var walletInstance = this.getWallet();
    if(!bId || !walletInstance) return;

    console.log(bId);

    await pmsContract.methods.getPetIdsOfUser(walletInstance.address).call().then(function(petIds){
      $.ajax({
        type: "GET",
        url: config.bingoURL+"/companion?userId=" + bId,
        dataType:"json",
        contentType:"application/json",
        success:function(data){
          console.log(data);
            if(data['status'] == 'ok' && petIds.length < data['myPetList'].length){
              
              var names = new Array();
              var breeds = new Array();
              var births = new Array();
              var sexs = new Array();
              var weights = new Array();
              var petSrn = new Array();

              for(var i=0; i<data['myPetList'].length; i++){
                names.push(data['myPetList'][i]['petNm']);
                breeds.push(data['myPetList'][i]['petCdNm']);
                births.push(data['myPetList'][i]['petBirth']);
                sexs.push(data['myPetList'][i]['petSex'] == 'M' ? true : false);
                weights.push(parseInt(data['myPetList'][i]['petWgtKg']));
                petSrn.push(data['myPetList'][i]['petSrn']);
              }

              App.regPetInfo(names, breeds, births, sexs, weights, petSrn);
            }
            else{
              alert("더이상 등록할 강아지가 없습니다.");
            }
        }
      });
    });
  },
  getPetList : async function(table){
    var walletInstance = this.getWallet();
    if(!walletInstance) return;
    table.DataTable().clear();

    await pmsContract.methods.getPetIdsOfUser(walletInstance.address).call().then(function(petIds){
      console.log(petIds);
      App.getPetInfo(petIds, 0, table);
    });
  },
  getPetInfo : async function(petIds, idx, table){
    if(petIds.length > idx){
      await pmsContract.methods.getPet(petIds[idx]).call().then(function(pet){
        App.addTableItem(table, pet, petIds[idx]);
        App.getPetInfo(petIds, idx+1, table);
      });
    }
    else{
      //완료
    }
  },
  addTableItem : function(table, item, petId){
    //item을
    console.log(item);
    var name = table.data('name');
    if(!name || (name && item['price'] > 0)){
      //zzqyu start
      var a = [null, item['name'], item['breed'], item['birthday'], item['sex'] == true ? 'M' : 'F', item['weightKg'], item['price'], item['noseHash'], petId];
      //zzqyu end
      table.DataTable().row.add(a).draw();
    }
  },
  handleSellBtn : function(petName, petId){
    var nLabel = $('#Modal-petName');
    nLabel.text(petName + '의 가격');
    $('#input-sellPrice').data('name',petId);
    $('#sellModal').modal();
  },
  handleSellInModal : async function(){
    //1. 가격이 0이상인지 or 비밀번호가 올바른지
    //2. 판매버튼 클릭하면 으이? 블록체인 네트워크상의 가격을 수정하는 함수 실행 -끝-
    var price = $('#input-sellPrice').val();
    var pw = $('#input-sellPw').val();
    if(price <= 0){
      alert("가격이 0 이하이거나 비밀번호가 다릅니다");
      return;
    }
    var walletInstance = this.getWallet();
    if(!walletInstance) return;

    console.log($('#input-sellPrice').data('name') + ' , ' +price);

    await pmsContract.methods.registerPetPrice($('#input-sellPrice').data('name'), price).send({
      from : walletInstance.address, 
      gas : '250000'
    })
    .once('transactionHash', (txHash) =>{
      console.log(`txhash: ${txHash}`);
      console.log("가격 등록 성공");
    })
    .once('receipt', (receipt) => {
      console.log(`(#${receipt.blockNumber})`, receipt);
      setTimeout( async function(){ await App.getPetList($('#pet-table'));  $('#sellModal').modal("hide");}, 300); //바로 실행하면 안됨 좀 기다렸다가
    })
    .once('error', (error) => {
      alert(error.message);
    });
  },
  handleCancelBtn : function(petName, petId){
    $('#btn-sellCancel').data('name',petId);
    $('#cancelModal').modal();
  },
  handleCancelInModal : async function(){
    var walletInstance = this.getWallet();
    if(!walletInstance) return;

    console.log($('#btn-sellCancel').data('name') + ' , ' +0);

    await pmsContract.methods.registerPetPrice($('#btn-sellCancel').data('name'), 0).send({
      from : walletInstance.address, 
      gas : '250000'
    })
    .once('transactionHash', (txHash) =>{
      console.log(`txhash: ${txHash}`);
      console.log("판매 취소 성공");
    })
    .once('receipt', (receipt) => {
      console.log(`(#${receipt.blockNumber})`, receipt);
      setTimeout( async function(){ await App.getPetList($('#pet-table')); $('#cancelModal').modal("hide");}, 1000); //바로 실행하면 안됨 좀 기다렸다가
    })
    .once('error', (error) => {
      alert(error.message);
    });
  },
  getAllPetsOnSale : async function(table){
    await pmsContract.methods.getNumPets().call().then(function(numPets){
      pmsContract.methods.getPetIdsOfUser(App.getWallet().address).call().then(function(petIds){
        var pets = new Array();
        for(var i=0; i<numPets; i++){
          var flg = true;
          for(var j=0; j<petIds.length && flg; j++){
            if(petIds[j] == i)
              flg = false;
          }
          if(flg)
            pets.push(i);
        }
        if(pets.length > 0)
          App.getPetInfo(pets, 0, table);
      });
    });
  },
  getBalance : async function(){
    return cav.utils.fromPeb( await bpContract.methods.getBalance(this.getWallet().address).call() , "KLAY");
  },

  handleBuyBtn : async function(petId){
    $('#btn-buy').data('name', petId);
    $('#buyModal').modal();
  },
  handleBuyBtnInModal : async function(){
    //1. 송금
    //2. 거래 등록
    var walletInstance = this.getWallet();
    if(!walletInstance) return;

    var petId = $('#btn-buy').data('name');
    console.log('name : ' + petId);

    await pmsContract.methods.getPet(petId).call().then(async function(pet){
      await cav.klay.sendTransaction({
        type: 'VALUE_TRANSFER',
        from : walletInstance.address,
        to : pet['owner'],
        gas : '250000',
        value : cav.utils.toPeb(pet['price'], 'KLAY')
      })
      .then(async function(receipt){
        console.log(`(#${receipt.blockNumber})`, receipt);
        console.log("송금 성공");
        setTimeout(async function(){
          await pmsContract.methods.createTransaction(receipt['transactionHash'], walletInstance.address, pet['owner'], petId).send({
          from : walletInstance.address,
          gas : '500000'
        })
        .once('transactionHash', (txHash) =>{
          console.log(`txhash: ${txHash}`);
        })
        .once('receipt', (receipt) => {
          console.log(`(#${receipt.blockNumber})`, receipt);
          console.log("거래 등록 및 결과 처리 성공");
          $('#buyModal').modal('hide');
        })
        .once('error', (error) => {
          alert(error.message);
        });
        }, 1000);

      });
    });
  },
  getFormatDate : function(){
    var date = new Date();
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    return year + '' + month;
  },
  getFomatToday : function(){
    var date = new Date();
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    var dd = date.getDate();
    month = month >= 10 ? month : '0' + month;
    dd = dd<10 ? '0'+dd : dd;
    return year + '' + month + '' + dd;
  },
  //zzqyu start
  handleAddNoseBtn : async function(petNm, petId){
    var walletInstance = this.getWallet();
    if(!walletInstance) return;
    var nLabel = $('#modal-title-add-nose');
    var addBnt = $('#bnt-add-nose');
    nLabel.text(petNm + '의 비문 등록');
    document.getElementById("input-add-nose").value='';
    $('#addNoseModal').modal();
    addBnt.on("click", function(){
        let file = document.getElementById("input-add-nose").files[0];
        if(!file){
          alert("파일을 첨부해 주세요");
          return false;
        }
        else{
          let formData = new FormData();
          formData.append("img", file);
          $.ajax({
              type: 'POST',
              url: App.img_api.upload_url,
              data: formData,
              async: false,
              cache: false,
              contentType: false,
              processData: false,
              success: function (data) {
                  //$(".newImg").attr("src", data.filePath);
                  console.log(data.hash);
                  pmsContract.methods.registerPictureHash(petId, data.hash).send({
                    from : walletInstance.address, 
                    gas : '250000'
                  })
                  .once('transactionHash', (txHash) =>{
                    console.log(`txhash: ${txHash}`);
                    console.log("해시 등록 성공");
                  })
                  .once('receipt', (receipt) => {
                    console.log(`(#${receipt.blockNumber})`, receipt);
                    setTimeout( async function(){ await App.getPetList($('#pet-table'));  $('#addNoseModal').modal("hide");}, 300); //바로 실행하면 안됨 좀 기다렸다가
                  })
                  .once('error', (error) => {
                    alert(error.message);
                  });
              },
              error: function (err) {
                  console.log(err.message);
              }
            });

        }
        
          
    });
  },
  handleCheckNoseBtn : async function(petNm, petId, hash){
    var walletInstance = this.getWallet();
    if(!walletInstance) return;
    var nLabel = $('#modal-title-check-nose');
    var checkBnt = $('#bnt-check-nose');
    nLabel.text(petNm + '의 비문 검증');
    document.getElementById("input-check-nose").value='';
    $('#checkNoseModal').modal();
    checkBnt.on("click", function(){
        let file = document.getElementById("input-check-nose").files[0];
        if(!file){
          alert("파일을 첨부해 주세요");
          return false;
        }
        else{
          let formData = new FormData();
          formData.append("img", file);
          formData.append("hash", hash);
          $.ajax({
              type: 'POST',
              url: App.img_api.check_url,
              data: formData,
              async: false,
              cache: false,
              contentType: false,
              processData: false,
              success: function (data) {
                  //$(".newImg").attr("src", data.filePath);
                  console.log(data.hash);
                  console.log(data.Dissimilarity);
                  if(data.Dissimilarity===0)
                    alert("비문이 검증되었습니다.");
                  else
                    alert("비문이 일치하지 않습니다.");
                  setTimeout( async function(){ await location.reload();}, 300); //바로 실행하면 안됨 좀 기다렸다가
              },
              error: function (err) {
                  console.log(err.message);
              }
            });
          }
    });
  },

  getTransactionList : async function(table){
    var walletInstance = this.getWallet();
    if(!walletInstance) return;
    table.DataTable().clear();

    await pmsContract.methods.getTxHashsOfUser(walletInstance.address).call().then(function(txHashs){
      console.log(txHashs);
      App.getTxInfo(txHashs, 0, table);
    });
  },
  getTxInfo : async function(txHashs, idx, table){
    if(txHashs.length > idx){
      await pmsContract.methods.getTransaction(txHashs[idx]).call().then(function(transaction){
        App.addTxTableItem(table, transaction, txHashs[idx]);
        App.getTxInfo(txHashs, idx+1, table);
      });
    }
    else{
      //완료
    }
  },
  addTxTableItem : async function(table, item, txHash){
    console.log(item);
    pmsContract.methods.getPet(item['petId']).call().then(function(pet){
      console.log(pet);
      var a = [pet['name'], pet['breed'], pet['sex'] == true ? 'M' : 'F', item['consumerAddress'], item['sellerAddress'], item['txHash'], item['petId']];
      table.DataTable().row.add(a).draw();
    });
    var name = table.data('name');
    
  },



  //zzqyu end
  format : function (rIdx, idx, data){
    console.log(data);
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
      '<tr>'+
          '<td>Date :</td>'+
          '<td>'+data['date']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>sun :</td>'+
          '<td>'+data['sun']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>uv :</td>'+
          '<td>'+data['uv']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>vit :</td>'+
          '<td>'+data['vit']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>act :</td>'+
          '<td>'+data['act']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>play :</td>'+
          '<td>'+data['play']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>rest :</td>'+
          '<td>'+data['rest']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>cal :</td>'+
          '<td>'+data['cal']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>bark :</td>'+
          '<td>'+data['bark']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>dep :</td>'+
          '<td>'+data['dep']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td>lux :</td>'+
          '<td>'+data['lux']+'</td>'+
      '</tr>'+
      '<tr>'+
          '<td><input type="button" class="btn btn-primary table-btn" value="이전" onclick="App.getDailyData(\'' + rIdx +'\' , \'' +(idx*1-1)+'\')"/></td>'+
          '<td><input type="button" class="btn btn-primary table-btn" value="다음" onclick="App.getDailyData(\''+ rIdx + '\' , \'' +(idx*1+1)+'\')"/></td>'+
      '</tr>'+
  '</table>';
  },
  //1. add ddIds to 세션 저장소 2. 성공하면 열기 3. 열었으면......ddIds의 첫번째 idx 보여주기,
  getDdidsToSseion : async function(petId, tr){
    console.log("pet Id : "+petId);
    await pmsContract.methods.getDailyDataIdsOfPet(petId).call().then(function(ddIds){
      console.log("ddids : " + ddIds);
      sessionStorage.setItem('ddids', JSON.stringify(ddIds));
      var rIdx = $('#pet-table').DataTable().row(tr).index();
      App.getDailyData(rIdx, 0);
    });
  },
  getDailyData : async function(rIdx, idx){
    var ddids = JSON.parse(sessionStorage.getItem('ddids'));
    console.log(ddids);
    if(ddids.length == 0 || idx >= ddids.length) {
      var row = $('#pet-table').DataTable().row(rIdx);
      if(row.child.isShown()) row.child.remove();
      row.child("<table> 데이터가 존재하지 않습니다. </table>").show();
      return ;
    };

    pmsContract.methods.getDailyData(ddids[idx]).call().then(function(data){
      var row = $('#pet-table').DataTable().row(rIdx);
      if(row.child.isShown()) row.child.remove();
      row.child(App.format(rIdx, idx, data)).show();
    });
  },
};

window.App = App;
//페이지 실행시 자동 실행
window.addEventListener("load", function () {
  this.console.log('가능?');
  App.start();
  $("#input-password").on("change keyup paste",function(){
    if($(this).val() == ""){
      $('#btnKeyCheck').attr('disabled', true);
    }
    else{
      $('#btnKeyCheck').attr('disabled', false);
    }
  });

  
});

//스피너 관련 값
var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};