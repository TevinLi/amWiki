/**
 * amWiki automatic
 */

var environment = require('atom'),
    Directory = environment.Directory,
    CompositeDisposable = environment.CompositeDisposable;
var fs = require('fs');
var makeNav = require('./makeNav');
var directories = require('./directories');
var crypto = require('crypto');

module.exports = {
    //订阅
    subscriptions: null,
    //目录树的引用
    treeView: null,
    //监听发起
    start: function (state) {
        if (state.libraryList.length == 0) {
            return;
        }
        var that = this;
        //循环检查library
        state.libraryList = directories.eachLibrary(state.libraryList);
        var libraryMD5 = {};
        for (var i = 0; i < state.libraryList.length; i++) {
            libraryMD5[state.libraryList[i]] = state.libraryMD5[state.libraryList[i]];
        }
        state.libraryMD5 = libraryMD5;
        //监听用户操作
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.onDidDispatch(function (e) {
            //重命名、新增文件夹或文件、创建副本
            if (/core\:confirm/.test(e.type) && e.target.className == 'editor mini is-focused') {
                that.toCheckLib(state);
            }
            //删除、剪切、粘帖文件
            else if (/tree-view\:(remove|cut|paste)/.test(e.type)) {
                that.toCheckLib(state);
            }
        }));
        //拖拽操作监听
        atom.packages.activatePackage('tree-view').then(function (pkg) {
            that.treeView = pkg.mainModule.treeView;
            that.treeViewState = pkg.mainModule.state;
            that.treeView[0].addEventListener('drop', function (e) {
                for (var i = 0; i < e.path.length; i++) {
                    if (e.path[i].className.indexOf('project-root') >= 0) {
                        var path = e.path[i].querySelector('.header > span').getAttribute('data-path');
                        that.toCheckLib(state, path.replace(/\\/g, '/') + '/library/');
                        break;
                    }
                }
            }, false);
        });
        //切换窗口出去超过30秒，回来时检查目录
        var lastTimestamp;
        window.addEventListener('blur', function () {
            lastTimestamp = Date.now();
        });
        window.addEventListener('focus', function () {
            if (atom.config.get('amWiki.checkLibraryOnWindowFocus')) {
                if (Date.now() - lastTimestamp > 30000) {
                    that.toCheckLib(state);
                }
            }
        });
        //当atom启动时，全量检查文库
        if (atom.config.get('amWiki.checkAllLibraryOnAtomStart')) {
            for (var l = 0; l < state.libraryList.length; l++) {
                this.checkLibrary(state, state.libraryList[l]);
            }
        }
    },
    //准备检查文库
    toCheckLib: function (state, curLibrary, recursive) {
        var that = this;
        if (curLibrary) {
            this.checkLibrary(state, curLibrary);
        } else {
            if (this.treeView) {
                curLibrary = this.treeView.selectedPath.replace(/library(.|\s)*$/, 'library/').replace(/\\/g, '/');
                if (curLibrary && curLibrary.indexOf('library') >= 0) {
                    this.checkLibrary(state, curLibrary);
                } else {
                    curLibrary = this.treeViewState.selectedPath.replace(/library(.|\s)*$/, 'library/').replace(/\\/g, '/');
                    if (curLibrary && curLibrary.indexOf('library') >= 0) {
                        this.checkLibrary(state, curLibrary);
                    }
                }
            } else {
                //如果treeView未准备完毕，0.1秒后重新检查，且最多只递归3次
                setTimeout(function () {
                    recursive = recursive ? recursive + 1 : 1;
                    if (recursive <= 3) {
                        that.toCheckLib(state, curLibrary, recursive);
                    }
                }, 100);
            }
        }
    },
    //检查文库变化
    checkLibrary: function (state, curLibrary) {
        //延迟0.1秒，等待系统文件操作完毕再读取
        setTimeout(function () {
            directories.readLibraryDir(curLibrary, function (err, tree, files) {
                if (err) {
                    console.warn(err);
                } else {
                    var libMd5 = crypto.createHash('md5').update(files.join('&')).digest('base64');
                    if (state.libraryMD5[curLibrary] != libMd5) {
                        state.libraryMD5[curLibrary] = libMd5;
                        //更新导航文件
                        makeNav.make(curLibrary, tree);
                    }
                }
            });
        }, 100);
    },
    //释放监听
    destroy: function () {
        this.subscriptions.dispose();
    }
};