// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import tokon_artifacts from '../../build/contracts/Tokon.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Tokon = contract(tokon_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var retailerAddrs = "0x2cdd5eebe58eff29d0cca2971cdddc9fb941faa4";

window.App = {

  start: function() {
    var self = this;

    // Bootstrap the EcoToken abstraction for Use.
    Tokon.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      console.log('Account considered is ' + account);

//      var promoCode_element = document.getElementById("promoCode");
//      if(promoCode_element)
//      self.createPromo();

        self.remainingPromo("PROMO_001");
        self.isPromoRedeemed("PROMO_001");
        self.getPromoDetails("PROMO_001");

//        self.trackRetailerPayment("PROMO_001");

    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    if(status)status.innerHTML = message;
  },

  createPromo: function() {
      var self = this;

      var promoCode = document.getElementById("promoCode").value;

      var contractInst;
      Tokon.deployed().then(function(instance) {
        contractInst = instance;
        return contractInst.createPromotion(promoCode, 100, 2, {from: account});
      }).then(function(value) {
       self.setStatus("Promotion is created");
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error getting usage; see log.");
      });
    },

  getPromoDetails: function(promoCode) {
    var self = this;

    var promoCodeEle = document.getElementById("promoCodeForDetails");
    if(!promoCode)promoCode = promoCodeEle.value;

    var contractInst;
    Tokon.deployed().then(function(instance) {
      contractInst = instance;
      return contractInst.getPromoDetails.call(promoCode, {from: account});
    }).then(function(value) {
          var promoCode = document.getElementById("promoCodeDisplay");
          if(promoCode)promoCode.innerHTML = value[0];

          var promocurrentInventoryDisplay = document.getElementById("promocurrentInventoryDisplay");
          if(promocurrentInventoryDisplay)promocurrentInventoryDisplay.innerHTML = value[1];

          var promoCreditDisplay = document.getElementById("promoCreditDisplay");
          if(promoCreditDisplay)promoCreditDisplay.innerHTML = value[2];

    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting usage; see log.");
    });
  },

  redeemPromo: function() {
    var self = this;

    self.setStatus("Initiating transaction... (please wait)");

//    var promoCode = document.getElementById('redeemPromo').value;

     var promoCode = "PROMO_001";

    var contractInst;
    Tokon.deployed().then(function(instance) {
      contractInst = instance;
      return contractInst.redeemPromo(promoCode, retailerAddrs, {from: account});
    }).then(function() {
      self.setStatus("Coupon Redeemed");
    }).catch(function(e) {
      self.setStatus("Error attempting to redeem coupon, see log.");
      console.log(e);
    });
  },

  isPromoRedeemed: function(promoCode) {
    var self = this;

    var contractInst;
    Tokon.deployed().then(function(instance) {
      contractInst = instance;
      return contractInst.isPromoRedeemedByUser.call(promoCode, {from: account});
    }).then(function(result) {
        var ispromoRedeemedVar = document.getElementById("ispromoRedeemed");
        if(ispromoRedeemedVar)ispromoRedeemedVar.innerHTML = result.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending txn; see log.");
    });
  },

  remainingPromo: function(promoCode) {
      var self = this;

      var contractInst;
      Tokon.deployed().then(function(instance) {
        contractInst = instance;
        return contractInst.remainingRedemptions.call(promoCode, {from: account});
      }).then(function(value) {
          var remainingPromoRedemption = document.getElementById("remainingPromoRedemption");
          if(remainingPromoRedemption)remainingPromoRedemption.innerHTML = value.valueOf();
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error sending txn; see log.");
      });
    },

    trackRetailerPayment: function(promoCode) {
          var self = this;

              self.setStatus("Initiating transaction... (please wait)");

          //    var promoCode = document.getElementById('redeemPromo').value;

               var promoCode = "PROMO_001";

              var contractInst;
          Tokon.deployed().then(function(instance) {
                contractInst = instance;
                return contractInst.redeemPromo(promoCode, retailerAddrs, {from: account});
          }).then(function(result) {
              for (var i = 0; i < result.logs.length; i++) {
                  var log = result.logs[i];

                  if (log.event == "RetailerPaid") {
                    console.log(JSON.stringify(log));
                  }
                }
          }).catch(function(e) {
            console.log(e);
            self.setStatus("Error sending txn; see log.");
          });
        }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
