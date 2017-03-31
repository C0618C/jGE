/**
 * 兼容Logo的变量
 */
let pi = π;

/**
 * 基本指令
 */
class Cmd{
    constructor(name){
        this.name = name;
    }

    set param(p){this._param = p;}
    get param(){return this._param;}

    get sub_cmd(){return this._subcmd_;}
    set sub_cmd(cmd){this._subcmd_ = cmd;}
}

/**
 * 绘画指令
 */
class DrawCmd{
    constructor({type="path",path=[]}={}){
        this.type = type;
        this.path = path;
    }
}
/**
 * 画笔状态
 */
class PenStatu{
    constructor(pos){
        this.penDown = true;        //落笔状态
        this.penColor = "white";
        this.penWidth = 1;
        this.pos= pos;
        this.angle=0;
        this.isShow = true;
    }
}


//词法工具
class PCLogo{
    constructor(){
        /**
         * 注册无参 并终结指令
         */
        this.COMMEND_P0END = new Set(["stamprect","stampoval"]);
        /**
         * 注册无参指令
         */
        this.COMMEND_P0 = new Set(["pu","pd","ht","st","home","cs","draw","clean","ct"]);
        /**
         * 注册1参指令
         */
        this.COMMEND_P1 = new Set(["fd","lt","rt","bk","setw","setpc","test","random","wait"]);
        /**
         * 注册1参 并终结指令
         */
        this.COMMEND_P1END = new Set(["help","?"]);
        /**
         * 注册2参指令
         */
        this.COMMEND_P2 = new Set([]);
        /**
         * 注册可变数量数字参数指令
         */
        this.COMMEND_P1LIST3 = new Set(["setbg","setpc"]);
        /**
         * 注册特殊指令(处理器与名字相同)
         */
        this.COMMEND_SP = new Set(["rp","to","ask","tell","tellall","each"]);
        /**
         * 所有可用的指令
         */
        this.COMMEND = [...this.COMMEND_P0,...this.COMMEND_P0END,...this.COMMEND_P1,...this.COMMEND_P1END,...this.COMMEND_P2,...this.COMMEND_P1LIST3,...this.COMMEND_SP];

        /**
         * 用户自定义过程
         */
        this.CusFun = new Map();

        this.KeyWord = new Set(["[","]"]);
        this.Lexical = new Map();
        this.__InitLexical();

        this.cmd_history=new Map();
        
        /* 转义、国际化翻译用字典 *//*NOTE: 全称命令化简配置*/
        this._cmd_map = new Map([["repeat","rp"],["\\?","help"],["right","rt"],["left","lt"],["forward","fd"],["back","bk"]]);

        this.__getANum = (s)=>{
            let rsl = NaN;
            if(this.isInCustomProcess&&s.includes(":")) rsl = s;
            else try{rsl = eval(s)}catch(e){}
            return rsl;
        };

        this.isInCustomProcess = false;

        //加载历史命令记录
        let h_cmd = JSON.parse(localStorage.getItem("weblogo_cmd_history"))||[];
        for(let c of h_cmd) this.cmd_history.set(c,false);
    }

    i18n(st){this._cmd_map=new Map([...this._cmd_map,...st]);}
    
    i18nToen(cmd){
        for(let k of this._cmd_map.keys()){
            cmd = cmd.replace(new RegExp(k,"g"),this._cmd_map.get(k));
        }
        return cmd;
    }

    /**
     * 给指令绑定语法格式
     */
    __InitLexical(){
        //this.Lexical
        for(let c of this.COMMEND_P0) this.Lexical.set(c,this.c1);
        for(let c of this.COMMEND_P0END) this.Lexical.set(c,this.c1end);
        for(let c of this.COMMEND_P1) this.Lexical.set(c,this.c1n1);
        for(let c of this.COMMEND_P1END) this.Lexical.set(c,this.c1p1end);
        for(let c of this.COMMEND_P1LIST3) this.Lexical.set(c,this.c1p1list3);
        for(let c of this.COMMEND_SP) this.Lexical.set(c,this[c]);
    }

    /**
     * 预处理指令 并分析
     * @param {*用户输入的指令串} cmd 
     */
    compile(cmd){
        //预处理
        cmd = cmd.replace(/\[/g," [ ").replace(/\]/g," ] ").replace(/\s+/g," ").toLocaleLowerCase();
        cmd = this.i18nToen(cmd);
        cmd = cmd.replace(/\(\s*/g,"(").replace(/\s*\)/g,")").replace(/\s*\*\s*/g,"*").replace(/\s*\/\s*/g,"\/").replace(/\s*\-\s*/g,"-").replace(/\s*\+\s*/g,"+");
        
        let rsl = this.cmd_history.get(cmd);
        if(!rsl){
            rsl = this.analysis(cmd.match(/[^\s\r\n]+/ig));
            this.cmd_history.set(cmd,rsl);

            //本地存档
            localStorage.setItem("weblogo_cmd_history",JSON.stringify([...this.cmd_history.keys()]));
        }
        return rsl;
    }

    //分析
    analysis(arr){
        if(arr == null) return [];

        let word = arr.shift();
        let rsl_cmd=[];
        if(this.KeyWord.has(word)||this.Lexical.has(word)){
            rsl_cmd.push(this.Lexical.get(word).bind(this)(arr,word));
            if(arr.length>0) rsl_cmd.push(...this.analysis(arr));
        }else if(this.CusFun.has(word)){
            rsl_cmd.push(...this.cusprocess(arr,word));
            if(arr.length>0) rsl_cmd.push(...this.analysis(arr));
        }else{
            throw new Error("Unexpected commend "+word);
        }

        return rsl_cmd;
    }

    /**
     * 单一命令模式
     * @param {*输入流} arr 
     * @param {*当前指令名称} word 
     */
    c1(arr,word){return new Cmd(word);}
    c1end(arr,word){arr.length = 0;return new Cmd(word);}

    /**
     * 命令-参数 式指令处理
     * @param {*输入流} arr 
     * @param {*当前指令名称} word 
     */
    c1n1(arr,word){
        let _c = new Cmd(word);
        _c.param = this.__getANum(arr.shift());
        if(Object.is(_c.param,NaN)){
            throw new Error(`Illegal number after ${word}.`)
        }
        return _c;
    }

    /**
     * 命令-命令 模式，如 help fd
     * @param {*输入流} arr 
     * @param {*当前指令名称} word 
     */
    c1p1end(arr,word){
        let _c = new Cmd(word);
        _c.param = arr.shift();
        arr.length = 0;
        return _c;
    }

    //一个数字或者3个数字的数组 如 cmd [12 34 56] 或 cmd 3
    c1p1list3(arr,word){
        let _c=new Cmd(word);
        _c.param=[];
        if(arr[0]=="["&&arr[4]=="]"){
            _c.param.push(this.__getANum(arr[1]),this.__getANum(arr[2]),this.__getANum(arr[3]));            
            arr.shift();arr.shift();arr.shift();arr.shift();arr.shift();//arr = arr.splice(5);
        }else{
            _c.param.push(this.__getANum(arr.shift()));
        }

        return _c;
    }

    //解释用户自定义过程
    cusprocess(arr,word){
        let c = this.CusFun.get(word);
        let param = arr.splice(0,c.param.length);
        let __cmd = c.codeblock.concat();
        for(let i = 0;i<c.param.length;i++){
            for(let j=0;j<__cmd.length;j++){
                __cmd[j] = __cmd[j].replace(new RegExp(c.param[i],"g"),param[i]);
            }
        }
        return this.analysis(__cmd);
    }

    /**
     * 块状代码
     * @param {*输入流} arr 
     * @param {*指令} _c
     * @param {*开始标记} cbegin 
     * @param {*结束标记} cend 
     * @param {*是否允许嵌套} nesting 
     */
    codeblock(arr,_c,cbegin,cend,nesting=true){
        let lv = 0;
        let childCMD=[];
        let c="";
        do{
            c = arr.shift();
            if(c == cbegin) lv++;
            if(c==cend) lv--;

            if(lv >= 0) childCMD.push(c);
            if(lv >0 && !nesting) throw new Error(`E00002|${_c.name}`);
        }while(arr.length>0 && lv!=-1);

        if(lv>=0){
            throw new Error(`E00004|${cend}`);
        }

        _c.codeblock = childCMD.concat();
        _c.sub_cmd = this.analysis(childCMD);

        return _c;
    }

    rp(arr){
        let _c = this.c1n1(arr,"rp");
        let tk = arr.shift();
        if(tk!=="["){
            throw new Error("Expected token [ before "+tk);
        }
        return this.codeblock(arr,_c,"[","]")
    }
    to(arr){
        let _c = new Cmd("to");
        let funName = arr.shift();
        if(this.COMMEND.includes(funName)) throw new Error(`E00003|${funName}`);
        _c.param = [];
        while(/^:{1}.*$/.test(arr[0])){
            _c.param.push(arr.shift());
        }
        this.isInCustomProcess = true;
        this.codeblock(arr,_c,"to","end",false);
        this.isInCustomProcess = false;
        this.CusFun.set(funName,_c);
        return _c;
    }
}

//指令逻辑控制
class WebLogo{
    constructor(home){
        this.La = new PCLogo();
        Object.assign(this,exFun);

        this.fun = new Map();
        let tF = (cmd)=>{throw new Error(`E00001|${cmd.name}`);}
        for(let c of this.La.COMMEND){
            this.fun.set(c, this[c] || tF);            
        }

        this.i18n = this.La.i18n.bind(this.La);

        //常量设置
        /*
            0  black	 1  blue	 2  green	 3  cyan
            4  red		 5  magenta	 6  yellow	 7 white
            8  brown	 9  tan		10  forest	11  aqua
            12  salmon	13  purple	14  orange	15  grey
        */
        this.color_list = ["black","blue","green","cyan","red","magenta","yellow","white","brown","tan","forest","aqua","salmon","purple","orange","grey"];


        //当前绘画环境
        this.bgColor = "black";
        this.sln = 1; //step longth
        this.homePos = new Proxy(home,{set:function(target,b,value){
            console.warn(target,b,value);
            return true;
        }});
        this.drawCmds = [];

        // this.pos = null;
        // this.penDown = true;    //落笔状态
        this.pens=[new PenStatu(home)]; //所有笔的状态
        this.activePens=[0];        //激活的画笔（多笔同步作画）
        this.curPen = 0;            //当前画笔
    }
    
    get angle(){return this.__ag__;}
    set angle(ag){
        if(ag >= 360) ag = ag%360;
        while(ag < 0) ag += 360;
        this.__ag__ = ag;
    }
    ___satrPen(penid){
        this.drawCmds[penid] = [new DrawCmd({path:[new Vector2D(this.pens[penid].pos)]})];
        return true;
    }



    /**
     * 将简单指令转换为绘画指令
     * @param {*基本指令序列} cmd 
     * @param {*当前角度} curAngle 
     * @param {*当前位置} pos 
     */
    do(cmd){
        let cmdObj = this.La.compile(cmd);

        //this.drawCmds = [new DrawCmd({path:[new Vector2D(this.___getCurPen().pos)]})];
        this.pens.every((v,i)=>this.___satrPen(i));
        this.exe(cmdObj);

        return this.drawCmds;//{path:this.temp_path,status:this.status};
    }

    exe(cmd){
        for(let c of cmd){
            this.fun.get(c.name).bind(this)(c);
        }
    }

    /* **************LOGO 绘画指令 ****************/
    ___drawHelp(){
        if(this.___getCurPen().penDown){
            let dCmd = this.drawCmds[this.curPen][this.drawCmds.length - 1];
            dCmd.path.push(new Vector2D(this.___getCurPen().pos));
        }
    }

    fd(cmd){
        let ag = DEG2RAG(this.___getCurPen().angle);
        let l = cmd._param*this.sln;
        this.___getCurPen().pos.AddIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));
        this.___drawHelp();
    }
    bk(cmd){
        let ag = DEG2RAG(this.___getCurPen().angle);
        let l = cmd._param*this.sln;
        this.___getCurPen().pos.MinusIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));
        this.___drawHelp();
    }

    lt(cmd){this.___getCurPen().angle -= cmd._param;}
    rt(cmd){this.___getCurPen().angle += cmd._param;}

    rp(cmd){/*repeat*/
        for(let i=0;i<cmd.param;i++){
            this.exe(cmd.sub_cmd);
        }
    }

    /* **************画笔 操作指令 ****************/
    ___getCurPen(){return this.pens[this.curPen];}
    pu(){this.___getCurPen().penDown = false;}
    pd(){
        this.___getCurPen().penDown = true;
        this.drawCmds[this.curPen].push(new DrawCmd({path:[new Vector2D(this.___getCurPen().pos)]}));
    }
    setbg(cmd){
        if(cmd._param.length == 1&& cmd._param[0]>=0&&cmd._param[0]<this.color_list.length){
            this.bgColor= this.color_list[cmd._param[0]];
        }else if(cmd._param.length == 3&&Math.max(...cmd._param)<=100){
            this.bgColor = RGBA(cmd._param);
        }else{
            throw new Error("E00005");
        }
    }

    setpc(cmd){
        let pen = this.___getCurPen();
        if(cmd._param.length == 1){
            pen.penColor = this.color_list[cmd._param[0]]
        }else if(cmd._param.length == 3){
            pen.penColor = RGBA(cmd._param);
        }else{
            throw new Error("E00005");
        }
    }

    /* ****************** 编程指令 ****************/
    to(cmd){
        console.log(cmd);
    }

    /* **************LOGO 操作指令 ****************/
    home(cmd){
        this.___getCurPen().angle = 0;
        this.___getCurPen().pos.Copy(this.homePos);
        this.drawCmds[this.curPen].push(new DrawCmd({path:[new Vector2D(this.___getCurPen().pos)]}))
    }
    clean(cmd){this.drawCmds[this.curPen] = [new DrawCmd({type:"cs"})];}
    cs(cmd){
        this.clean();
        this.home();
    }

    /* **************命令窗相关 操作指令 ****************/
    help(cmd){
        if(typeof this.__helpRsl == "undefined") this.__helpRsl = new Map();
        let r = this.__helpRsl.get(cmd.param);
        if(r == undefined){
             r = new DrawCmd({type:"help"});
             r.help_text="Loading...";
             if(!cmd.param){
                 r.help_text="<span class='help_cmd'>"+this.La.COMMEND.sort().join("</span><span class='help_cmd'>").toUpperCase()+"</span>";
             }else{
                /* await GetURL({url:`../WebLogo/helpfiles/${cmd.param}.txt`,type:"text",method:"GET",async:false})
                 .then((t)=>{console.log(2);r.help_text=`<pre>${t}</pre>`}).catch((t)=>{throw new Error(t)});*/
                LoadResources({url:`../WebLogo/helpfiles/${cmd.param}.txt`,success:(t)=>{r.help_text=`<pre>${t}</pre>`},error:(t)=>{throw new Error(t)},async:false})
             }
             this.__helpRsl.set(cmd.param,r);
        }
        this.drawCmds[this.curPen] = [r];
    }
    ct(cmd){
        this.drawCmds[this.curPen] = [new DrawCmd({type:"ClearText"})];
    }
}

class GameHelper{
    constructor(gameEngine){
        this.version = [2,0,0,"α"];
        this.ge = gameEngine;
        let w = this.ge.run.width/2;
        let h = this.ge.run.height/2
        this.pclogo = new WebLogo(new Vector2D(w,h));      
        this.cmdLength = 0;
        this.cmdIndex = 0;
        this.turtleHouse = [];

        this.ge.one("jGE.Scene.Logo.End",this.start.bind(this));

        //NOTE: 默认ERROR信息配置
        this.errInfo =new Map([
                    ["E00001","Comment '$1' not supported,maybe you can try it on the latest version."]
                    ,["E00002","Comment '$1' can't be nesting,try help $1 for more information."]
                    ,["E00003","'$1' is already in use. Try a different name."]
                    ,["E00004","SyntaxError:missing '$1' after commends."]
                    ,["E00005","Error:illegal of color setting,use help for more info."]
                ]);

        this.l10n();
    }

    get cmds(){
        let cmds = [...this.pclogo.La.cmd_history.keys()];
        if(cmds.length != this.cmdLength){
            this.cmdIndex = cmds.length;
            this.cmdLength=cmds.length;            
        }
        return cmds;
    }

    getLastCmd(){
        let cmds = this.cmds;
        this.cmdIndex--;
        if(this.cmdIndex<0)this.cmdIndex=this.cmdLength-1;
        return cmds[this.cmdIndex]||"";
    }

    getNextCmd(){
        let cmds = this.cmds;
        this.cmdIndex++;
        if(this.cmdIndex>=this.cmdLength)this.cmdIndex=0;
        return cmds[this.cmdIndex]||"";
    }

    //创建海龟
    turtleBirth(){
        let def_home = this.pclogo.home;
        let turtle = {
            obj:new ShowObj(def_home),
            pos:new Vector2D(def_home),
            angle:0,            //角度 0 90 180 270
            showStyle:0,
            myShowItem : []
            ,goto(pos,angle){
                this.pos.Copy(pos);
                this.obj.Copy(pos);
                this.angle = angle;
                this.obj.angle = DEG2RAG(angle)+π/2;
            }
        };
        turtle.obj.index = 1000+this.turtleHouse.length;
        turtle.obj.add(new $tk_font({text:'🐙',styleType:'fill',style:'rgba(255,0,0,1)',font:'16px serif',pos:[0,0]}));
        this.ge.add(turtle.obj);
        return turtle;
    }

    start(){
        this.updateTurtles();

        //环境初始化
        this.ShowResult(`Welcome to Web Logo [ver ${this.version.join(".")}]`);
        this.ShowResult("Copyright © VMWed.COM 2017");
        this.ShowResult("Try 'help' or '?' for more information.");
        this.ShowResult("说明（临时）：https://github.com/C0618C/jGE/blob/master/WebLogo/README.md")
        this.ShowResult("　");
        let ip_bar = document.getElementById("cmd_input");
        ip_bar.removeAttribute("disabled");
        ip_bar.focus();
    }

    do(cmd){
        let cmdQueue = this.pclogo.do(cmd);

        //TODO:需要优化
        this.updateTurtles();

        cmdQueue.every((dCmd,i)=>{
            let newpath = new ShowObj(0,0);            
            for(let dC of dCmd){
                switch(dC.type){
                    case "path":
                        if(dC.path.length == 1){
                            console.debug("监控到只有一个点的路径");
                            continue;
                        }
                        newpath.add(new $tk_path({styleType:'stroke',style:"#ffffff 1 round round" ,points:dC.path}));
                        break;
                    case "cs":
                        for(let s of this.turtleHouse[i].myShowItem) s.isDel = true;
                        newpath = new ShowObj(0,0);
                        this.turtleHouse[i].myShowItem = [];
                        break;
                    case "help":
                        this.ShowResult(dC.help_text,{help:true});
                        this.dCmd = [];
                        return;
                        break;
                    case "ClearText":
                        this.ShowResult("",{cls:true});
                        break;
                }

            }
            this.turtleHouse[i].myShowItem.push(newpath);
            this.ge.add(newpath);
            return true;
        });
        this.ge.backgroundColor = this.pclogo.bgColor;
    }

    updateTurtles(){
        this.pclogo.pens.map((t,i)=>{
            if(!this.turtleHouse[i]){
                this.turtleHouse[i] = this.turtleBirth();
            }

            this.turtleHouse[i].goto(t.pos,t.angle);
        });
    }

    ShowResult(text,{error=false,help=false,cls=false}={}){
        let cmd_win = document.getElementById("cmd_log");
        let p = document.createElement("p");
        p.textContent = text;
        if(cls){cmd_win.textContent="";return;}
        if(error){
            p.style.color="#a94442";
            let [errcode,...errparam] = text.split("|");
            let errText = this.errInfo.get(errcode)||errcode;
            errparam.map((param,index)=>errText=errText.replace(new RegExp("\\$"+(index+1)),param));
            p.innerHTML = errText;
        }else if(help){
            p.innerHTML = text;
        }
        cmd_win.appendChild(p);
        cmd_win.scrollTop = cmd_win.scrollHeight;
    }

    l10n(){
        let curLang = navigator.language;
        if(curLang.includes("en")) return;        //curLang = "ru";     //测试的俄语
        GetURL({url:`../WebLogo/i18n/${curLang}.js`,type:"script"})
        .then((rsl)=>{
            if(typeof web_logo_i18n != "undefined"){//本地化处理
                this.pclogo.i18n(web_logo_i18n.cmd);
                this.errInfo = new Map([...this.errInfo,...web_logo_i18n.err]);
                console.debug(`已装载本地语言：${web_logo_i18n.name}。`);
                web_logo_i18n = null;
            }
        })
        .catch((e)=>console.warn(`本地化失败:找不到语言${curLang}.`));
    }
}

(function(){
    let KeyMap = new Map([[13,"Enter"],[38,"Up"],[40,"Down"]]);

    let cmd_show_height=222+20;
    let myHeight = document.documentElement.clientHeight-cmd_show_height+130;
    let x = new jGE({width:document.documentElement.clientWidth,height:myHeight});
    let game = new GameHelper(x);

    let vp = document.getElementById("view_port");
    vp.appendChild(x.GetDom());
    vp.style.height = myHeight+"px";
    document.getElementById("cmd").style.width=document.documentElement.clientWidth+"px";
    let cmd_win = document.getElementById("cmd_log");
    cmd_win.style.width = document.documentElement.clientWidth+20+"px";
    let ip_bar = document.getElementById("cmd_input");
    ip_bar.addEventListener("keyup",function(event){
        if(KeyMap.get(event.keyCode) == "Enter"){
            let cmd = this.value.replace(/\r|\n/," ");
            
            game.ShowResult(cmd);            
            this.value = "";
            try{
                game.do(cmd);
            }catch(e){
                game.ShowResult(e.message,{error:true});
                console.error(e);
            }
        }else if(KeyMap.get(event.keyCode) == "Up"){
            this.value =game.getLastCmd();
        }else if(KeyMap.get(event.keyCode) == "Down"){
            this.value =game.getNextCmd();
        }
    });
    
    //DEBUG:抛出Weblogo
    window.weblogo = game;
})();

function DEG2RAG(ag){
    return π*ag/180-π/2;//-0.5π是为了将y轴正方形朝下
}

function RGBA(arr){
    let r = Math.floor(255*arr[0]/100);
    let g = Math.floor(255*arr[1]/100);
    let b = Math.floor(255*arr[2]/100);
    let a = arr[3];
    if(a == undefined) a = 1;
    return `rgba(${r},${g},${b},${a})`;
}