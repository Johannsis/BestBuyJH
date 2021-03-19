define({ 

  onNavigate: function(context){
    this.view.onOrientationChange = this.orientationChange;
    this.orientationChange();
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.flxProductImages.setEnabled(true);
    this.mapData(context);
    this.view.TopBar.flxSearchImage.isVisible = false;
    this.view.TopBar.flxBackImage.isVisible = true;
    this.view.TopBar.imgBack.onTouchEnd = this.navigateBack;
  },

  mapData: function(context){
    let { Image, ImageCollection } = context;
    let data = ImageCollection.map(element => {
      return {"Image":element.href};
    });
    data.unshift({"Image":Image});
    
    this.view.segImages.widgetDataMap = {imgProduct: "Image"};
    this.view.segImages.setData(data);
  },

  navigateBack: function(){
    navigateTo("frmProductDetails");
  },

  StartHamburgherAnimation:function(){
    StartHamburgherAnimation(this.view.flxProductImages, this.view.HamburgherMenu);
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxProductImages, this.view.HamburgherMenu);
  },
  
  menuNavigation: function(info){
    this.view.flxProductImages.setEnabled(false);
    selectTab(info, this.view.flxProductImages, this.view.HamburgherMenu);
  },
  
  orientationChange:function(){
    orientationChange(this.view.HamburgherMenu, this.view.TopBar, this.view.flxImageContainer);
  }
});