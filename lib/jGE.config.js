'use strict';

//用于获取基本配置
function GetConfig() {
    let config={
        id:"jGE_"+Math.random()*100,dom:null,
        width:700,height:750,
        fps:30,
        isRoundWorld:true,
        keyHandler:function (event) {}
    };

    return config;
}