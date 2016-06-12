/**
 * amWiki directory manager
 */

var fs = require('fs');

module.exports = {
    //读取文库文件夹
    readLibraryDir: function (path, callback) {
        if (!/library(\\|\/)$/.test(path)) {
            callback('The path is not a library.');
            return;
        }
        var tree = {};
        var folders = [];
        try {
            var files1 = fs.readdirSync(path),
                files2, files3,
                path2, path3, path4;
            folders.push(path);
            //第一层，files1，library直接子级，仅允许为文件夹
            for (var i = 0; i < files1.length; i++) {
                path2 = path + '\\' + files1[i];
                if (fs.statSync(path2).isDirectory(path2)) {
                    try {
                        files2 = fs.readdirSync(path2);
                        folders.push(path2);
                        tree[files1[i]] = {};
                        //第二层，files2，允许为文件夹和文件
                        for (var j = 0; j < files2.length; j++) {
                            path3 = path2 + '\\' + files2[j];
                            if (fs.statSync(path3).isDirectory(path3)) {
                                try {
                                    files3 = fs.readdirSync(path3);
                                    folders.push(path3);
                                    tree[files1[i]][files2[j]] = {};
                                    //第三层，files3，仅允许为文件夹，不再深入
                                    for (var k = 0; k < files3.length; k++) {
                                        path4 = path3 + '\\' + files3[k];
                                        if (!fs.statSync(path4).isDirectory(path4)) {
                                            tree[files1[i]][files2[j]][files3[k]] = false;
                                        }
                                    }
                                } catch(err) {
                                    callback(err);
                                    return;
                                }
                            } else {
                                tree[files1[i]][files2[j]] = false;
                            }
                        }
                    } catch (err) {
                        callback(err);
                        return;
                    }
                }
            }
        } catch (err) {
            callback(err);
            return;
        }
        callback(null, tree, folders);
    },
    //循环检查每个库
    eachLibrary: function (list, stepCallback) {
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
        return list2;
    }
};