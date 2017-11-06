/**
 * 键盘：按键管理模块
 */
class Keyboard extends Manager{
    constructor(_jGE){
        super(_jGE,"虚拟键盘");
        this.Role = "Keyboard";
        this.isEnable = true;
        
        this.allkey = new Map();

    }

    keyHandle(event){
        if(!this.isEnable) return;

        if(this.allkey.has(event.code)){
            this.allkey.get(event.code).on(event);
        }

    }

    turnOn(){
        this.isEnable = true;
    }

    turnOff(){
        this.isEnable = false;
    }

    add(key){
        this.allkey.set(key.code,key);

        this._jGE.add(key);
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
    constructor({key="",code="",handler=null,upObjs=[],downObjs=[],hoverObj=[],actObj=null,x=0,y=0}={}){
        //super(...args);
        super({x:x,y:y});

        this.handler = new Map();
        this.code = code;
        this.KEYSTATUS = {"Normal":Symbol(),"Down":Symbol(),"Hover":Symbol()};
        this.status = this.KEYSTATUS.Down;

        this.btShowObjs = new Map();
        this.btShowObjs.set(this.KEYSTATUS.Normal,upObjs);
        this.btShowObjs.set(this.KEYSTATUS.Down,downObjs);
        this.btShowObjs.set(this.KEYSTATUS.Hover,hoverObj);

        this.activeArea = actObj || upObjs[0];

        if(handler !== null) addEventListener(type,handler);

        this._changeStatus("keyup");
    }

    on(event){
        this._changeStatus(event.type);
        
        if(!this.handler.has(event.type)) return false;
        
        this.handler.get(event.type).forEach(h => {
            h(event);
        });
    }

    addEventListener(type,handler){
        if(!this.handler.has(type)) this.handler.set(type,new Set());

        this.handler.get(event.type).add(handler);
    }

    removeEventListener(type){
        if(this.handler.has(type)){
            this.handler.get(type).clear();
        }
    }

    _changeStatus(type){
        let oldStatus = this.status;
        switch(type){
            case "keypress":this.status=this.KEYSTATUS.Down; break;
            case "keydown":this.status=this.KEYSTATUS.Down; break;
            case "keyup":this.status=this.KEYSTATUS.Normal; break;
            case "over":this.status = this.KEYSTATUS.Hover;break;
        }

        if(oldStatus != this.status){
            this.btShowObjs.get(oldStatus).forEach(o=>{this.del(o);});
            this.btShowObjs.get(this.status).forEach(o=>{this.add(o);});
        }
    }

}