//▓▉⿴¤§♀📦🏢

class GameMap {
    constructor(data = []) {
        this.data = data;
        this.showobject = null;
        this.box = 0;
        this.done = 0;
        this.target_list = [];
        this.manpos = [0, 0];
        this.width = 0;
        this.height = 0;
    }
    update() {
        this.box = 0;
        this.done = 0;
        this.data.forEach((r, y) => {
            r.forEach((c, x) => {
                switch (c) {
                    case Symbol.for("man"): this.manpos = [x, y]; break;
                    case Symbol.for("done"):
                        this.done++;
                    case Symbol.for("box"):
                        this.box++;
                        break;
                }
            });
        });
    }
}

class LogicHelper {
    constructor() {
        ;
    }
    move(map, tw, pos) {
        let moved = false;
        let cp = pos ? pos : map.manpos.concat();
        let np = cp.concat();
        let toTarget = false;
        switch (tw) {
            case Symbol.for("Up"):
                np[1]--;
                break;
            case Symbol.for("Down"):
                np[1]++;
                break;
            case Symbol.for("Left"):
                np[0]--;
                break;
            case Symbol.for("Right"):
                np[0]++;
                break;
        }
        switch (map.data[np[1]][np[0]]) {
            case Symbol.for("done"):
            case Symbol.for("box"):
                if (pos == undefined) moved = this.move(map, tw, np);
                break;
            case Symbol.for("target"):
                toTarget = true;
            case Symbol.for("grass"):
                moved = true;
                break;
        }

        if (moved) {
            if (toTarget && map.data[cp[1]][cp[0]] == Symbol.for("box")) {
                map.data[np[1]][np[0]] = Symbol.for("done");
                map.data[cp[1]][cp[0]] = Symbol.for("grass");
            } else if (toTarget && map.data[cp[1]][cp[0]] == Symbol.for("done")) {
                map.data[np[1]][np[0]] = Symbol.for("done");
                map.data[cp[1]][cp[0]] = Symbol.for("target");
            } else {
                map.data[np[1]][np[0]] = map.data[cp[1]][cp[0]];
                if (map.data[cp[1]][cp[0]] == Symbol.for("done"))
                    map.data[cp[1]][cp[0]] = Symbol.for("target");
                else
                    map.data[cp[1]][cp[0]] = Symbol.for("grass");
            }
        }

        return moved;
    }
}


class GameHelper {
    constructor(jGE) {
        this._jGE = jGE;
        this.logicHandler = new LogicHelper();
        this.symbolmapping = new Map();
        this.symbolmapping.set("▉", Symbol.for("wall"));
        this.symbolmapping.set("▓", Symbol.for("empty"));
        this.symbolmapping.set("☉", Symbol.for("target"));
        this.symbolmapping.set("□", Symbol.for("box"));
        this.symbolmapping.set("♀", Symbol.for("man"));
        this.symbolmapping.set("⿴", Symbol.for("grass"));
        this.pens = new Map();
        this.pens.set(Symbol.for("wall"), this.__draw_wall);
        this.pens.set(Symbol.for("empty"), this.__draw_empty);
        this.pens.set(Symbol.for("target"), this.__draw_target);
        this.pens.set(Symbol.for("box"), this.__draw_box);
        this.pens.set(Symbol.for("man"), this.__draw_man);
        this.pens.set(Symbol.for("grass"), this.__draw_grass);
        this.pens.set(Symbol.for("done"), this.__draw_done);

        this.level = new Map();

        this.curMap = null;

        this.curLevel = 1;
        this.cellWitdh = 0;

        this.InitMap();
        this._jGE.one("jGE.Scene.Logo.End", () => this.StartLv(1));
    }

    InitMap() {
        this.level.set(1, `
▓▓▓▉▉▉▉▉▉▉▓|
▓▉▉▉⿴⿴⿴⿴⿴▉▓|
▉▉☉⿴⿴□▉▉⿴▉▉|
▉☉☉⿴□⿴□⿴⿴♀▉|
▉☉☉⿴⿴□⿴□⿴▉▉|
▉▉▉▉▉▉▉⿴⿴▉▓|
▓▓▓▓▓▓▉▉▉▉▓|
        `);
    }

    StartLv(lv) {
        this.MakeAMap(lv);
        this.Draw();
    }


    ReadMap(mapStr) {
        let mapObj = new GameMap();
        let map = [[]];
        let r = 0;
        mapStr.split(/\||\n/).forEach((row, i) => {
            if (/^\s*$/.test(row)) return;
            row.match(/.{1}/g).forEach((cell, j) => {
                if (/^\s*$/.test(cell)) return;
                let obj = this.symbolmapping.get(cell);
                map[r].push(obj);
                switch (obj) {
                    case Symbol.for("man"): mapObj.manpos = [i, j]; break;
                    case Symbol.for("box"): mapObj.box++; break;
                    case Symbol.for("target"): mapObj.target_list.push([i, j]); break;
                }
            });
            r++;
            map[r] = [];
        });
        map.pop();
        mapObj.data = map;
        if(mapObj.target_list.length != mapObj.box){
            console.error("游戏配置出错，箱子与目标数量不相等。请检查地图设置。")
        }
        return mapObj;
    }

    MakeAMap(lv) {
        let map = new GameMap(this.ReadMap(this.level.get(lv)));

        map.width = Math.max(...map.data.map(i => i.length));
        map.height = map.data.length;
        this.cellWitdh = Math.min(this._jGE.run.width / map.width, this._jGE.run.height / map.height) / 2 >> 0;
        this.curMap = map;
        this.curMap.update();
    }

    Draw() {
        let mapObj = new ShowObj(100, 100);
        this.curMap.data.forEach((r, i) => {
            r.forEach((c, j) => {
                mapObj.add(this.pens.get(c).bind(this)(j, i));
            });
        });
        this.curMap.showobject = mapObj;
        this._jGE.add(mapObj);
    }

    __draw_cell(i, j) {
        // let l = this.cellWitdh/2>>0;
        // let cell = new ShowObj(i * this.cellWitdh, j * this.cellWitdh);
        // return cell.add(new $tk_path({points:[[-l,-l],[-l,l],[l,l],[l,-l],-1]}));
        return new ShowObj(i * this.cellWitdh, j * this.cellWitdh);
    }
    __draw_wall(i, j) {
        let l = this.cellWitdh / 2 >> 0;
        return this.__draw_cell(i, j).add(new $tk_path({ styleType: 'both', style: { fillStyle: "gray", strokeStylest: "#ddd 1" }, points: [[-l, -l], [-l, l], [l, l], [l, -l], -1] }));
    }
    __draw_box(i, j) {
        let l = (this.cellWitdh / 2 >> 0) - 5;
        return this.__draw_cell(i, j).add(new $tk_path({ styleType: 'fill', style: "white", points: [[-l, -l], [-l, l], [l, l], [l, -l], -1] }));
    }
    __draw_empty(i, j) { return this.__draw_cell(i, j); }
    __draw_grass(i, j) { return this.__draw_cell(i, j).add(new $tk_font({ text: " " })); }
    __draw_man(i, j) { return this.__draw_cell(i, j).add(new $tk_font({ text: "🐙", font: `${(this.cellWitdh * 0.8) >> 0}px 微软雅黑` })); }
    __draw_target(i, j) { return this.__draw_cell(i, j).add(new $tk_ellipse({ r: this.cellWitdh / 3 >> 0 })); }
    __draw_done(i, j) {
        let l = (this.cellWitdh / 2 >> 0) - 5;
        return this.__draw_cell(i, j).add(new $tk_path({ styleType: 'fill', style: "green", points: [[-l, -l], [-l, l], [l, l], [l, -l], -1] }));
    }

    Move(tw) {
        let rsl = this.logicHandler.move(this.curMap, tw);
        if (rsl) {
            this.curMap.showobject.isDel = true;
            this.Draw();
            this.curMap.update();
        }
    }

}

(function () {

    let myHeight = document.documentElement.clientHeight + 2;
    let x = new jGE({ width: document.documentElement.clientWidth, height: myHeight });
    let game = new GameHelper(x);

    let vp = document.getElementById("view_port");
    vp.appendChild(x.GetDom());

    let KeyMap = new Map([[38, Symbol.for("Up")], [39, Symbol.for("Right")], [40, Symbol.for("Down")], [37, Symbol.for("Left")]]);
    document.body.addEventListener("keyup", function (event) {
        if (KeyMap.get(event.keyCode) != undefined) {
            game.Move(KeyMap.get(event.keyCode));
        }

        console.log(event.keyCode)
    });

    window.g = game;

})();