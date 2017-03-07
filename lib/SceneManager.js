class SceneManager extends Manager{
    constructor(_jGE){
        super(_jGE,"场景调度管理"); 

        _jGE.one("jGE.Config.Loaded.scene",this.InitScene.bind(this));
        _jGE.one("jGE.Config.Loaded",this.PlayScene.bind(this));

        this.sceneCfg=new Map();
        this.nextScene = "";            //将要播放的下一场景

        this.Logo();
    }

    InitScene(cfg){     //从配置文件初始化场景设置
        cfg.forEach(cf =>{
            console.log("AAAAA::"+JSON.stringify( cfg))

            // cf.setting.forEach(c=>{
            //     if(c.default) this.nextScene = c.id;
            //     this.sceneCfg.set(c.id,c);
            // })
        });
        
    }

    PlayScene(){
        // let curSenceCfg = this.sceneCfg.get(this.nextScene);
        // this.nextScene = curSenceCfg.prepare;
        // this._jGE.broadcast("jGE.SceneChange.Start",curSenceCfg.id);

        //console.debug(`切换场景${curSenceCfg.id}`);
    }

    //用于显示Logo的场景
    Logo(){
        console.log("开始Logo展示");
        let font = '180px \'微软雅黑\'';
        let bL = 130;
        let pos = new Vector2D(this._jGE.run.width/2,this._jGE.run.height/2);
        let _logo_jGE = new ShowObj(pos.Add({x:180,y:-20}));        
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#555555',font:font,pos:[4,4]}))
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#808080',font:font,pos:[3,3]}))
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#aaaaaa',font:font,pos:[2,2]}))
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'white',font:font,pos:[0,0]}))

        let _logo_jGE_ico = new ShowObj(pos.Add({x:-180,y:0}));
        _logo_jGE_ico.add(new $tk_font({text:'🐉',styleType:'fill',style:'rgba(255,0,0,0.82)',font:'200px serif',pos:[0,-10]}));
        _logo_jGE_ico.add(new $tk_font({text:'🐉',styleType:'stroke',style:'rgba(255,255,255,0.8) 5',font:'200px serif',pos:[0,-10]}));        
        _logo_jGE_ico.add(new $tk_path({styleType:'stroke',style:"#808080 20 round round" ,points:[[-bL,-bL],[bL,-bL],[bL,bL],[-bL,bL],-1],pos:[2,2]}));
        _logo_jGE_ico.add(new $tk_path({styleType:'stroke',style:"rgba(255,255,255,0.9) 20 round round" ,points:[[-bL,-bL],[bL,-bL],[bL,bL],[-bL,bL],-1],pos:[0,0]}));

        this._jGE.add(_logo_jGE);
        this._jGE.add(_logo_jGE_ico);

    }

}