function showLoading(){
  kony.application.showLoadingScreen(null, "Loading",
                                     constants.LOADING_SCREEN_POSITION_ONLY_CENTER, true, true, {});
}

function dismissLoading(){
  kony.application.dismissLoadingScreen();
}

function navigateTo(form, sentInfo){
  var nav = new kony.mvc.Navigation(form);
  nav.navigate(sentInfo || null);
}

function isEmptyOrSpaces(txt){
  return !txt || txt.trim() === "";
}

function isValidCharacters(search){
  const acceptedRegexCharacters = /^[a-zA-Z0-9 ]*$/;

  if(isEmptyOrSpaces(search)){
    alert("Cannot be Empty.");
    return false;
  }
  if(!acceptedRegexCharacters.test(search)){
    alert("Cannot have Special Characters.");
    return false;
  }
  return true;
}

function selectTab(info, mainContainer, HamburgherContainer){
  let currentForm = kony.application.getCurrentForm().id;
  let selectedFlx = info.id;
  switch(selectedFlx){
    case "flxHome":
      if(currentForm != "frmHome"){
        EndHamburgherAnimation(mainContainer, HamburgherContainer, navigateHome);
      }
      break;
    case "flxStores":
      if(currentForm != "frmStoreLocator"){
        EndHamburgherAnimation(mainContainer, HamburgherContainer, navigateStores);
      }
      break;
    case "flxCart":
      if(currentForm != "frmShoppingCart"){
        EndHamburgherAnimation(mainContainer, HamburgherContainer, navigateCart);
      }
      break;
  }
}

function navigateHome(){
  cache = [];
  addedText = [];
  kony.application.destroyForm("frmHome");
  navigateTo("frmHome");
}

function navigateStores(){
  kony.application.destroyForm("frmStoreLocator");
  navigateTo("frmStoreLocator");
}

function navigateCart(){
  kony.application.destroyForm("frmShoppingCart");
  navigateTo("frmShoppingCart");
}

function orientationChange(Hamburgher, TopBar, MainFlex){
  let currentOrientation = kony.os.getDeviceCurrentOrientation();

  if (currentOrientation == constants.DEVICE_ORIENTATION_PORTRAIT) {
    TopBar.height = "8%";
    MainFlex.height = "92%";
    Hamburgher.flxHome.height = "10%";
    Hamburgher.flxStores.height = "10%";
    Hamburgher.flxCart.height = "10%";
  } else if (currentOrientation == constants.DEVICE_ORIENTATION_LANDSCAPE) {
    TopBar.height = "12%";
    MainFlex.height = "88%";
    Hamburgher.flxHome.height = "14%";
    Hamburgher.flxStores.height = "14%";
    Hamburgher.flxCart.height = "14%";
  } else {
    alert("Device doesn't support Orientation Change.");
  }
}