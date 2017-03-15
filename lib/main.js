/**
 * @desc 工作端·主模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

//运行环境
let environment = require('atom'),
    CompositeDisposable = environment.CompositeDisposable;
//wiki创建器
let creator = require('../build/creator');
//文库管理
let manageWiki = require('../build/manage-wiki');
//手动刷新导航文件
let makeNav = require('../build/make-navigation');
//本地服务器模块
let localServer = require('../build/local-server');
//项目导出模块
let exportGithub = require('../build/export-github');
//自动化工具
let automatic = require('./automatic');
//页内目录创建器
let pageCatalogue = require('./page-catalogue');
//截图粘帖模块
let pasteImg = require('./paste-img');
//文件拖拽模块
let fileDrop = require('./file-drop');

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
        //转移旧数据
        if (state.libraryList) {
            for (let i = 0, item, itemPath, itemRoot; itemPath = state.libraryList[i]; i++) {
                itemRoot = itemPath.split('library')[0];
                item = {
                    id: manageWiki.createWikiId(itemRoot),
                    root: itemRoot,
                    path: itemPath
                };
                if (typeof state.libraryMD5[itemPath] !== 'undefined') {
                    item.fileListMD5 = state.libraryMD5[itemPath];
                }
                this._wikis[item.id] = item;
            }
        }
        //amWiki命令
        this._subscriptions = new CompositeDisposable();
        this._subscriptions.add(atom.commands.add('atom-workspace', {
            //命令，基于当前config.json创建wiki
            'amWiki:create': function () {
                creator.create(function(root){
                    let wikiId = manageWiki.createWikiId(root);
                    //添加文库
                    if (typeof that._wikis === 'undefined') {
                        that._wikis[wikiId] = {
                            id: wikiId,
                            root: root,
                            path: root + 'library/',
                            shut: false
                        };
                    } else {
                        that._wikis[wikiId].shut = false;
                    }
                    //更新导航
                    makeNav.refresh(root + 'library/');
                });
            },
            //命令，在当前文档上抓取h2、h3为页内目录
            'amWiki:catalogue': function () {
                pageCatalogue.make();
            },
            //命令，手动更新当前文库导航
            'amWiki:makeNav': function () {
                makeNav.update(that._state);
            },
            //命令，粘帖截图
            'amWiki:paste': function () {
                pasteImg.paster();
            },
            //命令，启动node静态服务器
            'amWiki:runServer': function () {
                localServer.run(that._wikis);
            },
            //命令，浏览打开当前页面
            'amWiki:browser': function () {
                localServer.browser(that._wikis);
            },
            //命令，导出项目为 github wiki
            'amWiki:export.gitHub': function () {
                exportGithub.export();
            },
            //命令，显示about
            'amWiki:about': function () {
                that._showAbout();
            }
        }));
        //自动化模块启动
        automatic.start(this._wikis);
        automatic.onLibrariesChange = function () {
            localServer.updateMap(that._wikis);
        };
        fileDrop.listenDrop();
        window.amWikiState = {config: this._config, wikis: this._wikis};  console.log(window.amWikiState);
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        localServer.destroy();
        automatic.destroy();
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
    }
};
