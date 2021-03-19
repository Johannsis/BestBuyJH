define({ 

  cart: [],

  imageCollection: {images:null},

  onNavigate: function(context){
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.flxProductDetails.setEnabled(true);
    this.view.imgArrowUp.src = "uparrowm.png";
    this.view.imgArrowDown.src = "downarrowm.png";
    if(context === null)return;
    this.pauseNavigation();
    const { Name, Price, onSale, Image, CustomerReviewAvg, Description, ReviewCount, SKU, ImageCollection, IsNew } = context;
    this.view.TopBar.flxSearchImage.isVisible = false;
    this.view.TopBar.flxBackImage.isVisible = true;
    this.view.flxNoReviews.isVisible = false;
    this.view.flxProductReview.isVisible = true;
    this.view.TopBar.flxBackImage.onTouchEnd = this.navigateToPreviousForm;
    this.view.imgProduct.src = Image;
    if(Description !== ""){
      this.view.lblDescription.text = Description;
    }else{
      this.view.lblDescription.text = `There's no description for this product.`;
    }
    this.view.lblName.text = Name;
    if(onSale == "true"){
      this.view.lblPrice.text =`On Sale! $${Price}`;
    }else{
      this.view.lblPrice.text = `$${Price}`;
    }
    if(CustomerReviewAvg !== ""){
      this.view.lblAvgReview.text = `Avg review: ${CustomerReviewAvg}`;
    }else{
      this.view.lblAvgReview.text = "";
    }
    this.view.lblTotalReviews.text = `${ReviewCount}`;
    this.view.imgStarsReview.src = this.rateImageSelection(CustomerReviewAvg);
    this.getProductReview(SKU);
    this.imageCollection.images = {Image, ImageCollection};
    this.view.imgArrowUp.onTouchEnd = this.reviewOpenAnimation;
    this.view.imgArrowDown.onTouchEnd = this.reviewCloseAnimation;
    this.view.lblMore.onTouchEnd = this.navigateToImages;
    cart = {Name, Price, onSale, IsNew};
    this.view.btnAddToCart.onClick = this.addToCart;
  },

  getProductReview: function(SKU){
    showLoading();

    operationName =  "getProductReviews";
    data= {"SKU": SKU};
    headers= {};
    integrationObj.invokeOperation(operationName, headers, data, this.getProductReviewSuccess, this.getProductReviewFailure);
  },

  getProductReviewSuccess: function(res){
    this.mapReviewData(res);
  },

  getProductReviewFailure: function(res){
    dismissLoading();
    this.resumeNavigation();
    alert("Failure");
    alert(JSON.stringify(res));
  },

  mapReviewData: function(res){
    const review = res.reviews;
    if(!review.length){
      this.view.flxNoReviews.isVisible = true;
      this.view.flxProductReview.isVisible = false;
    }

    let reviewImage;

    const data = review.map(element =>{
      reviewImage = this.rateImageSelection(element.rating);

      return {"Reviewer":`submitted by: ${element.name}`,
              "Rating":reviewImage,
              "Comment":element.comment,
              "Title":element.title};
    });

    this.view.segReview.widgetDataMap = {lblTitle: "Title",
                                         lblSubmitBy: "Reviewer",
                                         imgRating: "Rating",
                                         lblComment: "Comment"};
    this.view.segReview.setData(data);
    dismissLoading();
    this.resumeNavigation();
  },

  addToCart: function(){
    shoppingCart.push(cart);
    alert("Item Added to the Cart");
  },

  rateImageSelection:function(customerAvg){
    let roundedReviewNumber = Math.round(customerAvg);
    switch(roundedReviewNumber){
      case 5:
        return "ratings_star_5.png";
      case 4: 
        return "ratings_star_4.png";
      case 3 : 
        return "ratings_star_3.png";
      case 2: 
        return "ratings_star_2.png";
      case 1: 
        return "ratings_star_1.png";
    }
  },

  navigateToPreviousForm: function(){
    navigateTo("frmProductList");
  },

  navigateToImages: function(){
    navigateTo("frmProductImages", this.imageCollection.images);
  },

  StartHamburgherAnimation:function(){
    StartHamburgherAnimation(this.view.flxProductDetails, this.view.HamburgherMenu);
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxProductDetails, this.view.HamburgherMenu);
  },

  reviewOpenAnimation: function(){
    let self = this;
    let animationObj = kony.ui.createAnimation(
      {"0":{"top":"77%","stepConfig":{"timingFunction":kony.anim.LINEAR}},
       "100":{"top":"0%","stepConfig":{"timingFunction":kony.anim.LINEAR}}});
    let animationConfig = {
      duration: 0.25,
      fillMode: kony.anim.FILL_MODE_FORWARDS,
      delay: 0
    };   
    let animationCallbacks = {"animationEnd":function(){
      self.view.flxIconClosed.isVisible = false;
      self.view.flxIcon.isVisible = true;
    }};

    this.view.flxReviews.animate(animationObj, animationConfig, animationCallbacks);
  },

  reviewCloseAnimation: function(){
    let self = this;
    let animationObj = kony.ui.createAnimation(
      {"0":{"top":"0%","stepConfig":{"timingFunction":kony.anim.LINEAR}},
       "100":{"top":"77%","stepConfig":{"timingFunction":kony.anim.LINEAR}}});
    let animationConfig = {
      duration: 0.25,
      fillMode: kony.anim.FILL_MODE_FORWARDS,
      delay: 0
    };   
    let animationCallbacks = {"animationEnd":function(){
      self.view.flxIconClosed.isVisible = true;
      self.view.flxIcon.isVisible = false;
    }};

    this.view.flxReviews.animate(animationObj, animationConfig, animationCallbacks);
  },

  menuNavigation: function(info){
    this.view.flxProductDetails.setEnabled(false);
    selectTab(info, this.view.flxProductDetails, this.view.HamburgherMenu);
  }
});