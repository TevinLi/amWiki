/**
 * 工作端 - Atom - 入口模块
 * @author Tevin Li
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

//Atom 层运行环境接口
const {CompositeDisposable} = require('atom');
const fs = require('fs');
//Electron 层 shell 接口
//系统对话框
const {dialog: eDialog} = require('electron').remote;

//co模块，异步函数编程
const co = require('../modules/co');

//wiki创建器
const creator = require('../build/creator');
//文库管理
const mngWiki = require('../build/manageWiki');
//文件夹管理
const mngFolder = require('../build/manageFolder');
//手动刷新导航文件
const makeNav = require('../build/makeNavigation');
//手动刷新页面挂载数据
const makeMut = require('../build/makeMounts');
//本地服务器模块
const localServer = require('../build/localServer');
//项目导出模块
const exportGithub = require('../build/exportGithub');
//自动化工具
const autoNav = require('./autoNavigation');
//页内目录创建器
const pageCatalogue = require('./pageCatalogue');
//截图粘帖模块
const richPaste = require('./richPaste');
//文件拖拽模块
const dropFile = require('./dropFile');

const main = (function () {
    return {
        /**
         * 订阅
         * @private
         */
        _subscriptions: null,
        /**
         * 缓存atom存储的配置
         * @private
         */
        _config: null,
        /**
         * 文库记录
         * @private
         */
        _wikis: null,
        /**
         * 当atom启动时
         * @param {Object} state
         * @public
         */
        activate: function (state) {
            this._config = state.config;
            //文库记录
            this._wikis = state.wikis || {};
            mngWiki.linkWikis(this._wikis);
            //检查文库记录有效性
            for (let wId in this._wikis) {
                if (this._wikis.hasOwnProperty(wId)) {
                    mngWiki.checkWikiValid(wId);
                }
            }
            //转换旧版数据
            if (state.libraryList) {
                for (let i = 0, item, itemPath, itemRoot; itemPath = state.libraryList[i]; i++) {
                    itemRoot = itemPath.split('library')[0];
                    item = {
                        id: mngWiki.createWikiId(itemRoot),
                        root: itemRoot,
                        path: itemPath
                    };
                    if (typeof state.libraryMD5[itemPath] !== 'undefined') {
                        item.treeMD5 = state.libraryMD5[itemPath];
                    }
                    this._wikis[item.id] = item;
                }
            }
            //amWiki命令
            this._subscriptions = new CompositeDisposable();
            this._subscriptions.add(atom.commands.add('atom-workspace', {
                //命令：基于当前config.json创建wiki
                'amWiki:create': () => {
                    const editor = atom.workspace.getActiveTextEditor();
                    if (!editor) {
                        return;
                    }
                    const editPath = editor.getPath();
                    if (editPath.indexOf('config.json') < 0) {
                        alert('创建失败，当前不是"config.json"文件！');
                        return;
                    }
                    const packagePath = atom.configDirPath.replace(/\\/g, '/') + '/packages/amWiki/';
                    const packageConf = JSON.parse(fs.readFileSync(packagePath + 'package.json', 'utf-8'));
                    creator.create(editPath, packagePath + 'files/', packageConf).then((root) => {
                        if (!root) {
                            return;
                        }
                        const wId = mngWiki.createWikiId(root);
                        //添加文库
                        if (typeof this._wikis[wId] === 'undefined') {
                            mngWiki.addWiki(root, wId);
                        }
                        //文库已存在时，修改弃用标记为启用
                        else {
                            mngWiki.updateWikiConfig();
                            this._wikis[wId].deprecated = false;
                        }
                        //更新导航
                        makeNav.refresh(root + 'library/');
                        //更新挂载数据
                        makeMut.make(root, true);
                    });
                },
                //命令：在当前文档上抓取h2、h3为页内目录
                'amWiki:catalogue': () => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (isOnEdit) {
                        mngWiki.checkAddWiki(editPath);
                        pageCatalogue.make(editor);
                    } else {
                        alert('只有当你打开 library 文件夹下的 .md 文档时，才能提取页内目录！');
                    }
                },
                //命令：手动更新当前文库导航
                'amWiki:makeNav': () => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (typeof editPath !== 'undefined') {
                        //当 isOnEdit 为 false 时，editPath 仍然不一定为根目录
                        const root = mngFolder.isAmWiki(editPath);
                        if (root) {
                            mngWiki.checkAddWiki(root);
                            makeNav.refresh(root + 'library/');
                            return;
                        }
                    }
                    alert('只有当你打开一个 amWiki 文库时，才能手动更新导航文件！');
                },
                //命令：手动刷新页面挂载数据
                'amWiki:makeMut': () => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (typeof editPath !== 'undefined') {
                        //当 isOnEdit 为 false 时，editPath 仍然不一定为根目录
                        const root = mngFolder.isAmWiki(editPath);
                        if (root) {
                            mngWiki.checkAddWiki(root);
                            makeMut.make(root);
                            return;
                        }
                    }
                    alert('只有当你打开一个 amWiki 文库时，才能更新页面挂载数据！');
                },
                //命令：粘帖截图
                'amWiki:paste': (e) => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (isOnEdit) {
                        mngWiki.checkAddWiki(editPath);
                        richPaste.paste(editor, editPath);
                    } else {
                        if (mngFolder.isAmWiki(editPath)) {
                            alert('只有当你打开 library 文件夹下的 .md 文档时，才能快捷粘贴图片！');
                        }
                    }
                },
                //命令：启动node静态服务器
                'amWiki:runServer': () => {
                    localServer.run(this._wikis);
                },
                //命令：浏览打开当前页面
                'amWiki:browser': () => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (isOnEdit) {
                        mngWiki.checkAddWiki(editPath);
                        localServer.browser(editPath, this._wikis);
                    } else {
                        alert('您需要先打开一篇文档才能浏览！');
                    }
                },
                //命令：导出项目为 github wiki
                'amWiki:export.gitHub': () => {
                    const [isOnEdit, editor, editPath] = this._getEditorPath();
                    if (typeof editPath !== 'undefined') {
                        const root = mngFolder.isAmWiki(editPath);
                        if (root) {
                            mngWiki.checkAddWiki(root);
                            //选取导出地址
                            eDialog.showOpenDialog({properties: ['openDirectory']}, (data) => {
                                if (data && data.length) {
                                    //开始导出
                                    exportGithub.export(root, data[0].replace(/\\/g, '/'));
                                }
                            });
                            return;
                        }
                    }
                    alert('导出失败！\n只能对一个 amWiki 项目进行导出！');
                },
                //命令：显示about
                'amWiki:about': () => {
                    this._showAbout();
                }
            }));
            //自动化模块启动
            autoNav.start(this._wikis);
            dropFile.listenDrop(this._getEditorPath);
            //绑定到全局 window
            window.amWikiState = {
                config: this._config,
                wikis: this._wikis,
                clearWikis: () => this._wikis = {}
            };
            //为配合命令行板块，使用基于 promise 的 confirm2 与 prompt2 替代同步执行的 confirm 与 prompt
            window.confirm2 = (msg) => {
                return new Promise((resolve, reject) => {
                    resolve(confirm(msg));
                });
            };
            //window.prompt2 = (msg) => {};
        },
        /**
         * 当atom即将关闭，终止所有监听
         * @public
         */
        deactivate: function () {
            localServer.destroy();
            autoNav.destroy();
            this._subscriptions.dispose();
            window.amWikiState = null;
        },
        /**
         * 当atom窗口被挂起，保存文库列表
         * @returns {{config: Object, wikis: [Object]}}
         * @public
         */
        serialize: function () {
            return {
                config: this._config,
                wikis: this._wikis
            };
        },
        /**
         * 显示 amWiki 相关信息
         * @private
         */
        _showAbout: function () {
            atom.packages.activatePackage('amWiki').then((pkg) => {
                const content = 'amWiki v' + pkg.metadata.version + '\n' +
                    'https://github.com/TevinLi/amWiki\n' +
                    'MIT Copyright(c) 2016-2099 Tevin Li, amwiki.org.\n';
                alert(content);
                //TODO: 升级关于弹窗
                //var c = atom.workspace.addModalPanel({item: document.createElement('div'), className: 'amWiki-about'})
            });
        },
        /**
         * 获取当前文档路径，先检查当前是否处于文档编辑状态才返回
         * @returns {[Boolean|Object|String]}
         * @private
         */
        _getEditorPath: function () {
            const editor = atom.workspace.getActiveTextEditor();
            if (!editor) {
                return [false];
            }
            const grammar = editor.getGrammar();
            if (!grammar) {
                return [false, editor];
            }
            const ePath = editor.getPath().replace(/\\/g, '/');
            if (ePath.substr(-3) !== '.md') {
                return [false, editor, ePath];
            }
            if (ePath.indexOf('library') < 0) {
                return [false, editor, ePath];
            }
            return [true, editor, ePath];
        }
    };
})();

module.exports = main;