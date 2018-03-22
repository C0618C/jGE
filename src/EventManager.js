/*
    事件处理逻辑：
        事件可以通过jGE对象的on/one/off方法绑定或解绑，各模块通过broadcast事件名称触发事件
        事件响应期为一个update处理周期，每次update结束后自动清空所有事件。
*/
class EventManager extends Manager {
    constructor(_jGE) {
        super(_jGE, "事件管理器");
        this.eventQueue = new Map();        //长期事件处理对象
        this.eventOne = new Map();          //一次性事件对象

        /**
         * 事件处理顺序：broadcast的事件会进入waitEventSet进行等待，在下一个循环片中，waitEventSet事件会进入curEventSet执行。
         * 执行完后——无论有无接收器处理，curEventSet里的事件将会全部清理，接待下一批事件。
         */
        this.waitEventSet = new Set();      //在排队的事件
        this.watiEventObj = new Map();      //排队事件对应的参数
        this.curEventSet = new Set();       //正在等待处理的事件
        this.curEventObj = new Map();       //事件对应的参数

        this._jGE = _jGE;
        _jGE.on = this.on.bind(this);
        _jGE.one = this.one.bind(this);
        _jGE.broadcast = this.broadcast.bind(this);
    }

    //绑定事件
    on(listenEvent, callback) {
        let eq = this.eventQueue.get(listenEvent);
        if (!eq) this.eventQueue.set(listenEvent, eq = []);
        eq.push(callback);
    }
    one(listenEvent, callback) {
        let eq = this.eventOne.get(listenEvent);
        if (!eq) this.eventOne.set(listenEvent, eq = []);
        eq.push(callback);
    }

    //解绑事件
    off(listenEvent) {
        this.eventQueue.set(listenEvent, []);
    }

    broadcast(myEvent, param = undefined) {
        this.waitEventSet.add(myEvent);
        this.watiEventObj.set(myEvent, param);

        // console.info(`发射事件  ${myEvent},事件参数：${JSON.stringify( param)}`)
        // console.log("当前事件配置：",[...this.eventQueue.keys()],[...this.eventOne.keys()])
    }

    //定时
    update(t) {
        if (this.waitEventSet.size > 0) {
            this.curEventSet = this.waitEventSet;
            this.curEventObj = this.watiEventObj;
            this.waitEventSet = new Set();
            this.watiEventObj = new Map();
        }
        let debugLog = () => { };//(eventName,handler)=>{console.log(`捕获事件${eventName},处理者：`),console.trace(handler)};
        //事件轮询
        for (let e of this.eventQueue.keys()) {
            //if(this.curEventSet.size!=0) console.log(e,[...this.curEventSet])
            if (this.curEventSet.has(e)) {
                let fA = this.eventQueue.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f => { f(event), debugLog(e, f) });      //DEBUG: 打印事件捕获情况
            }
        }
        for (let e of this.eventOne.keys()) {
            if (this.curEventSet.has(e)) {
                let fA = this.eventOne.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f => { f(event), debugLog(e, f) });      //DEBUG: 打印事件捕获情况
                this.eventOne.delete(e);
            }
        }

        //this.curEventSet.forEach(i=>console.debug(`收到事件  ${i}`));//DEBUG:事件监控日志

        this.curEventSet.clear();   //不留存事件
        this.curEventObj.clear();
    }
}