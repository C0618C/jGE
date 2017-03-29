let web_logo_i18n = {
    name: "中文",
    type: "zh-CN",
    cmd: [],
    err: [
        ["E00001", "抱歉，指令'$1'尚未实现，请更新到最新版后再试。"],
        ["E00002", "指令'$1'不能嵌套使用。输入命令 help $1 了解更多信息。"],
        ["E00003", "'$1'为Logo指令，不能用于过程名。"]
    ]
}
web_logo_i18n.cmd.push(["前进", "fd"], ["后退", "bk"], ["左转", "lt"], ["右转", "rt"], ["重复", "rp"], ["回家", "home"], ["帮助", "help"], ["清屏", "cs"]);
web_logo_i18n.cmd.push(["落笔","pd"],["抬笔","pu"]);