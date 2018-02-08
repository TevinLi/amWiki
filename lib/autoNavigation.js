/**
 * 工作端 - Atom - 自动化模块
 * @author Tevin
 */

const {CompositeDisposable} = require('atom');
const fs = require('fs');
const crypto = require('crypto');
const makeNav = require('../build/makeNavigation');
const mngFolder = require('../build/manageFolder');
const mngWiki = require('../build/manageWiki');

const autoNavigation = (function () {
    return {
        /**
         * 订阅
         * @private
         */
        _subscriptions: null,
        /**
         * atom 树形导航模块的引用
         * @private
         */
        _treeViewPkgMain: null,
        /**
         * wiki 列表记录
         * @private
         */
        _wikis: null,
        /**
         * 用户相关监听
         * @private
         */
        _listenUser: function () {
            //监听用户普通操作
            this._subscriptions = new CompositeDisposable();
            this._subscriptions.add(atom.commands.onDidDispatch((e) => {
                //重命名、新增文件夹或文件、创建副本等事件
                if (/core\:confirm/.test(e.type)) {
                    this._getCurLib((wId) => {
                        this._checkLibChange(wId);
                    });
                }
                //删除、剪切、粘帖文件事件
                else if (/tree-view\:(remove|cut|paste)/.test(e.type)) {
                    this._getCurLib((wId) => {
                        this._checkLibChange(wId);
                    });
                }
                //删除项目文件夹事件
                //else if (e.type === 'tree-view:remove-project-folder') {}
            }));
            //从atom目录树监听用户拖拽操作
            atom.packages.activatePackage('tree-view').then((pkg) => {
                this._treeViewPkgMain = pkg.mainModule;
                const elm = pkg.mainModule.treeView[0] || pkg.mainModule.treeView.element;
                elm.addEventListener('drop', (e) => {
                    let path, wId;
                    for (let item of e.path) {
                        if (item.className.indexOf('project-root') >= 0) {
                            path = item.querySelector('.header > span').getAttribute('data-path');
                            wId = mngWiki.createWikiId(path);
                            if (typeof this._wikis[wId] !== 'undefined') {
                                this._checkLibChange(wId);
                            } else {
                                path = path.replace(/\\/g, '/');
                                mngWiki.addWiki(path, wId);
                                this._checkLibChange(wId);
                            }
                            break;
                        }
                    }
                }, false);
            });
            //当编辑器打开一个文件时的回调
            //this._subscriptions.add(atom.workspace.onDidOpen(function () {}));
        },
        /**
         * 变化相关监听
         * @private
         */
        _listenChange: function () {
            //当项目数量变化时的回调(即添加或删除项目)
            this._subscriptions.add(atom.project.onDidChangePaths((list) => {
                //文库列表比对，添加新增
                for (let [i, item] of list) {
                    item = item.replace(/\\/g, '/') + '/library/';
                    for (let wId in this._wikis) {
                        if (this._wikis.hasOwnProperty(wId) && item === this._wikis[wId].path) {
                            list[i] = null;
                        }
                    }
                }
                for (let item of list) {
                    if (item && mngFolder.isAmWiki(item)) {
                        mngWiki.addWiki(item.replace(/\\/g, '/') + '/');
                    }
                }
            }));
        },
        /**
         * 时间相关监听
         * @private
         */
        _listenTime: function () {
            //切换窗口出去超过30秒，回来时检查目录
            let lastTimestamp;
            window.addEventListener('blur', () => {
                lastTimestamp = Date.now();
            });
            window.addEventListener('focus', () => {
                //如果atom插件设置“得到焦点时检查库变化”项处于开启状态，检查当前文库
                if (atom.config.get('amWiki.checkLibraryOnWindowFocus')) {
                    if (Date.now() - lastTimestamp > 30000) {
                        this._getCurLib((wId) => {
                            this._checkLibChange(wId);
                        });
                    }
                }
            });
            //当atom启动时，如果插件设置“启动时全量检查文库变化”项处于开启状态，全量检查文库，直接检查不判断当前库
            if (atom.config.get('amWiki.checkAllLibraryOnAtomStart')) {
                for (let wId in this._wikis) {
                    if (this._wikis.hasOwnProperty(wId)) {
                        setTimeout(() => {
                            mngWiki.checkWikiValid(wId);
                            this._checkLibChange(wId);
                        }, 100);
                    }
                }
            }
        },
        /**
         * 推测当前文库是哪一个
         * @param {Function} callback
         * @param {Number} recursive - 递归次数标记
         * @private
         */
        _getCurLib: function (callback, recursive = 1) {
            const treeView = this._treeViewPkgMain.treeView,  //目录树主对象
                treeState = this._treeViewPkgMain.state;  //目录树全局状态
            let wId = '';
            //如果 treeView 已经准备完毕，获取路径
            if (treeView && treeView.selectedPath) {
                //如果 treeView 当前路径是已经存在的 wiki
                wId = mngWiki.createWikiId(treeView.selectedPath.replace(/\\/g, '/').split('library')[0]);
                if (typeof this._wikis[wId] !== 'undefined') {
                    callback(wId);
                }
                //否则从 treeState 获取路径
                else if (treeState && treeState.selectedPath) {
                    //如果 treeState 当前路径补是已存在的wiki
                    wId = mngWiki.createWikiId(treeState.selectedPath.replace(/\\/g, '/').split('library')[0]);
                    if (typeof this._wikis[wId] !== 'undefined') {
                        callback(wId);
                    }
                    //如果 treeState 当前路径也不匹配，不再检查
                }
            }
            //如果_treeView未准备完毕，0.2秒后重新检查，且最多只递归3次，超过后不再检查
            else {
                setTimeout(() => {
                    recursive++;
                    if (recursive <= 3) {
                        this._getCurLib(callback, recursive);
                    }
                }, 200);
            }
        },
        /**
         * 检查文库变化
         * @param {String} wId
         * @private
         */
        _checkLibChange: function (wId) {
            //利用延迟跳出执行列队，等待系统文件操作完毕再读取
            setTimeout(() => {
                if (this._wikis[wId].deprecated) {
                    return;
                }
                const [tree, list, files] = mngFolder.readLibraryTree(this._wikis[wId].path);
                if (!tree) {
                    return
                }
                const libMd5 = crypto.createHash('md5').update(files.join('&')).digest('base64');
                if (this._wikis[wId].treeMD5 !== libMd5) {
                    this._wikis[wId].treeMD5 = libMd5;
                    //更新导航文件
                    makeNav.make(this._wikis[wId].path, tree, list);
                }
            }, 100);
        },
        /**
         * 监听发起
         * @param {[Object]} wikis - 文库记录列表的引用
         * @public
         */
        start: function (wikis) {
            this._wikis = wikis;
            this._listenUser();
            this._listenChange();
            this._listenTime();
        },
        /**
         * 监听释放
         * @public
         */
        destroy: function () {
            this._subscriptions && this._subscriptions.dispose();
        }
    };
})();
module.exports = autoNavigation;