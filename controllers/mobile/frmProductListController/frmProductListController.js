define({ 

  infoList: {ID:null,
             TextName:null,
             Option:null,
             Page:null
            },

  newDataListBox: {New:null},

  onNavigate(context){
    this.defaultConfiguration();

    if(context === null)return;
    this.newDataListBox.New = true;
    this.view.lstboxPages.selectedKey = "1";
    this.view.lstboxPages.placeholder = "1";
    showLoading();
    this.pauseNavigation();
    this.view.flxProductList.isVisible = true;
    this.view.flxNoProductsMessage.isVisible = false;
    const { ID, TextName, Option } = context;

    this.infoList= {ID:ID,
                    TextName:TextName,
                    Option:Option,
                    Page:1
                   };

    if(context.ID !== null){
      this.getProductsForCategory(ID);
      this.view.lblResultType.text = `Category: ${TextName}`;
    }else{
      this.getProductsBySearch(TextName, Option);
      this.view.lblResultType.text = `Results for: ${TextName}`;
    }
  },

  getProductsForCategory: function(productID, page){
    showLoading();
    operationName =  "getProductsForCategory";
    data= {"ID": productID,"pageSize": "10","page": page || 1};
    headers= {};
    integrationObj.invokeOperation(operationName, headers, data, this.getProductsForCategorySuccess, this.getProductsForCategoryFailure);
  },

  getProductsForCategorySuccess: function(res){
    this.mapData(res);
  },

  getProductsForCategoryFailure: function(res){
    dismissLoading();
    this.resumeNavigation();
    alert("Failure");
    alert(JSON.stringify(res));
  },

  getProductsBySearch: function(search, option, page){
    showLoading();

    if(option == "null"){
      option = "";
    }
    operationName =  "getProductsBySearch";
    data= {"search": search,"pageSize": "10","page": page || 1,"option": option};
    headers= {};
    integrationObj.invokeOperation(operationName, headers, data, this.getProductsBySearchSuccess, this.getProductsBySearchFailure);
  },

  getProductsBySearchSuccess: function(res){
    this.mapData(res);
  },

  getProductsBySearchFailure: function(res){
    dismissLoading();
    this.resumeNavigation();
    alert("Failure");
    alert(JSON.stringify(res));
  },

  defaultConfiguration: function(){
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.TopBar.flxSearchImage.isVisible = false;
    this.view.TopBar.flxBackImage.isVisible = true;
    this.view.flxProductListGnrl.setEnabled(true);
    this.view.TopBar.flxBackImage.onTouchEnd = this.navigateToPreviousForm;
    this.view.segProductList.onRowClick = this.onRowSelection;
    this.view.lstboxPages.onSelection = this.setPage;
  },

  mapData: function(res){
    let products = res.products;

    if(!products.length){
      this.view.flxProductList.isVisible = false;
      this.view.flxNoProductsMessage.isVisible = true;
      dismissLoading();
      this.resumeNavigation();
      return;
    }

    let currentShowedPrice;
    let freeShippingBanner;
    let imageSelected;
    let mainImage;
    let imageThumbnail;

    const data = products.map(element => {
      imageThumbnail = element.thumbnailImage;
      mainImage = element.image;
      let imagesContained = element.images;
      let checkOnSale = element.onSale;
      let freeShippingAvailable = element.freeShipping;

      if(mainImage !== ""){
        imageSelected = mainImage;
      }else if(imageThumbnail !== ""){
        imageSelected = imageThumbnail;
      }else{
        const findMainImage = imagesContained.find((image) =>{
          return image.primary == "true";
        });
        if( findMainImage != null){
          imageSelected = findMainImage.href;
        } 
      }

      if(checkOnSale == "true"){
        currentShowedPrice = element.salePrice;
      }else currentShowedPrice = element.regularPrice;

      return {"Name":element.name,
              "PriceForList": `$ `+currentShowedPrice,
              "Price":currentShowedPrice,
              "onSale":element.onSale,
              "Image":imageSelected,
              "CustomerReviewAvgForList":`Avg User Rating: `+element.customerReviewAverage,
              "CustomerReviewAvg":element.customerReviewAverage,
              "FreeShippingAvailable":freeShippingAvailable,
              "Description":element.longDescription,
              "ReviewCount":element.customerReviewCount,
              "SKU":element.sku,
              "ImageCollection":element.images,
              "IsNew":element.new
             };
    });

    for(let item=0; item<data.length;item++){
      if(data[item].onSale == "true"){
        data[item].PriceForList = {text: data[item].PriceForList,
                                   skin: "sknOnSalelbl"};
      }
      if(data[item].CustomerReviewAvg === ""){
        data[item].CustomerReviewAvgForList = "";
      }
      if(data[item].FreeShippingAvailable == "true"){
        data[item].FreeShippingAvailable = {isVisible:true};
      }else{
        data[item].FreeShippingAvailable = {isVisible:false};
      }
    }
    

    this.view.segProductList.widgetDataMap = {imgProductThumbnail: "Image",
                                              lblProductName: "Name",
                                              lblProductPrice: "PriceForList",
                                              lblProductRating: "CustomerReviewAvgForList",
                                              lblFreeShipping: "FreeShippingAvailable"
                                             };
    this.view.segProductList.setData(data);

    this.updatePage(res);

    setSegmentAnimation(this.view.segProductList);

    dismissLoading();
    this.resumeNavigation();
  },

  navigateToPreviousForm: function(){
    navigateTo("frmHome", null);
  },

  onRowSelection: function(){
    let selectRow = this.view.segProductList.selectedRowItems[0];
    kony.application.destroyForm("frmProductDetails");
    navigateTo("frmProductDetails" ,selectRow);
  },

  StartHamburgherAnimation:function(){
    StartHamburgherAnimation(this.view.flxProductListGnrl, this.view.HamburgherMenu);
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxProductListGnrl, this.view.HamburgherMenu);
  },

  updatePage: function(pageData){
    this.view.lstboxPages.isVisible = true;
    const { totalPages, currentPage } = pageData;
    if(totalPages == "1"){
      this.view.lstboxPages.isVisible = false;
    }
    this.view.lblPages.text = `Page ${currentPage} of ${totalPages}`;

    let dataList = [];

    for(let i=1;i<=totalPages;i++){
      let currentData = [i.toString(), i.toString()];
      dataList.push(currentData);
    }

    if(this.newDataListBox.New === true){
      this.view.lstboxPages.masterData = dataList;
      this.newDataListBox.New = false;
    }
  },

  setPage: function(){
    let pageSelected = this.view.lstboxPages.selectedKeyValue[0];
    this.infoList.Page = pageSelected;

    const { ID, TextName, Option, Page } = this.infoList;

    if(this.infoList.ID !== null){
      this.getProductsForCategory(ID, Page);
    }else{
      this.getProductsBySearch(TextName, Option, Page);
    }
  },

  menuNavigation: function(info){
    this.view.flxProductListGnrl.setEnabled(false);
    selectTab(info, this.view.flxProductListGnrl, this.view.HamburgherMenu);
  }
});