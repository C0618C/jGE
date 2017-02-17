class UT{
    static Auto_Test(x){
        // this.Test_tk_Path(x);
        // this.Test_tk_Text(x);
        this.Test_tk_Script(x);
    }
    static Test_tk_Path(x){
        console.info("开始执行-显示对象-路径部件测试");
        console.profile("tk_path_001");
        let p1 = new $tk_path({styleType:'fill',style:'blue',points:[[0,20],[-10,-15],[10,-15]],pos:[30,0]});
        let p2 = new $tk_path({styleType:'both',style:{fillStyle:"red",strokeStylest:"yellow 2"} ,points:[[0,-20],[-10,15],[10,15],-1],pos:[-30,0]});
        let s1 = new ShowObj(300,500);
        s1.ObjManager.add(p1);
        s1.ObjManager.add(p2);
        x.ObjManager.add(s1);

        setInterval(()=>{s1.angle+=0.01;if(s1.angle>=2*π)s1.angle-=2*π;},32);
        console.profileEnd("tk_path_001");
    }

    static Test_tk_Text(x){
        console.info("开始执行-显示对象-文本部件测试");
        console.profile("tk_text_001");
        let f1 = new $tk_font({text:'ABCDEFG',styleType:'stroke',style:'green 3',font:'80px serif',pos:[0,80]});
        let f2 = new $tk_font({text:'HELLOW WORD',style:'orange',font:'50px serif',pos:[0,-80]});
        let s1 = new ShowObj(500,500);
        s1.ObjManager.add(f1);
        s1.ObjManager.add(f2);
        
        x.ObjManager.add(s1);

        setInterval(()=>{s1.angle+=0.01;if(s1.angle<0)s1.angle+=2*π;},32);
        console.profileEnd("tk_text_001");
    }

    static Test_tk_Script(x){
        console.info("开始执行-显示对象-文本部件测试");
        console.profile("tk_script_001");
        let img = new Image();

        img.src = "https://img.alicdn.com/tps/i2/TB1bNE7LFXXXXaOXFXXwFSA1XXX-292-116.png"
        img.onload = e => {
            let i1 = new $tk_sprit({img:img});
            let s1 = new ShowObj(500,300);
            i1.scale(0.25);
            s1.ObjManager.add(i1);
            x.ObjManager.add(s1);

            setInterval(()=>{s1.angle+=0.01;if(s1.angle<0)s1.angle+=2*π;},32);
        }

        console.profileEnd("tk_script_001");
    }
}

(function(){
    ;
})();