'use strict';

const π = Math.PI;
const π2 = 2*π;
const π_hf = 0.5*π; //½π

//获取-1~1之间随机数
function RandomClamped(){
    let r1 = Math.floor(Math.random()*100)%2;
    let r2 = Math.random();

    return (r1==1?-1:1)*r2;
}

//获取event中的
function GetEventPosition(event) {
    var x, y;
    if (event.type.indexOf("touch") != -1) {
        try {
            var touch = event.changedTouches[0];
            y = touch.pageY;
            x = touch.pageX;
        } catch (e) {
            console.error(event, e);
        }
    } else {
        if (event.offsetX || event.offsetX == 0) {
            x = event.offsetX;
            y = event.offsetY;
        } else {
            console.error("获取鼠标坐标失败！");
        }
    }
    return new Vector2D(x, y);
}

//加载文件
function  LoadResources({
        method="POST",async=true,data=null,type="json",url="",
        success=e=>{},error=e=>{},ontimeout=e=>{},onprogress=e=>{},onuprogress=e=>{}
    }) {

    let dataType = type;
    //扩展资源类型
    if(type == "image" || type == "video"){
         method = "GET";
         type = "blob";
    }else if (type == "config"){
        method = "GET";
        type = "json";
    }

    let xhr = new XMLHttpRequest();
    xhr.open(method,url,async);

    if(async) xhr.responseType = type;
    xhr.setRequestHeader("Content-type","application/x-www-four-urlencoded;charset=UTF-8");
    xhr.onload = function(e) {
        if(this.status == 200||this.status == 304){
            //alert(this.responseText);
            let rsp = this.response;
            if(!async && type == "json") rsp = JSON.parse(rsp);
            else if(dataType == "image"){
                rsp = new Image();
                rsp.src = window.URL.createObjectURL(this.response);
                rsp.onload = e => window.URL.revokeObjectURL(rsp.src);

            }else if(dataType == "video"){
                rsp = document.createElement("video");
                rsp.src = window.URL.createObjectURL(this.response);
                rsp.onload = e => window.URL.revokeObjectURL(rsp.src);
            }
            success.call(this,rsp);
        }
    };
    xhr.ontimeout = ontimeout;
    xhr.onerror = error;
    xhr.upload.onprogress = onuprogress;
    xhr.onprogress =function (e) {
        onprogress.call(this,e.total,e.loaded);
    };

    try{
        xhr.send(data);
    }catch (e){
        error.call(this,e);
    }

}