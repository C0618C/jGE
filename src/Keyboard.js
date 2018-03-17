/**
 * 键盘：按键管理模块
 */
class Keyboard extends Manager{
    constructor(_jGE){
        super(_jGE,"虚拟键盘");
        this.Role = "Keyboard";
        this.isEnable = true;
        
        this.allkey = new Map();                
        this._virtualkeyboard = new ShowObj();

        // const t = this._virtualkeyboard.AddIn.bind(this._virtualkeyboard);
        // const t2 = this._virtualkeyboard.Copy.bind(this._virtualkeyboard);
        // this._virtualkeyboard.AddIn = (...x)=>{t(...x);this.flash();}
        // this._virtualkeyboard.Copy = (...x)=>{t2(...x);this.flash();}

    }

    keyHandle(event){
        if(!this.isEnable) return;
        if(this.allkey.has(event.code)){
            this.allkey.get(event.code).on(event);
        }

    }

    //键盘、触摸接口
    pointHandle(event,pos){
        if(!this.isEnable) return;

        let e = {x:pos.x,y:pos.y,style:"point"};
        switch(event.type){
            case "mousemove": e.type = "over"; break;
            case "mousedown": e.type = "keydown"; break;
            case "mouseup": e.type = "keyup"; break;
            case "click": e.type = "keypress"; break;
            case "dblclick": e.type = "dblclick"; break;
            case "touchstart": e.type = "keydown"; break;
            case "touchmove": e.type = "over"; break;
            case "touchend": e.type = "keyup"; break;
        }

        this.allkey.forEach(k=>k.on(e));
    }
    turnOn(){
        this.isEnable = true;
    }

    turnOff(){
        this.isEnable = false;
    }

    add(key){
        key._jGE = this._jGE;
        this.allkey.set(key.code,key);

        this.VirtualKeyboard.add(key);
    }

    //取得某个按键对象
    get(keyCode){return this.allkey.get(keyCode);}

    //取得整个虚拟键盘的可视化对象
    get VirtualKeyboard(){ return this._virtualkeyboard;}

    // //刷新键盘，为了解决键盘整体移位后，按键第一次触发会在原来位置闪现一下的问题
    // flash(){
    //     this.allkey.forEach(k=>k.flash());
    //     this.VirtualKeyboard.update(0,this._jGE);
    //     this.allkey.forEach(k=>k.reset());
    // }

    //设置键盘整体位置
    SetPos(pos){
        if(pos.x!=undefined && pos.y!=undefined) this.VirtualKeyboard.Copy(pos);
        else if(Array.isArray(pos)) this.VirtualKeyboard.Copy({x:pos[0],y:pos[1]});
    }

}


/**
 * 按键
 */
class Key  extends ShowObj{
    /*
        upObjs 按钮平常态
        downObjs 按钮按下
        hoverObj 按钮被划过、聚焦
        actObj 按钮感应区域
    */
    constructor({key="",code="",handler=null,upObjs=[],downObjs=null,hoverObj=null,actObj=null,x=0,y=0,angle=0}={}){
        super({x:x,y:y,angle:angle});

        this.handler = new Map();
        this.code = code;
        this.KEYSTATUS = {"Normal":Symbol(),"Down":Symbol(),"Hover":Symbol()};
        this.status = this.KEYSTATUS.Down;

        this.btShowObjs = new Map([[this.KEYSTATUS.Normal,upObjs],[this.KEYSTATUS.Down,downObjs],[this.KEYSTATUS.Hover,hoverObj]]);

        this.activeArea = actObj || upObjs[0];
        this._jGE = null;

        if(handler !== null) addEventListener(type,handler);

        this._changeStatus("keyup");
    }

    //按键触发
    on(event){
        //鼠标、触摸操控转换命中判断
        if(event.style == "point"){
            if(!this._IsHit(event)){
                if(this.status == this.KEYSTATUS.Hover) event.type = "out";
                else return;
            }
            event.code = this.code;
        }

        this._changeStatus(event.type,event.style);        

        if(!this.handler.has(event.type)) return false;        
        this.handler.get(event.type).forEach(h => {
            h(event);
        });
    }

    //type 动作类型，已被归类为[keydown,keyup,over,out]
    addEventListener(type,handler){
        if(!this.handler.has(type)) this.handler.set(type,new Set());

        this.handler.get(type).add(handler);
    }

    removeEventListener(type){
        if(this.handler.has(type)){
            this.handler.get(type).clear();
        }
    }

    _changeStatus(type,style){
        if(type == "keypress") return;
        let oldStatus = this.status;
        switch(type){
            //case "keypress":this.status=this.KEYSTATUS.Down; break;
            case "keydown":this.status=this.KEYSTATUS.Down; break;
            case "keyup":this.status= style == "point"?this.KEYSTATUS.Hover : this.KEYSTATUS.Normal;break;
            case "over":this.status = this.KEYSTATUS.Hover;break;
            case "out":this.status = this.KEYSTATUS.Normal;break;
        }

        if(oldStatus != this.status){
            if(this.btShowObjs.get(oldStatus)!=null) this.btShowObjs.get(oldStatus).forEach(o=>{this.del(o);});
            if(this.btShowObjs.get(this.status)!=null) this.btShowObjs.get(this.status).forEach(o=>{this.add(o);});
        }
    }

    // flash(){
    //     this.btShowObjs.forEach(oL=>oL.forEach(o=> this.add(o)));
    // }

    // reset(){
    //     this.btShowObjs.forEach((oL,k)=>{if(k != this.status) oL.forEach(o=> this.del(o))});
    // }

    _IsHit(event){
        return this._jGE.IsInIt(event,this.activeArea);
    }

}

//拖拽控制助手
class DragHelper{
    // constructor(_jGE,setting){
    //     // let w = setting.tape.cell_width*(setting.pitch_names.length-1)
    //     // let h = setting.tape.max_height;
    //     // let pu = new $tk_path({styleType:'stroke',style:"red 1" ,points:[[0,0],[w,0],[w,h],[0,h],-1],pos:[0,0]});
    //     // let pd = new $tk_path({styleType:'both',style:{fillStyle:"red",strokeStylest:"white 2"} ,points:[[0,0],[w,0],[w,h],[0,h],-1],pos:[0,0]});


        
    //     // let k  = new Key({
    //     //     code:"clickDown",
    //     //     upObjs:[pu],downObjs:[pd],x:0,y:0
    //     // });
    //     // DragHelper.InitDrag(k,{
    //     //     startCallback:(e)=>console.log("start!",e)
    //     //     ,moveCallback:(e)=>console.log("move",e)
    //     //     ,endCallback:(e)=>console.log("end",e)
    //     // })
    //     // let kb = new Keyboard(_jGE);
    //     // kb.add(k);        
    //     // kb.SetPos(setting.tape.pos)
    //     // _jGE.add(kb);


    // }


    static InitDrag(key,{startCallback=null,moveCallback=null,endCallback=null}={}){
        key._drag_status = {
            startPos:{x:0,y:0}
            ,isDraging:false
        };

        key.addEventListener("keydown",e=>{
            key._drag_status.startPos = new Vector2D(e);
            key._drag_status.isDraging = true;
            if(startCallback) startCallback.call(key);
        });

        key.addEventListener("over",e=>{
            if(!key._drag_status.isDraging) return;
            if(moveCallback) moveCallback.call(key,key._drag_status.startPos,e);
        });

        key.addEventListener("keyup",e=>{
            if(endCallback) endCallback.call(key,e);
            key._drag_status.isDraging = false;
        })

    }
}