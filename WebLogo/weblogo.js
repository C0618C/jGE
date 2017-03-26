/**
 * 所有可用的指令
 */
const COMMEND = new Set([
    "fd","lt","rt","bk","rp","home","cs","pu","pd","setw"
]);

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

//词法工具
class PCLogo{
    constructor(){
        this.KeyWord = new Set(["[","]"]);

        this.Lexical = new Map([
            ["fd",this.c1n1],["bk",this.c1n1],["lt",this.c1n1],["rt",this.c1n1],["repeat",this.repeat],["rp",this.repeat],
            ["home",this.c1],["cs",this.c1],
            ["help",this.c2end],["?",this.c2end]
        ]);

        for(let c of COMMEND.keys()){
            if(!this.Lexical.has(c)) this.Lexical.set(c,this.c1end);
        }

        this.cmd_history=new Map();
        this._cmd_map = new Map();

        this.__getANum = (s)=>{return /[*/\-+0-9.()]+/.test(s)?eval(s):NaN;};//计算算式
        //加载历史命令记录
        let h_cmd = JSON.parse(localStorage.getItem("weblogo_cmd_history"))||[];
        for(let c of h_cmd) this.cmd_history.set(c,false);
    }
    i18n(st){this._cmd_map=st;}
    
    i18nToen(cmd){
        for(let k of this._cmd_map.keys()){
            cmd = cmd.replace(new RegExp(k,"g"),this._cmd_map.get(k));
        }
        return cmd;
    }

    /**
     * 预处理指令 并分析
     * @param {*用户输入的指令串} cmd 
     */
    compile(cmd){
        //预处理
        cmd = cmd.replace(/\[/g," [ ").replace(/\]/g," ] ").replace(/\s+/g," ").toLocaleLowerCase();
        cmd = this.i18nToen(cmd);
        cmd = cmd.replace(/(\(?)\s?(\d*)\s?([*+-/]+)\s?(\d*)\s?(\)?)/g," $1$2$3$4$5 ");//去掉运算符与数字间的空格
        
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
        //console.debug("传入分析："+arr);
        if(arr.length ==0) return;

        let word = arr.shift();
        let rsl_cmd=[];
        if(this.KeyWord.has(word)||this.Lexical.has(word)){
            rsl_cmd.push(this.Lexical.get(word).bind(this)(arr,word));

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
    c2end(arr,word){
        let _c = new Cmd(word);
        _c.param = arr.shift();
        arr.length = 0;
        return _c;
    }

    repeat(arr){
        let _c = this.c1n1(arr,"repeat");
        let tk = arr.shift();
        if(tk!=="["){
            throw new Error("Expected token [ before "+tk);
        }

        let lv = 0;
        let childCMD=[];
        let c="";
        do{
            c = arr.shift();
            if(c == "[") lv++;
            if(c=="]") lv--;

            if(lv >= 0) childCMD.push(c);
        }while(arr.length>0 && lv!=-1);

        if(lv>=0){
            throw new Error("Repeat Error:Unexpected end of input");
        }

        _c.sub_cmd = this.analysis(childCMD);

        return _c;
    }

}

//指令逻辑控制
class WebLogo{
    constructor(home){
        this.La = new PCLogo();
        // this.fun = new Map([
        //     ["fd",this.fd],["bk",this.bk],["lt",this.lt],["rt",this.rt],["repeat",this.repeat]
        //     ,["?",this.help],["help",this.help],["home",this.home],["cs",this.cs]
        // ]);

        this.fun = new Map();
        let tF = (cmd)=>{throw new Error(`E00001|${cmd.name}`);}
        for(let c of COMMEND){
            this.fun.set(c, this[c] || tF);            
        }

        this.i18n = this.La.i18n.bind(this.La);

        this.pos = null;
        this.sln = 1; //step longth
        //this.temp_path = [];
        this.drawCmds = [];
        this.homePos = home;
        
    }
    
    get angle(){return this.__ag__;}
    set angle(ag){
        if(ag >= 360) ag = ag%360;
        while(ag < 0) ag += 360;
        this.__ag__ = ag;
    }

    /**
     * 将简单指令转换为绘画指令
     * @param {*基本指令序列} cmd 
     * @param {*当前角度} curAngle 
     * @param {*当前位置} pos 
     */
    do(cmd,curAngle,pos){
        let cmdObj = this.La.compile(cmd);

        this.drawCmds = [new DrawCmd({path:[new Vector2D(pos)]})];
        this.angle = curAngle;
        this.pos = pos;
        this.exe(cmdObj);

        return this.drawCmds;//{path:this.temp_path,status:this.status};
    }

    exe(cmd){
        for(let c of cmd){
            this.fun.get(c.name).bind(this)(c);
        }
    }

    /* **************LOGO 绘画指令 ****************/
    fd(cmd){
        let ag = DEG2RAG(this.angle);
        let l = cmd._param*this.sln;
        this.pos.AddIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));
        //this.temp_path[this.temp_path.length - 1].push(new Vector2D(this.pos));
        let dCmd = this.drawCmds[this.drawCmds.length - 1];
        dCmd.path.push(new Vector2D(this.pos));
    }
    bk(cmd){
        let ag = DEG2RAG(this.angle);
        let l = cmd._param*this.sln;
        this.pos.MinusIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));
        //this.temp_path[this.temp_path.length - 1].push(new Vector2D(this.pos));
        let dCmd = this.drawCmds[this.drawCmds.length - 1];
        dCmd.path.push(new Vector2D(this.pos));
    }
    lt(cmd){this.angle -= cmd._param;}
    rt(cmd){this.angle += cmd._param;}

    repeat(cmd){
        for(let i=0;i<cmd.param;i++){
            this.exe(cmd.sub_cmd);
        }
    }


    /* **************LOGO 操作指令 ****************/
    home(cmd){
        this.angle = 0;
        this.pos.Copy(this.homePos);
        this.drawCmds.push(new DrawCmd({path:[new Vector2D(this.pos)]}))
    }

    cs(cmd){
        this.drawCmds = [new DrawCmd({type:"cs"})];
        this.home();
    }

    help(cmd){
        ShowResult("TODO:show help info "+cmd.param);
    }
}

class GameHelper{
    constructor(gameEngine){
        this.version = [1,2,1]
        this.ge = gameEngine;
        let w = this.ge.run.width/2;
        let h = this.ge.run.height/2
        this.pclogo = new WebLogo(new Vector2D(w,h));      
        this.cmdLength = 0;
        this.cmdIndex = 0;
        this.turtle = null;

        this.ge.one("jGE.Scene.Logo.End",this.start.bind(this));

        if(web_logo_lang){//国际化处理
            this.pclogo.i18n(new Map(web_logo_lang.cmd));
        }
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
    createTurtle(){
        let home = this.pclogo.homePos;
        this.turtle = {
            obj:new ShowObj(home),
            pos:new Vector2D(home),
            angle:0,            //角度 0 90 180 270
            showStyle:0
            
            ,goto(pos,angle){
                this.pos.Copy(pos);
                this.obj.Copy(pos);
                this.angle = angle;
                this.obj.angle = DEG2RAG(angle)+π/2;
            }
        };
        this.turtle.obj.index = 1000;
        this.turtle.obj.add(new $tk_font({text:'🐙',styleType:'fill',style:'rgba(255,0,0,1)',font:'16px serif',pos:[0,0]}));
        this.ge.add(this.turtle.obj);
        this.curShowItem = [];
    }

    start(){
        //console.trace(this)
        this.createTurtle();

        //环境初始化
        ShowResult(`Web Logo [ver ${this.version.join(".")}]`);
        ShowResult("Copyright © VMWed.COM 2017");
        //ShowResult("Try 'help' or '?' for more information.");
        ShowResult("说明（临时）：https://github.com/C0618C/jGE/blob/master/WebLogo/README.md")
        ShowResult("　");
        let ip_bar = document.getElementById("cmd_input");
        ip_bar.removeAttribute("disabled");
        ip_bar.focus();
    }

    do(cmd){
        let dCmd = this.pclogo.do(cmd,this.turtle.angle,this.turtle.pos);

        this.turtle.goto(this.pclogo.pos,this.pclogo.angle);

        let newpath = new ShowObj(0,0);
        for(let dC of dCmd){
            switch(dC.type){
                case "path":
                    if(dC.path.length == 1){
                        console.debug("监控到只有一个点的路径");
                        continue;
                    }
                    newpath.add(new $tk_path({styleType:'stroke',style:"#808080 1 round round" ,points:dC.path}));
                    break;
                case "cs":
                    for(let s of this.curShowItem) s.isDel = true;
                    newpath = new ShowObj(0,0);
                    this.curShowItem = [];
                    break;
            }

        }
        this.curShowItem.push(newpath);
        this.ge.add(newpath);
    }
}

(function(){
    let KeyMap = new Map([[13,"Enter"],[38,"Up"],[40,"Down"]]);

    let cmd_show_height=222+20;
    //let web_logo = new WebLogo();
    
    let myHeight = document.documentElement.clientHeight-cmd_show_height;

    let x = new jGE({width:document.documentElement.clientWidth,height:myHeight});
    let game = new GameHelper(x);

    let vp = document.getElementById("view_port")
    vp.appendChild(x.GetDom());
    vp.style.height = myHeight+"px";
    
    let cmd_win = document.getElementById("cmd_log");
    cmd_win.style.width = document.documentElement.clientWidth+20+"px";
    let ip_bar = document.getElementById("cmd_input");
    ip_bar.addEventListener("keyup",function(event){
        if(KeyMap.get(event.keyCode) == "Enter"){
            let cmd = this.value.replace(/\r|\n/," ");
            ShowResult(cmd);            
            this.value = "";
            try{
                game.do(cmd);
            }catch(e){
                ShowResult(e,{error:true});
            }
        }else if(KeyMap.get(event.keyCode) == "Up"){
            this.value =game.getLastCmd();
        }else if(KeyMap.get(event.keyCode) == "Down"){
            this.value =game.getNextCmd();
        }
    });
    
    //DEBUG:抛出Weblogo
    window.weblogo = x;
})();

function ShowResult(text,{error=false}={}){
    let cmd_win = document.getElementById("cmd_log");
    let p = document.createElement("p");
    p.textContent = text;
    if(error) p.style.color="#a94442";
    cmd_win.appendChild(p);
    cmd_win.scrollTop = cmd_win.scrollHeight;
}

function DEG2RAG(ag){
    return π*ag/180-π/2;//-0.5π是为了将y轴正方形朝下
}