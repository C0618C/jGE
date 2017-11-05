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
        console.log(event.type)

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
    constructor({type="keypress",key="",code="",handler=null,upObjs=[],downObjs=[]}={}){
        //super(...args);
        super();

        this.handler = new Map();
        this.code = code;
        this.KEYSTATUS = {"Normal":new Symbol(),"Down":new Symbol()};
        this.status = this.KEYSTATUS.Normal;

        this.btShowObjs = new Map();
        this.btShowObjs.set(this.KEYSTATUS.Normal,upObjs);
        this.btShowObjs.set(this.KEYSTATUS.Down,downObjs);

        if(handler !== null) addEventListener(type,handler);
    }

    on(event){
        if(!this.handler.has(event.type)) return false;

        _changeStatus(event.type);

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
        }

        if(oldStatus != this.status){
            this.Objects.rObj = this.btShowObjs.get(this.status);
            this.Objects.uObj = this.btShowObjs.get(this.status);
        }
    }

}