serviceName = "BestBuyJH";
integrationObj = KNYMobileFabric.getIntegrationService(serviceName);

define({ 

  currentCategory: {Category: null},
  nextInBreadCrumb: {text:null},

  onNavigate: function(){
    this.pauseNavigation();
    this.defaultConfiguration();

    // Getting the information from the cache.
    if(cache.length){
      this.getInCache();
      return;
    }

    //Default home screen view
    this.view.lblBreadCrumb.text = "Home";
    this.view.TopBar.flxBackImage.isVisible = false;
    this.getCategory();
  },

  getCategory: function(idProduct){  
    showLoading();
    this.disableScreenButtons();

    operationName =  "getCategory";
    data= {"ID": idProduct || "cat00000"};
    headers= {};
    integrationObj.invokeOperation(operationName, headers, data, this.getCategorySuccess, this.getCategoryFailure);
  },

  getCategorySuccess: function(res){
    this.mapData(res);
  },

  getCategoryFailure: function(res){
    dismissLoading();
    this.resumeNavigation();
    this.enableScreenButtons();
    alert("Failure");
    alert(JSON.stringify(res));
  },

  defaultConfiguration: function(){
    this.view.SearchBar.flxSearchBar.isVisible = false;
    this.view.SearchBar.zIndex = 1;
    this.enableScreenButtons();
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onClick = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = function(){};
    this.view.HamburgherMenu.flxStores.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.TopBar.imgSearch.onTouchEnd = this.StartSearchAnimation;
    this.view.SearchBar.btnCancel.onClick = this.EndSearchAnimation;
    this.view.segCategories.onRowClick = this.onRowCategorySelect;
    this.view.TopBar.flxBackImage.onClick = this.goBack;
    this.view.SearchBar.txtSearch.onDone = this.getInfoFromSearch;
    this.view.SearchBar.flxSearchBar.isVisible = false;
  },

  deleteEntry: function(){
    this.nextInBreadCrumb.text = null;
    cache.pop();
  },

  mapData: function(res){
    let categories = res.subCategories;

    if(categories == null || !categories.length){
      alert("This entry doesn't have any products.");
      this.deleteEntry();
      dismissLoading();
      this.resumeNavigation();
      this.enableScreenButtons();
      return;
    }

    if(this.nextInBreadCrumb.text !== null){
      this.view.TopBar.flxBackImage.isVisible = true;
      this.view.lblBreadCrumb.text += ` >> ${this.nextInBreadCrumb.text}`;
      addedText.push(` >> ${this.nextInBreadCrumb.text}`);
    }
    this.nextInBreadCrumb.text = null;

    const data = categories.map((element) => {
      return {
        "Name": element.name,
        "ID": element.id
      };
    });

    this.view.segCategories.widgetDataMap = {lblCategory: "Name"};
    this.view.segCategories.setData(data);

    this.currentCategory.Category = res;
    dismissLoading();
    this.resumeNavigation();
    this.enableScreenButtons();
    setSegmentAnimation(this.view.segCategories);
  },

  saveInCache: function(info){
    cache.push(info);
  },

  getInCache: function(){
    let previousCategory = cache.pop();
    this.mapData(previousCategory);
  },

  onRowCategorySelect: function(){
    showLoading();
    this.disableScreenButtons();

    let selectedRow = this.view.segCategories.selectedRowItems[0];
    this.saveInCache(this.currentCategory.Category);
    let currentText = this.view.lblBreadCrumb.text;
    let countedSelections = (currentText.match(/>>/g) || []).length;
    if(countedSelections == 2){
      let byCategory = {ID: selectedRow.ID,
                        TextName:selectedRow.Name,
                        Option:null};
      kony.application.destroyForm("frmProductList");
      navigateTo("frmProductList", byCategory);
      return;
    }

    this.nextInBreadCrumb.text = selectedRow.Name;

    this.getCategory(selectedRow.ID);
  },

  goBack: function(){
    this.deleteBreadCumbText();
    this.getInCache();
  },

  deleteBreadCumbText: function(){
    let currentText = this.view.lblBreadCrumb.text;
    let previousText = currentText.replace(addedText.pop(), "");
    this.view.lblBreadCrumb.text = previousText;
    if(this.view.lblBreadCrumb.text == "Home"){
      this.view.TopBar.flxBackImage.isVisible = false;
    }
  },

  disableScreenButtons: function(){
    this.view.flxHomeContainer.setEnabled(false);
    this.view.segCategories.setEnabled(false);
    this.view.TopBar.flxBackImage.setEnabled(false);
    this.view.TopBar.imgHambugherMenu.setEnabled(false);
  },

  enableScreenButtons: function(){
    this.view.flxHomeContainer.setEnabled(true);
    this.view.segCategories.setEnabled(true);
    this.view.TopBar.flxBackImage.setEnabled(true);
    this.view.TopBar.imgHambugherMenu.setEnabled(true);
  },

  StartHamburgherAnimation: function(){
    StartHamburgherAnimation(this.view.flxHomeContainer, this.view.HamburgherMenu, this.disableScreenButtons());
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxHomeContainer, this.view.HamburgherMenu, this.enableScreenButtons());
  },

  StartSearchAnimation:function(){
    this.searchDisable();
    let animationObj = kony.ui.createAnimation(
      {"0":{"top":"100%","stepConfig":{"timingFunction":kony.anim.LINEAR}},
       "100":{"top":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}}});
    let animationConfig = {
      duration: 0.25,
      fillMode: kony.anim.FILL_MODE_FORWARDS,
      delay: 0
    };   
    let animationCallbacks = {"animationEnd":function(){}};

    this.view.SearchBar.flxSearchBar.animate(animationObj, animationConfig, animationCallbacks);
  },

  EndSearchAnimation:function(){
    let animationObj = kony.ui.createAnimation(
      {"0":{"top":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}},
       "100":{"top":"100%","stepConfig":{"timingFunction":kony.anim.LINEAR}}});
    let animationConfig = {
      duration: 0.25,
      fillMode: kony.anim.FILL_MODE_FORWARDS,
      delay: 0
    };   
    let animationCallbacks = {"animationEnd":this.searchEnable};

    this.view.SearchBar.flxSearchBar.animate(animationObj, animationConfig, animationCallbacks);
  },

  searchDisable:function(){
    this.disableScreenButtons();
    this.view.SearchBar.flxSearchBar.isVisible = true;
    this.view.SearchBar.zIndex = 10;
  },

  searchEnable(){
    this.view.SearchBar.flxSearchBar.isVisible = false;
    this.view.SearchBar.zIndex = 1;
    this.enableScreenButtons();
  },

  getInfoFromSearch: function(){
    let currentText = this.view.SearchBar.txtSearch.text;
    if(!isValidCharacters(currentText)){
      return;
    }
    let optionType = this.view.SearchBar.lstbxFilterBy.selectedKeyValue[0];

    let bySearch = {ID: null,
                    TextName:currentText.trim(),
                    Option:optionType};

    cache=[];
    addedText=[];
    this.view.SearchBar.lstbxFilterBy.selectedKey = "null";
    this.view.lblBreadCrumb.text = "Home";
    this.view.SearchBar.txtSearch.text = "";
    this.view.SearchBar.flxSearchBar.isVisible = false;
    this.view.SearchBar.zIndex = 1;

    kony.application.destroyForm("frmProductList");
    navigateTo("frmProductList", bySearch);
  },

  menuNavigation: function(info){
    this.disableScreenButtons();
    selectTab(info, this.view.flxHomeContainer, this.view.HamburgherMenu);
  }
});