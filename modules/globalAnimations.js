function setSegmentAnimation(widget){
  let transformObject1 = kony.ui.makeAffineTransform();
  let transformObject2 = kony.ui.makeAffineTransform();
  let deviceWidth = kony.os.deviceInfo().screenWidth;
  transformObject1.translate(deviceWidth, 0);
  transformObject2.translate(0, 0);
  let animationObj = kony.ui.createAnimation(
    {"0":{"transform":transformObject1,"stepConfig":{"timingFunction":kony.anim.LINEAR}},
     "100":{"transform":transformObject2,"stepConfig":{"timingFunction":kony.anim.LINEAR}}});
  let animationConfig = {
    duration: 0.25,
    fillMode: kony.anim.FILL_MODE_FORWARDS,
    delay: 0
  };    
  let animationCallbacks = {"animationEnd":function(){}};
  let animationDefObject={definition:animationObj,config:animationConfig,callbacks:animationCallbacks};

  widget.setAnimations({visible:animationDefObject});
}

function StartHamburgherAnimation(widget, hamburgherWidget, callback){
  hamburgherWidget.zIndex = 10;

  let animationObj = kony.ui.createAnimation(
    {"0":{"left":"-100%","stepConfig":{"timingFunction":kony.anim.LINEAR}},
     "100":{"left":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}}});
  let animationConfig = {
    duration: 0.25,
    fillMode: kony.anim.FILL_MODE_FORWARDS,
    delay: 0
  };   
  let animationCallbacks = {"animationEnd":function(){}};

  let animationObj1 = kony.ui.createAnimation(
    {"0":{"left":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}},
     "100":{"left":"80%","stepConfig":{"timingFunction":kony.anim.LINEAR}}});
  let animationConfig1 = {
    duration: 0.25,
    fillMode: kony.anim.FILL_MODE_FORWARDS,
    delay: 0
  };   
  let animationCallbacks1 = {"animationEnd":callback || function(){}};

  widget.animate(animationObj1, animationConfig1, animationCallbacks1);
  hamburgherWidget.flxMainHamburgher.animate(animationObj, animationConfig, animationCallbacks);
}

function EndHamburgherAnimation(widget, hamburgherWidget, callback){
  hamburgherWidget.zIndex = 1;

  let animationObj = kony.ui.createAnimation(
    {"0":{"left":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}},
     "100":{"left":"-100%","stepConfig":{"timingFunction":kony.anim.LINEAR}}});
  let animationConfig = {
    duration: 0.25,
    fillMode: kony.anim.FILL_MODE_FORWARDS,
    delay: 0
  };   
  let animationCallbacks = {"animationEnd":function(){}};

  let animationObj1 = kony.ui.createAnimation(
    {"0":{"left":"80%","stepConfig":{"timingFunction":kony.anim.LINEAR}},
     "100":{"left":0,"stepConfig":{"timingFunction":kony.anim.LINEAR}}});
  let animationConfig1 = {
    duration: 0.25,
    fillMode: kony.anim.FILL_MODE_FORWARDS,
    delay: 0
  };
  let animationCallbacks1 = {"animationEnd":callback || function(){}};

  widget.animate(animationObj1, animationConfig1, animationCallbacks1);
  hamburgherWidget.flxMainHamburgher.animate(animationObj, animationConfig, animationCallbacks);
}