define({ 

  cart: [],

  imageCollection: {images:null},
  context: null,

  onNavigate: function(context){
    this.context = context;
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.onOrientationChange = this.orientationChange;
    this.orientationChange();
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
      {"0":{"top":this.currentTop,"stepConfig":{"timingFunction":kony.anim.LINEAR}},
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
       "100":{"top":this.currentTop,"stepConfig":{"timingFunction":kony.anim.LINEAR}}});
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
  },
  
  currentTop: null,
  currentBottom: null,

  orientationChange:function(){
    orientationChange(this.view.HamburgherMenu, this.view.TopBar, this.view.flxProductDetail);

    let currentOrientation = kony.os.getDeviceCurrentOrientation();

    if (currentOrientation == constants.DEVICE_ORIENTATION_PORTRAIT) {
      if(this.view.flxIconClosed.isVisible){
        this.view.flxReviews.top = "78%";
      }
      this.view.flxProductReview.height = "51%";
      this.view.flxNoReviews.height = "51%";
      this.view.flxProduct.height = "50%";
      this.view.flxReview.height = "70%";
      this.view.flxImageAndNames.height = "50%";
      this.view.imgProduct.top = "15dp";
      this.view.imgProduct.bottom = "5dp";
      this.view.imgProduct.width = "100dp";
      this.view.imgProduct.height = "100dp";
      this.view.flxDescription.height = "30%";
      this.view.btnAddToCart.height = "40dp";
      this.view.lblName.bottom = "10dp";
      this.view.lblPrice.bottom = "10dp";
      this.view.lblAvgReview.bottom = "10dp";
      this.view.lblNumberOfReviews.top = "10dp";
      this.view.lblNumberOfReviews.bottom = "10dp";
      this.view.lblTotalReviews.top = "10dp";
      this.view.lblTotalReviews.bottom = "10dp";
      this.view.flxIcon.height = "40dp";
      this.view.flxIconClosed.height = "40dp";
      this.currentTop = "78%";
    } else if (currentOrientation == constants.DEVICE_ORIENTATION_LANDSCAPE) {
      if(this.view.flxIconClosed.isVisible){
        this.view.flxReviews.top = "57%";
      }
      this.view.flxProductReview.height = "41%";
      this.view.flxNoReviews.height = "41%";
      this.view.flxProduct.height = "60%";
      this.view.flxReview.height = "55%";
      this.view.flxImageAndNames.height = "60%";
      this.view.imgProduct.top = "3dp";
      this.view.imgProduct.bottom = "3dp";
      this.view.imgProduct.width = "75dp";
      this.view.imgProduct.height = "75dp";
      this.view.flxDescription.height = "20%";
      this.view.btnAddToCart.height = "30dp";
      this.view.lblName.bottom = "3dp";
      this.view.lblPrice.bottom = "3dp";
      this.view.lblAvgReview.bottom = "3dp";
      this.view.lblNumberOfReviews.top = "3dp";
      this.view.lblNumberOfReviews.bottom = "3dp";
      this.view.lblTotalReviews.top = "3dp";
      this.view.lblTotalReviews.bottom = "3dp";
      this.view.flxIcon.height = "30dp";
      this.view.flxIconClosed.height = "30dp";
      this.currentTop = "57%";
    } else {
      alert("Device doesn't support Orientation Change.");
    }
  }

});