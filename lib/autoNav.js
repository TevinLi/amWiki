var fs = require("fs");
var updateNav = require('./updateNav');

var eachLib = function (list, stepCallback, callback) {
    var list2 = [];
    var path = '';
    for (var i = 0; i < list.length; i++) {
        //路径缺乏library字段弃用
        if (list[i].indexOf('library') < 0) {
            continue;
        }
        path = list[i].replace(/\\/g, '/').split('library')[0] + 'library/';
        //路径不存在弃用
        if (!fs.existsSync(path)) {
            continue;
        }
        //路径重复弃用
        var hsPath = false;
        for (var j = 0; j < list2.length; j++) {
            if (list2[j] == list[i]) {
                hsPath = true;
            }
        }
        if (hsPath) {
            continue;
        }
        //有用路径
        list2.push(path);
        stepCallback && stepCallback(list[i]);
    }
    callback && callback(list2);
};

module.exports = {
    watchLibrary: function (list, callback) {
        if (!list || list.length == 0) {
            return;
        }
        var that = this;
        eachLib(list, function (item) {
            that.watcher(item);
        }, function (list2) {
            callback(list2);
        });
    },
    watcher: function (path) {
        try {
            fs.watch(path, function (event, fileName) {
                if (fileName && fileName != '_navigation_.md') {
                    updateNav.readDir(path, function (err, data) {
                        if (!err) {
                            var markdown = updateNav.createMD(data);
                            fs.writeFileSync(path + '_navigation_.md', markdown, 'utf-8');
                        }
                    });
                }
            });
        } catch(e) {
            console.log(e, path);
        }
    },
    //销毁监听
    destroy: function (list) {
        if (list || list.length == 0) {
            return;
        }
        eachLib(list, function (item) {
            for (var i = 0; i < list.length; i++) {
                fs.unwatch(item);
            }
        });
    }
};