class UR {
    static Auto_Test(x) {
        //this.Test_Ajax();

        this.Test_Res(x)
    }

    //
    static Test_Ajax() {
        let rs = new ResourceManager(new jGE());
        rs.Ajax({ url: "res/img/npc01.png", dataType: "image" }).then((e) => {
            document.body.appendChild(e);
            console.log(e)
        })

        window.ss = rs;
    }

    static Test_Res(x) {
        let packageId = "testA";
        let rs = x.ResourceManager;
        let rsid = "Symbol()";
        rs.LoadResPackage(packageId, [{ id: rsid, url: "res/img/npc01.png", dataType: "image" }]);

        x.on("jGE.Resource.Package.Finish",id=>{
            if(id == packageId){
                let im = rs.GetRes(rsid,packageId)
                document.body.appendChild(im);
            }
        })

    }

    static Test_Audio() {
        let rs = new ResourceManager(new jGE());
        rs.Ajax({ url: "res/skycity.mp3", dataType: "audio" }).then((e) => {
            document.body.appendChild(e);
            e.play();
            console.log(e)
        })

        window.ss = rs;
    }
}