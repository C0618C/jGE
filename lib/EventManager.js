/*
    事件处理逻辑：
        事件可以通过jGE对象的on/one/off方法绑定或解绑，各模块通过向listen发送事件名称触发事件
        事件响应期为一个update处理周期，每次update结束后自动清空所有事件。
*/
class EventManager{
    constructor(_jGE){
        console.log("[%c报告%c] 事件管理器已启动。","color:green","color:black");//DEBUG:进度报告
        this.eventQueue = new Map();        //长期事件处理对象
        this.eventOne = new Map();          //一次性事件对象
        this.curEventSet = new Set();
        this.curEventObj = new Map();

        this._jGE = _jGE;
        _jGE.on = this.on.bind(this);
        _jGE.one = this.one.bind(this);
        _jGE.broadcast = this.broadcast.bind(this);
    }

    //绑定事件
    on(listenEvent,callback){
        let eq = this.eventQueue.get(listenEvent);
        if(!eq) this.eventQueue.set(listenEvent,eq = []);
        eq.push(callback);
    }
    one(listenEvent,callback){
        let eq = this.eventOne.get(listenEvent);
        if(!eq) this.eventOne.set(listenEvent,eq = []);
        eq.push(callback);
    }

    //解绑事件
    off(listenEvent){
        this.eventQueue.set(listenEvent,[]);
    }

    broadcast(myEvent,param=undefined){
        this.curEventSet.add(myEvent);
        this.curEventObj.set(myEvent,param);

        console.debug(`发射事件  ${myEvent},事件参数：${JSON.stringify( param)}`)
    }

    //定时
    update(t){
        //事件轮询
        for(let e of this.eventQueue.keys()){
            if(this.curEventSet.has(e)){
                let fA = this.eventQueue.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f=>f(event));
            }
        }
        for(let e of this.eventOne.keys()){
            if(this.curEventSet.has(e)){
                let fA = this.eventOne.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f=>f(event));
                this.eventOne.delete(e);
            }
        }

        this.curEventSet.forEach(i=>console.debug(`收到事件  ${i}`));//DEBUG:事件监控日志

        this.curEventSet.clear();   //不留存事件
        this.curEventObj.clear();
    }
}