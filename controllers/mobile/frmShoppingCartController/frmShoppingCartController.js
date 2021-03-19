define({ 

  onNavigate: function(){
    this.pauseNavigation();
    showLoading();
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = function(){};
    this.view.flxProducts.isVisible = true;
    this.view.TopBar.flxBackImage.isVisible = false;
    this.view.TopBar.flxSearchImage.isVisible = false;
    this.view.onOrientationChange = this.orientationChange;
    this.orientationChange();
    this.mapData();
  },

  mapData: function(){
    this.idleTimeOut();

    if(!shoppingCart.length){
      this.view.lblEmpty.isVisible = true;
      this.view.flxProducts.isVisible = false;
      dismissLoading();
      this.resumeNavigation();
      return;
    }
    const cart = shoppingCart;
    let removeImage = "cartremoveitem.png";
    let count = 0;

    const data = cart.map(element =>{
      count++;
      return {"Name":element.Name,
              "Price":element.Price,
              "OnSale":element.onSale,
              "IsNew":element.IsNew,
              "RemoveImage": removeImage,
              "Index":count};
    });

    let currentIndex;
    let IsThereNew = false;

    for(let item=0; item<data.length;item++){
      if(data[item].OnSale == "true"){
        data[item].Price = {text: data[item].Price,
                            skin: "sknOnSalelbl"};
      }
      if(data[item].IsNew == "true"){
        IsThereNew = true;
      }
      currentIndex = data[item].Index;
      data[item].Index = {onClick:this.moveItemToLeftAnimation};
    }

    if(IsThereNew){
      this.view.lblItemIsNew.text = `You have items that are New. Shipping may be delayed.`;
    }else{
      this.view.lblItemIsNew.text = `Normal Shipping Schedule.`;
    }

    this.view.segProducts.widgetDataMap = {lblName: "Name",
                                           lblPrice:"Price",
                                           imgRemove: "RemoveImage",
                                           btnRemove:"Index",
                                          };
    this.view.segProducts.setData(data);
    this.view.lblTotalDetails.text = `$ ${this.updateTotal()}`;

    dismissLoading();
    this.resumeNavigation();
  },

  updateTotal: function(){
    let total = shoppingCart.reduce((currentTotal, item) => {
      return currentTotal += parseFloat(item.Price);
    }, 0);
    let roundedTotal = Math.round((total * 100)+ Number.EPSILON) / 100;
    return roundedTotal;
  },

  removeItem: function(){
    let selectIndex = this.indexChosen.row;
    shoppingCart.splice(selectIndex, 1);
    this.mapData();
  },

  StartHamburgherAnimation: function(){
    StartHamburgherAnimation(this.view.flxShoppingCart, this.view.HamburgherMenu);
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxShoppingCart, this.view.HamburgherMenu);
  },

  indexChosen:{section:null,
               row:null},

  moveItemToLeftAnimation: function(){
    let selectedRow = this.view.segProducts.selectedIndices;
    this.indexChosen.section = selectedRow[0][0];
    this.indexChosen.row = selectedRow[0][1][0];

    this.disableButtons();
    this.animationTotalPriceFirstRound();
    this.segProductAnimation();
  },

  segProductAnimation:function(){
    let currentOrientation = kony.os.getDeviceCurrentOrientation();
    let transformObject;

    if (currentOrientation == constants.DEVICE_ORIENTATION_PORTRAIT) {
      transformObject = kony.ui.makeAffineTransform();
      transformObject.translate(500, 0);
    } else if (currentOrientation == constants.DEVICE_ORIENTATION_LANDSCAPE) {
      transformObject = kony.ui.makeAffineTransform();
      transformObject.translate(900, 0);
    } else {
      alert("Device doesn't support Orientation Change.");
    }

    let animationObj ={ 
      100: { 
        transform: transformObject
      }
    };

    let animationConfig = {
      duration: 0.5,
      fillMode: kony.anim.FILL_MODE_FORWARDS,
    };

    let animationCallbacks = {animationEnd:this.moveRestOfItemsUpwardAnimation};

    let sectionIndex = this.indexChosen.section;
    let rowIndex = this.indexChosen.row;
    let rowInfo={
      sectionIndex:sectionIndex,
      rowIndex:rowIndex
    };

    let animationDef = kony.ui.createAnimation(animationObj);

    this.view.segProducts.animateRows({
      rows:[rowInfo],
      widgets: null,
      animation:{
        definition: animationDef,
        config: animationConfig,
        callbacks: animationCallbacks
      }
    });

  },

  moveRestOfItemsUpwardAnimation: function(){
    let transformObject = kony.ui.makeAffineTransform();
    transformObject.translate(0, -70);

    let animationObj = kony.ui.createAnimation({ 
      100: { 
        "transform": transformObject,"stepConfig":{"timingFunction":kony.anim.LINEAR}
      }
    });
    let animationConfig = {
      "duration": 1,
      "fillMode": kony.anim.FILL_MODE_FORWARDS,
      "delay": 0
    };
    let animationCallbacks = {animationEnd:this.removeItem};

    let rowsInfo = [];
    let sectionIndex = this.indexChosen.section;
    let chosenIndex = this.indexChosen.row;
    let rowIndex;
    let cartLength = shoppingCart.length;
    let highestIndex = cartLength-1;
    let restOfIndexes = highestIndex - chosenIndex;
    for(highestIndex; highestIndex>chosenIndex;highestIndex--){
      rowIndex = highestIndex;
      let singleRow = {"sectionIndex":sectionIndex,
                       "rowIndex":rowIndex};
      rowsInfo.push(singleRow);
    }


    if(!rowsInfo.length){
      this.wait(1000);
      this.removeItem();
    }else{
      this.view.segProducts.animateRows({
        rows:rowsInfo,
        widgets: null,
        animation:{
          definition:animationObj,
          config:animationConfig,
          callbacks:animationCallbacks
        }
      });
    }

  },

  wait: function(ms){
    let start = new Date().getTime();
    let end = start;
    while(end < start + ms) {
      end = new Date().getTime();
    }
  },

  animationTotalPriceFirstRound: function(){
    let transformObject = kony.ui.makeAffineTransform();
    transformObject.scale(0.01, 1);
    let transformObject1 = kony.ui.makeAffineTransform();
    transformObject1.scale(1, 1);

    let animationObj = kony.ui.createAnimation({ 
      0:{
        "transform": transformObject1,"stepConfig":{"timingFunction":kony.anim.LINEAR}
      },
      100: { 
        "transform": transformObject,"stepConfig":{"timingFunction":kony.anim.LINEAR}
      }
    });
    let animationConfig = {
      "duration": 1.5,
      "fillMode": kony.anim.FILL_MODE_FORWARDS,
      "delay": 0,
      "iterationCount": 1,
      "direction": kony.anim.DIRECTION_NONE
    };
    let animationCallbacks = {"animationEnd":this.animationTotalPriceSecondRound};

    this.view.lblTotalDetails.animate(animationObj, animationConfig, animationCallbacks);
  },

  animationTotalPriceSecondRound: function(){
    var transformObject = kony.ui.makeAffineTransform();
    transformObject.scale(1, 1);

    let animationObj = kony.ui.createAnimation({ 
      100: { 
        "transform": transformObject,"stepConfig":{"timingFunction":kony.anim.LINEAR}
      }
    });
    let animationConfig = {
      "duration": 0.25,
      "fillMode": kony.anim.FILL_MODE_FORWARDS,
      "delay": 0,
      "iterationCount": 1,
      "direction": kony.anim.DIRECTION_NONE
    };
    let animationCallbacks = {"animationEnd":this.enableButtons};

    this.view.lblTotalDetails.animate(animationObj, animationConfig, animationCallbacks);
  },

  idleTimeOut: function(){
    kony.application.registerForIdleTimeout(2, this.navigateHome);
  },

  navigateHome: function(){
    cache = [];
    addedText = [];
    kony.application.destroyForm("frmHome");
    navigateTo("frmHome");
  },

  enableButtons: function(){
    this.view.flxShoppingCart.setEnabled(true);
    this.view.TopBar.setEnabled(true);
    this.view.TopBar.flxBackImage.setEnabled(true);
  },

  disableButtons: function(){
    this.view.flxShoppingCart.setEnabled(false);
    this.view.TopBar.setEnabled(false);
    this.view.TopBar.flxBackImage.setEnabled(false);
  },

  menuNavigation: function(info){
    this.view.flxShoppingCart.setEnabled(false);
    selectTab(info, this.view.flxShoppingCart, this.view.HamburgherMenu);
  },

  orientationChange:function(){
    orientationChange(this.view.HamburgherMenu,this.view.TopBar, this.view.flxCart);
  }
});