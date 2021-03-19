define({ 
  onNavigate:function(){
    showLoading();
    this.view.TopBar.imgHambugherMenu.onTouchEnd = this.StartHamburgherAnimation;
    this.view.HamburgherMenu.flxOverlay.onTouchEnd = this.EndHamburgherAnimation;
    this.view.HamburgherMenu.flxHome.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxCart.onClick = this.menuNavigation;
    this.view.HamburgherMenu.flxStores.onClick = function(){};
    this.view.TopBar.flxSearchImage.isVisible = false;
    this.view.flxMap.isVisible = false;
    this.view.flxStoreLocator.setEnabled(true);
    this.view.btnSearch.onClick = this.getStoresAroundCity;
    dismissLoading();
  },

  getStoresAroundCity: function(){
    showLoading();
    let currentText = this.view.txtEnterCity.text;
    if(!isValidCharacters(currentText)){
      dismissLoading();
      return;
    }
    let searchResult = this.adaptText(currentText);

    operationName =  "getStoresAroundCity";
    data= {"city": searchResult};
    headers= {};
    integrationObj.invokeOperation(operationName, headers, data, this.getStoresAroundCitySuccess, this.getStoresAroundCityFailure);
  },

  getStoresAroundCitySuccess:function(res){
    if(!res.stores.length){
      alert("There are no results.");
      this.view.flxMap.isVisible = false;
      dismissLoading();
      return;
    }
    this.view.flxMap.isVisible = true;
    this.mapData(res);
  },

  getStoresAroundCityFailure:function(res){
    dismissLoading();
    alert("Failure");
    alert(JSON.stringify(res));
  },

  adaptText: function(text){
    let currentText = text;
    let lowerCase = text.toLowerCase();
    return lowerCase.trim();
  },

  mapData: function(res){
    let stores = res.stores;

    const data = stores.map(element => {
      return {"Lat":element.lat,
              "Lon":element.lng,
              "Name":element.name,
              "Hours":element.hours,
              "Address":element.address
             };
    });

    let arrayOfLocations = [];

    for(let i=0;i<data.length;i++){
      if(data[i].Lat !== "" && data[i].Lon !== ""){
        let updatedHours;
        if(data[i].Hours !== ""){
          let hours = data[i].Hours;

          let separatedDate = hours.split(";");
          let takenDate = separatedDate.splice(0, 7);
          updatedHours = [...takenDate].join(";");
        }else{
          updatedHours = "Unknown";
        }

        let locationData ={lat:data[i].Lat, lon:data[i].Lon,
                           name:data[i].Name, desc:data[i].Address,
                           showcallout:true,
                           calloutData:{title:data[i].Name,
                                        hours:updatedHours,
                                        address:data[i].Address,
                                        image:"compass.png"}};

        arrayOfLocations.push(locationData);
      }
    }

    this.view.mapCity.widgetDataMapForCallout = {lblTitle:"title",
                                                 lblAddressDetails:"address",
                                                 lblHoursDetails:"hours",
                                                 imgCompass:"image"};

    this.view.mapCity.locationData = arrayOfLocations;
    this.view.mapCity.autoCenterPinOnClick = true;
    dismissLoading();
  },

  StartHamburgherAnimation:function(){
    StartHamburgherAnimation(this.view.flxStoreLocator, this.view.HamburgherMenu);
  },

  EndHamburgherAnimation:function(){
    EndHamburgherAnimation(this.view.flxStoreLocator, this.view.HamburgherMenu);
  },

  menuNavigation: function(info){
    this.view.flxStoreLocator.setEnabled(false);
    selectTab(info, this.view.flxStoreLocator, this.view.HamburgherMenu);
  }
});