/**
 * @desc amWiki 工作端·自动化模块
 * @author Tevin
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
    //当文库数量变化时
    onLibrariesChange: null,
    //监听发起
    start: function (state) {
        if (state.libraryList.length == 0) {
            return;
        }
        var that = this;
        //检查library是否仍然存在，删除不存在的库
        state.libraryList = directories.eachLibrary(state.libraryList);
        var libraryMD5 = {};
        for (var i = 0; i < state.libraryList.length; i++) {
            libraryMD5[state.libraryList[i]] = state.libraryMD5[state.libraryList[i]];
        }
        state.libraryMD5 = libraryMD5;
        //监听用户操作
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.onDidDispatch(function (e) {
            //console.log('commands:', e.type);
            //重命名、新增文件夹或文件、创建副本事件
            if (/core\:confirm/.test(e.type) && e.target.className == 'editor mini is-focused') {
                that.toCheckLib(state);
            }
            //删除、剪切、粘帖文件事件
            else if (/tree-view\:(remove|cut|paste)/.test(e.type)) {
                that.toCheckLib(state);
            }
            //删除项目文件夹事件
            else if (e.type == 'tree-view:remove-project-folder') {
            }
        }));
        //当编辑器打开一个文件时的回调
        this.subscriptions.add(atom.workspace.onDidOpen(function () {
        }));
        //当项目(路径)数量变化时的回调(即添加或删除项目)
        this.subscriptions.add(atom.project.onDidChangePaths(function (list) {
            //文库列表比对，移除失效，添加新增
            var list2 = [];
            for (var i = 0; i < list.length; i++) {
                list[i] = list[i].replace(/\\/g, '/') + '/library/';
                for (var j = 0; j < state.libraryList.length; j++) {
                    if (list[i] == state.libraryList[j]) {
                        list2.push(state.libraryList[j]);
                        list[i] = null;
                    }
                }
            }
            for (var k = 0; k < list.length; k++) {
                if (list[k] && directories.isAmWiki(list[k])) {
                    list2.push(list[k]);
                }
            }
            state.libraryList = list2;
            //MD5同步变化
            var libraryMD5 = {};
            for (var ii = 0; ii < state.libraryList.length; ii++) {
                libraryMD5[state.libraryList[ii]] = state.libraryMD5[state.libraryList[ii]];
            }
            state.libraryMD5 = libraryMD5;
            //回调通知 main.js 文库数已变化
            that.onLibrariesChange && that.onLibrariesChange();
        }));
        //从树形模块监听拖拽操作
        atom.packages.activatePackage('tree-view').then(function (pkg) {
            that.treeView = pkg.mainModule.treeView;  //目录树主对象
            that.treeState = pkg.mainModule.state;  //目录树全局状态
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
            //如果atom插件设置“得到焦点时检查库变化”项处于开启状态
            if (atom.config.get('amWiki.checkLibraryOnWindowFocus')) {
                if (Date.now() - lastTimestamp > 30000) {
                    that.toCheckLib(state);
                }
            }
        });
        //当atom启动时，如果插件设置“启动时全量检查文库变化”项处于开启状态，全量检查文库
        if (atom.config.get('amWiki.checkAllLibraryOnAtomStart')) {
            for (var l = 0; l < state.libraryList.length; l++) {
                this.checkLibrary(state, state.libraryList[l]);
            }
        }
    },
    //准备检查文库
    toCheckLib: function (state, curLibrary, recursive) {
        var that = this;
        //当存在curLibrary参数时，直接检查此文库
        if (curLibrary) {
            this.checkLibrary(state, curLibrary);
        }
        //当不存在curLibrary参数时，尝试获取当前库
        else {
            //如果treeView已经准备完毕
            if (this.treeView && this.treeView.selectedPath) {
                curLibrary = this.treeView.selectedPath.replace(/library(.|\s)*$/, 'library/').replace(/\\/g, '/');
                //如果treeView当前路径包含library
                if (curLibrary && curLibrary.indexOf('library') >= 0) {
                    this.checkLibrary(state, curLibrary);
                }
                //如果treeView当前路径补/library/字段后，是已存在的wiki
                else if (typeof state.libraryMD5[curLibrary + '/library/'] != 'undefined') {
                    this.checkLibrary(state, curLibrary + '/library/');
                }
                //从treeState获取路径
                else if (this.treeState && this.treeState.selectedPath) {
                    curLibrary = this.treeState.selectedPath.replace(/library(.|\s)*$/, 'library/').replace(/\\/g, '/');
                    //如果treeState当前路径包含library
                    if (curLibrary && curLibrary.indexOf('library') >= 0) {
                        this.checkLibrary(state, curLibrary);
                    }
                    //如果treeState当前路径补/library/字段后，是已存在的wiki
                    else if (typeof state.libraryMD5[curLibrary + '/library/'] != 'undefined') {
                        this.checkLibrary(state, curLibrary + '/library/');
                    }
                    //如果treeState当前路径也不匹配，不检查文库更新
                }
            }
            //如果treeView未准备完毕，0.2秒后重新检查，且最多只递归3次
            else {
                setTimeout(function () {
                    recursive = recursive ? recursive + 1 : 1;
                    if (recursive <= 3) {
                        that.toCheckLib(state, curLibrary, recursive);
                    }
                }, 200);
            }
        }
    },
    //检查文库变化
    checkLibrary: function (state, curLibrary) {
        curLibrary = curLibrary.split('library/')[0] + 'library/';
        var libHas = false;
        for (var i = 0; i < state.libraryList.length; i++) {
            if (state.libraryList[i] == curLibrary) {
                libHas = true;
            }
        }
        if (!libHas) {
            return;
        }
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
        this.subscriptions && this.subscriptions.dispose();
    }
};