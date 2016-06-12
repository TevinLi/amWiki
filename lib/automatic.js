/**
 * amWiki automatic
 */

var environment = require('atom'),
    Directory = environment.Directory;
var fs = require("fs");
var makeNav = require('./makeNav');
var directories = require('./directories');

//数据缓存
var cache = {
    //所有监听器
    watchers: {},
    //所有目录
    folders: {}
};

/**
 *  @desc 方法:单个文件夹监听
 *  @param dirPath string,required 文件夹路径
 *  @param callback function 文件夹内容变化时的回调
 *  @retrun directory
 */
var watchDir = function (dirPath, callback) {
    var dir = new Directory(dirPath);
    if (dir.isDirectory()) {
        //如果此文件夹未监听，加入监听
        if (!cache.watchers[dirPath]) {
            cache.watchers[dirPath] = dir.onDidChange(function () {
                callback && callback();
            });
        }
        return dir;
    } else {
        return false;
    }
};

module.exports = {
    //监听发起
    start: function (state) {
        var list = state.libraryList;
        if (!list || list.length == 0) {
            return;
        }
        var that = this;
        //循环检查library
        state.libraryList = directories.eachLibrary(list, function (item) {
            that.addLibWatcher(item);
        });
    },
    //监听单个文库
    addLibWatcher: function (item) {
        var that = this;
        //深度读取library文件夹
        directories.readLibraryDir(item, function (err, tree, folders) {
            if (err) {
                console.error(err);
            } else {
                //监听每个文件夹
                for (var i = 0; i < folders.length; i++) {
                    watchDir(folders[i], function () {
                        that.dirChange(item);
                    });
                }
                cache.folders[item] = folders;
            }
        });
        console.info('amWiki-watcher: ', item);
    },
    //文件夹变化时，修正监听
    dirChange: function (item) {
        var that = this;
        //三层深度读取library文件夹
        directories.readLibraryDir(item, function (err, tree, folders) {
            if (err) {
                console.error(err);
            } else {
                //比较文件夹变化，新增增加监听，减少消除监听
                var tempFolders = [];
                for (var i = 0; i < cache.folders[item].length; i++) {
                    var hsSame = false;
                    for (var j = 0; j < folders.length; j++) {
                        //当存在相同地址，新列表减去
                        if (cache.folders[item][i] == folders[j]) {
                            hsSame = true;
                            folders.splice(j, 1);
                            tempFolders.push(cache.folders[item][i]);
                            break;
                        }
                    }
                    //如果新列表不存在，移除监听
                    if (!hsSame) {
                        cache.watchers[cache.folders[item][i]].dispose();
                    }
                }
                //新列表新增文件夹加监听
                for (var k = 0; k < folders.length; k++) {
                    watchDir(folders[k], function () {
                        that.dirChange(item);
                    });
                    tempFolders.push(folders[k]);
                }
                //更新旧列表
                cache.folders[item] = tempFolders;
            }
            //更新导航文件
            makeNav.make(item, tree);
        });
    },
    //销毁所有监听
    destroy: function () {
        for (var p in cache.watchers) {
            if (cache.watchers.hasOwnProperty(p)) {
                cache.watchers[p].dispose();
            }
        }
    }
};