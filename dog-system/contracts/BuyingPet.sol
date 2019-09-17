pragma solidity 0.4.25;

contract BuyingPet {
  address public consumer;//구매자의 퍼블릭 주소
  constructor() public {
    consumer = msg.sender;
  }
  function getBalance(address consumer) public view returns (uint) {
    return consumer.balance;
  }
  function purchase(address sellerAddress, address consumer, uint _value)
                                  public payable {
    require(getBalance(consumer) >= _value);
    sellerAddress.transfer(_value);
  }
}