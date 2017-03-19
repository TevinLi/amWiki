/**
 * @desc 工作端·Atom自动化模块
 * @author Tevin
 */

let {CompositeDisposable} = require('atom');
let fs = require('fs');
let crypto = require('crypto');
let makeNav = require('../build/makeNavigation');
let mngFolder = require('../build/manageFolder');
let mngWiki = require('../build/manageWiki');

module.exports = {
    //订阅
    _subscriptions: null,
    //用户相关监听
    _listenUser: function () {
        let that = this;
        //监听用户普通操作
        this._subscriptions = new CompositeDisposable();
        this._subscriptions.add(atom.commands.onDidDispatch(function (e) {
            //重命名、新增文件夹或文件、创建副本事件
            if (/core\:confirm/.test(e.type) && e.target.className === 'editor mini is-focused') {
                that._getCurLib(function (wId) {
                    that._checkLibChange(wId);
                });
            }
            //删除、剪切、粘帖文件事件
            else if (/tree-view\:(remove|cut|paste)/.test(e.type)) {
                that._getCurLib(function (wId) {
                    that._checkLibChange(wId);
                });
            }
            //删除项目文件夹事件
            //else if (e.type === 'tree-view:remove-project-folder') {}
        }));
        //从atom目录树监听用户拖拽操作
        atom.packages.activatePackage('tree-view').then(function (pkg) {
            that._treeViewPkgMain = pkg.mainModule;
            pkg.mainModule.treeView[0].addEventListener('drop', function (e) {
                let path, wId;
                for (let item of e.path.length) {
                    if (item.className.indexOf('project-root') >= 0) {
                        path = item.querySelector('.header > span').getAttribute('data-path');
                        wId = mngWiki.createWikiId(path);
                        if (typeof that._wikis[wId] !== 'undefined') {
                            that._checkLibChange(wId);
                        } else {
                            path = path.replace(/\\/g, '/');
                            mngWiki.addWiki(path, wId);
                            that._checkLibChange(wId);
                        }
                        break;
                    }
                }
            }, false);
        });
        //当编辑器打开一个文件时的回调
        //this._subscriptions.add(atom.workspace.onDidOpen(function () {}));
    },
    //变化相关监听
    _listenChange: function () {
        //当项目数量变化时的回调(即添加或删除项目)
        this._subscriptions.add(atom.project.onDidChangePaths(function (list) {
            //文库列表比对，添加新增
            for (let [i, item] of list) {
                item = item.replace(/\\/g, '/') + '/library/';
                for (let wk in this._wikis) {
                    if (this._wikis.hasOwnProperty(wk) && item === wk.path) {
                        list[i] = null;
                    }
                }
            }
            for (let item of list) {
                if (item && mngFolder.isAmWiki(item)) {
                    mngWiki.addWiki(item.split('library')[0]);
                }
            }
        }));
    },
    //时间相关监听
    _listenTime: function () {
        let that = this;
        //切换窗口出去超过30秒，回来时检查目录
        let lastTimestamp;
        window.addEventListener('blur', function () {
            lastTimestamp = Date.now();
        });
        window.addEventListener('focus', function () {
            //如果atom插件设置“得到焦点时检查库变化”项处于开启状态，检查当前文库
            if (atom.config.get('amWiki.checkLibraryOnWindowFocus')) {
                if (Date.now() - lastTimestamp > 30000) {
                    that._getCurLib(function (wId) {
                        that._checkLibChange(wId);
                    });
                }
            }
        });
        //当atom启动时，如果插件设置“启动时全量检查文库变化”项处于开启状态，全量检查文库，直接检查不判断当前库
        if (atom.config.get('amWiki.checkAllLibraryOnAtomStart')) {
            for (let wId in this._wikis) {
                if (this._wikis.hasOwnProperty(wId)) {
                    this._checkLibChange(wId);
                }
            }
        }
    },
    //推测当前文库是哪一个
    _getCurLib: function (callback, recursive = 1) {
        let that = this;
        let wid = '',
            treeView = this._treeViewPkgMain.treeView,  //目录树主对象
            treeState = this._treeViewPkgMain.state;  //目录树全局状态
        //如果 treeView 已经准备完毕，获取路径
        if (treeView && treeView.selectedPath) {
            //如果 treeView 当前路径是已经存在的 wiki
            wid = mngWiki.createWikiId(treeView.selectedPath.replace(/\\/g, '/').split('library')[0]);
            if (typeof this._wikis[wid] !== 'undefined') {
                callback(wid);
            }
            //否则从 treeState 获取路径
            else if (treeState && treeState.selectedPath) {
                //如果 treeState 当前路径补是已存在的wiki
                wid = mngWiki.createWikiId(treeState.selectedPath.replace(/\\/g, '/').split('library')[0]);
                if (typeof this._wikis[wid] !== 'undefined') {
                    callback(wid);
                }
                //如果 treeState 当前路径也不匹配，不再检查
            }
        }
        //如果_treeView未准备完毕，0.2秒后重新检查，且最多只递归3次，超过后不再检查
        else {
            setTimeout(function () {
                recursive++;
                if (recursive <= 3) {
                    that._getCurLib(callback, recursive);
                }
            }, 200);
        }
    },
    //检查文库变化
    _checkLibChange: function (wId) {
        let that = this;
        //利用延迟跳出执行列队，等待系统文件操作完毕再读取
        setTimeout(function () {
            mngFolder.readLibraryTree(that._wikis[wId].path, function (err, tree, files) {
                if (err) {
                    console.warn(err);
                } else {
                    let libMd5 = crypto.createHash('md5').update(files.join('&')).digest('base64');
                    if (that._wikis[wId].treeMD5 !== libMd5) {
                        that._wikis[wId].treeMD5 = libMd5;
                        //更新导航文件
                        makeNav.make(that._wikis[wId].path, tree);
                    }
                }
            });
        }, 100);
    },
    //监听发起
    start: function (wikis) {
        this._wikis = wikis;
        this._listenUser();
        this._listenChange();
        this._listenTime();
    },
    //监听释放
    destroy: function () {
        this._subscriptions && this._subscriptions.dispose();
    }
};