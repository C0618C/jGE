//指令对象
class Cmd{
    constructor(name){
        this.name = name;
    }

    set param(p){this._param = p;}
    get param(){return this._param;}

    get sub_cmd(){return this._subcmd_;}
    set sub_cmd(cmd){this._subcmd_ = cmd;}
}

//词法工具
class PCLogo{
    constructor(){
        this.KeyWord = new Set([
            "[","]"
        ]);

        this.Lexical = new Map([
            ["fd",this.c1n1],["bk",this.c1n1],["lt",this.c1n1],["rt",this.c1n1],["repeat",this.repeat],
            ["help",this.c2end],["?",this.c2end]
        ]);

        this.cmd_history=new Map();

        this.__getANum = (s)=>{return /[*/\-+0-9.()]+/.test(s)?eval(s):NaN;};//计算算式
    }

    /**
     * 预处理指令 并分析
     * @param {*用户输入的指令串} cmd 
     */
    compile(cmd){
        /* repeat 24[fd 40 lt 45 fd 15 bk 15 rt 90 fd 15 bk 15  lt 45 bk 40 rt 360/24] */

        //预处理
        cmd = cmd.replace(/\[/g," [ ").replace(/\]/g," ] ").toLocaleLowerCase();
        cmd = cmd.replace(/(\(?)\s?(\d*)\s?([*+-/]+)\s?(\d*)\s?(\)?)/g," $1$2$3$4$5 ");//去掉运算符与数字间的空格
        
        let rsl = null;
        if(!this.cmd_history.has(cmd)){
            rsl = this.analysis(cmd.match(/[^\s\r\n]+/ig));
            this.cmd_history.set(cmd,rsl);
        }else{
            rsl = this.cmd_history.get(cmd);
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
     * 命令-命令 式指令，一般用于help
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

        let arr_tail=[];
        do{
            arr_tail.unshift(arr.pop());
        }while(arr_tail[0]!="]" && arr.length > 0);

        if(arr_tail[0]!="]"){
            throw new Error("Repeat Error:Unexpected end of input");
        }
        arr_tail.shift();
        _c.sub_cmd = this.analysis(arr);
        arr.push(...arr_tail);
        return _c;
    }   

}

//指令逻辑控制
class WebLogo{
    constructor(){
        this.La = new PCLogo();

        this.sln = 2; //step longth

        this.fun = new Map([
            ["fd",this.fd],["bk",this.bk],["lt",this.lt],["rt",this.rt],["repeat",this.repeat]
            ,["?",this.help],["help",this.help]
        ]);

        this.pos = null;

        this.temp_path = [];
    }
    
    get angle(){return this.__ag__;}
    set angle(ag){
        if(ag >= 360) ag = ag%360;
        while(ag < 0) ag += 360;
        this.__ag__ = ag;
    }

    do(cmd,curAngle,pos){        
        let cmdObj = this.La.compile(cmd);
        
        this.angle = curAngle;
        this.pos = pos;
        this.temp_path = [new Vector2D(pos)];
        this.exe(cmdObj);

        return this.temp_path;
    }

    exe(cmd){
        for(let c of cmd){
            this.fun.get(c.name).bind(this)(c);
        }
    }

    /* **************LOGO 绘画指令 ****************/
    fd(cmd){
        let ag = DEG2RAG(this.angle);
        let curP = this.pos;
        let l = cmd._param*this.sln;
        this.pos.AddIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));

        this.temp_path.push(new Vector2D(this.pos));
    }
    bk(cmd){
        let ag = DEG2RAG(this.angle);
        let curP = this.pos;
        let l = cmd._param*this.sln;
        this.pos.MinusIn(new Vector2D(Math.cos(ag)*l,Math.sin(ag)*l));

        this.temp_path.push(new Vector2D(this.pos));
    }
    lt(cmd){
        //console.log(`左转 ${cmd.param} 度`);
        this.angle -= cmd._param;
    }
    rt(cmd){
        //console.log(`右转 ${cmd.param} 度`);
        this.angle += cmd._param;
    }

    repeat(cmd){
        //console.log("重复执行开始！");
        for(let i=0;i<cmd.param;i++){
            this.exe(cmd.sub_cmd);
        }
        //console.log("重复执行结束！");
    }


    help(cmd){
        ShowResult("TODO:show help info "+cmd.param);
    }
}

class GameHelper{
    constructor(gameEngine){
        this.pclogo = new WebLogo();
        this.ge = gameEngine;
        this.cmdLength = 0;
        this.cmdIndex = 0;
        //this.do = this.pclogo.do.bind(this.pclogo);
        this.turtle = null;

        this.ge.one("jGE.Scene.Logo.End",this.start.bind(this));
    }

    get cmds(){
        let cmds = [...this.pclogo.La.cmd_history.keys()];
        if(cmds.length != this.cmdLength){
            this.cmdIndex = cmds.length;
            this.cmdLength=cmds.length;

            //TODO:在localStore里存档
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
        let w = this.ge.run.width/2;
        let h = this.ge.run.height/2
        this.turtle = {
            obj:new ShowObj(w,h),
            home:new Vector2D(w,h),
            pos:new Vector2D(w,h),
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
    }

    start(){
        //console.trace(this)
        this.createTurtle();


        //环境初始化
        ShowResult("Web Logo [v1.0.0]");
        ShowResult("Copyright © VMWed.COM 2017");
        ShowResult("Try 'help' or '?' for more information.");
        ShowResult("　");
        let ip_bar = document.getElementById("cmd_input");
        ip_bar.removeAttribute("disabled");
        ip_bar.focus();
    }

    do(cmd){
        let path = this.pclogo.do(cmd,this.turtle.angle,this.turtle.pos);

        this.turtle.goto(this.pclogo.pos,this.pclogo.angle);        

        let newpath = new ShowObj(0,0);
        newpath.add(new $tk_path({styleType:'stroke',style:"#808080 1 round round" ,points:path,pos:[0,0]}));
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