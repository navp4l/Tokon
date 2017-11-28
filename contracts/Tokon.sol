pragma solidity ^0.4.18;

import "./Owned.sol";

contract Tokon is Owned{

	struct Promo{
		string promoCode;
		uint256 currentInventory;
		uint256 credit;
	}

	mapping (string => Promo) promos;
	mapping (string => mapping (address => bool)) promoRedemption;

	event RetailerPaid (address indexed _from, address indexed _to, uint256 _value);
	event PromoRedeemed (string _promoCode, address indexed _redeemer);

	function Tokon () payable {
	}

	function createPromotion (string _promoCode, uint256 _currentInventory, uint256 _credit) public onlyOwner returns (bool){
		Promo memory newPromotion = Promo({ promoCode: _promoCode, currentInventory: _currentInventory, credit: _credit});
		promos[_promoCode] = newPromotion;
		return true;
	}

	function redeemPromo (string _promoCode, address _retailerAddrs) public returns (bool) {

		require(!isPromoRedeemedByUser(_promoCode));

		Promo memory promotion = promos[_promoCode];
		if(bytes(promotion.promoCode).length > 0) {
			promos[_promoCode].currentInventory--;

			promoRedemption[_promoCode][msg.sender] = true;
			PromoRedeemed(_promoCode, msg.sender);

			uint256 amount = promotion.credit * 10 ** 18;

			_retailerAddrs.transfer(amount);

			RetailerPaid(address(this), _retailerAddrs, amount);
		}
		return true;
	}

	function getPromoDetails (string _promoCode) public view
	returns (string promoCode,
			 uint currentInventory,
	         uint credit){
		Promo memory promotion = promos[_promoCode];
		promoCode = promotion.promoCode;
		currentInventory = promotion.currentInventory;
		credit = promotion.credit;
	}

	function isPromoRedeemedByUser (string _promoCode) public view returns (bool){
		return promoRedemption[_promoCode][msg.sender];
	}

	function remainingRedemptions (string _promoCode) public view returns (uint256 remaining) {
		remaining = promos[_promoCode].currentInventory;
	}

	function () payable {
	}

}
