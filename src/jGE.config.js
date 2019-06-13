
//用于获取基本配置
//TODO: 合并为默认参数 取消本文件
function GetConfig() {
    let config={
        id:"jGE_"+Math.random()*100,dom:null,
        width:1280,height:640,
        fps:30,
        isRoundWorld:true,
        keyHandler:function (event) {}
    };

    return config;
}