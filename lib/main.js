/**
 * @desc 工作端·主模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

//运行环境
let {CompositeDisposable} = require('atom');
//wiki创建器
let creator = require('../build/creator');
//文库管理
let mngWiki = require('../build/manageWiki');
//手动刷新导航文件
let makeNav = require('../build/makeNavigation');
//本地服务器模块
let localServer = require('../build/localServer');
//项目导出模块
let exportGithub = require('../build/exportGithub');
//自动化工具
let autoNav = require('./autoNavigation');
//页内目录创建器
let pageCatalogue = require('./pageCatalogue');
//截图粘帖模块
let pasteImg = require('./pasteImg');
//文件拖拽模块
let dropFile = require('./dropFile');

module.exports = {
    //订阅
    _subscriptions: null,
    //缓存atom存储的配置
    _config: null,
    //当atom启动时
    activate: function (state) {
        let that = this;
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
            'amWiki:create': function () {
                creator.create(function (root) {
                    let wikiId = mngWiki.createWikiId(root);
                    //添加文库
                    if (typeof that._wikis[wikiId] === 'undefined') {
                        mngWiki.addWiki(root, wikiId);
                    }
                    //文库已存在时，修改弃用标记为启用
                    else {
                        that._wikis[wikiId].deprecated = false;
                    }
                    //更新导航
                    makeNav.refresh(root + 'library/');
                });
            },
            //命令：在当前文档上抓取h2、h3为页内目录
            'amWiki:catalogue': function () {
                let [isOnEdit, editor, editPath] = that._getEditorPath();
                if (isOnEdit) {
                    pageCatalogue.make(editor);
                    mngWiki.checkAddWiki(editPath);
                } else {
                    alert('只有当你打开 library 文件夹下的 .md 文档时，才能提取页内目录！');
                }
            },
            //命令：手动更新当前文库导航
            'amWiki:makeNav': function () {
                let [isOnEdit, editor, editPath] = that._getEditorPath();
                if (isOnEdit || (typeof editPath !== 'undefined' && mngFolder.isAmWiki(editPath))) {
                    makeNav.refresh(editPath);
                    mngWiki.checkAddWiki(editPath);
                } else {
                    alert('只有当你打开一个 amWiki 文库时，才能手动更新导航文件！');
                }
            },
            //命令：粘帖截图
            'amWiki:paste': function () {
                let [isOnEdit, editor, editPath] = that._getEditorPath();
                if (isOnEdit) {
                    pasteImg.paster(editor, editPath);
                    mngWiki.checkAddWiki(editPath);
                } else {
                    alert('只有当你打开 library 文件夹下的 .md 文档时，才能快捷粘贴图片！');
                }
            },
            //命令：启动node静态服务器
            'amWiki:runServer': function () {
                localServer.run(that._wikis);
            },
            //命令：浏览打开当前页面
            'amWiki:browser': function () {
                let [isOnEdit, editor, editPath] = that._getEditorPath();
                if (isOnEdit) {
                    localServer.browser(editPath, that._wikis);
                    mngWiki.checkAddWiki(editPath);
                } else {
                    alert('您需要先打开一篇文档才能浏览！');
                }
            },
            //命令：导出项目为 github wiki
            'amWiki:export.gitHub': function () {
                let [isOnEdit, editor, editPath] = that._getEditorPath();
                if (isOnEdit || (typeof editPath !== 'undefined' && mngFolder.isAmWiki(editPath))) {
                    exportGithub.export(editPath);
                    mngWiki.checkAddWiki(editPath);
                } else {
                    alert('导出失败！\n只能对一个 amWiki 项目进行导出！');
                }
            },
            //命令：显示about
            'amWiki:about': function () {
                that._showAbout();
            }
        }));
        //自动化模块启动
        autoNav.start(this._wikis);
        dropFile.listenDrop(this._getEditorPath);
        console.log(window.amWikiState = {config: this._config, wikis: this._wikis});
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        localServer.destroy();
        autoNav.destroy();
        this._subscriptions.dispose();
    },
    //当atom窗口被挂起，保存文库列表
    serialize: function () {
        return {
            config: this._config,
            wikis: this._wikis
        };
    },
    //显示相关
    _showAbout: function () {
        atom.packages.activatePackage('amWiki').then(function (pkg) {
            let content = 'amWiki v' + pkg.metadata.version + '\n' +
                'https://github.com/TevinLi/amWiki\n' +
                'MIT Copyright(c) 2016-2099 Tevin Li\n';
            alert(content);
            //TODO: 升级关于弹窗
            //var c = atom.workspace.addModalPanel({item: document.createElement('div'), className: 'amWiki-about'})
        });
    },
    //获取当前文档路径，先检查当前是否处于文档编辑状态才返回
    _getEditorPath: function () {
        let editor = atom.workspace.getActiveTextEditor();
        let grammar;
        if (!editor) {
            return [false];
        }
        grammar = editor.getGrammar();
        if (!grammar) {
            return [false, editor];
        }
        let ePath = editor.getPath();
        if (editor.getPath().substr(-3) !== '.md') {
            return [false, editor, ePath];
        }
        if (ePath.indexOf('library') < 0) {
            return [false, editor, ePath];
        }
        return [true, editor, ePath];
    }
};
