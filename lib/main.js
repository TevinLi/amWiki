/**
 * @desc amWiki 工作端·主模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

//运行环境
var environment = require('atom'),
    CompositeDisposable = environment.CompositeDisposable;
//手动刷新工具
var makeNav = require('./makeNav');
//自动化工具
var automatic = require('./automatic');
//wiki创建器
var creator = require('./creator');
//页内目录创建器
var catalogue = require('./catalogue');
//截图粘帖模块
var pasterImg = require('./pasterImg');
//本地服务器模块
var webServer = require('./webServer');
//项目导出模块
var exportGithub = require('./export.github');
//文件拖拽模块
var fileDrop = require('./fileDrop');

module.exports = {
    //订阅
    _subscriptions: null,
    //缓存atom存储的状态变量
    _state: null,
    //当atom启动时
    activate: function (state) {
        var that = this;
        this._state = state;
        //文库列表记录
        this._state.libraryList = this._state.libraryList || [];
        //文库列表地址MD5，检查文库变化时创建
        this._state.libraryMD5 = this._state.libraryMD5 || {};
        //amWiki命令
        this._subscriptions = new CompositeDisposable();
        this._subscriptions.add(atom.commands.add('atom-workspace', {
            //命令，基于当前config.json创建wiki
            'amWiki:create': function () {
                creator.create(that._state);
            },
            //命令，在当前文档上抓取h2、h3为页内目录
            'amWiki:catalogue': function () {
                catalogue.make();
            },
            //命令，手动更新当前文库导航
            'amWiki:makeNav': function () {
                makeNav.update(that._state);
            },
            //命令，粘帖截图
            'amWiki:paste': function () {
                pasterImg.paster();
            },
            //命令，启动node静态服务器
            'amWiki:runServer': function () {
                webServer.run(that._state.libraryList);
            },
            //命令，浏览打开当前页面
            'amWiki:browser': function () {
                webServer.browser(that._state.libraryList);
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
        automatic.start(this._state);
        automatic.onLibrariesChange = function () {
            webServer.updateMap(that._state.libraryList);
        };
        fileDrop.listenDrop();
        //window.amWikiState = state;
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        webServer.destroy();
        automatic.destroy();
        this._subscriptions.dispose();
    },
    //当atom窗口被挂起，保存文库列表
    serialize: function () {
        return {
            libraryList: this._state.libraryList,
            libraryMD5: this._state.libraryMD5
        };
    },
    //显示相关
    _showAbout: function () {
        atom.packages.activatePackage('amWiki').then(function (pkg) {
            var content = 'amWiki v' + pkg.metadata.version + '\n' +
                'https://github.com/TevinLi/amWiki\n' +
                'MIT Copyright(c) 2016-2099 Tevin Li\n';
            alert(content);
            //TODO: 升级关于弹窗
            //var c = atom.workspace.addModalPanel({item: document.createElement('div'), className: 'amWiki-about'})
        });
    }
};
