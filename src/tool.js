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
            y = Math.floor( touch.pageY);
            x = Math.floor(touch.pageX);
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
