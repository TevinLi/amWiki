/**
 * @desc amWiki 工作端·主模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

//引入-运行环境
var environment = require('atom'),
    CompositeDisposable = environment.CompositeDisposable;
//引入-手动刷新工具
var makeNav = require('./makeNav');
//引入-自动化工具
var automatic = require('./automatic');
//引入-wiki创建器
var creator = require('./creator');
//引入-页内目录创建器
var catalogue = require('./catalogue');
//引入-截图粘帖模块
var pasterImg = require('./pasterImg');
//引入-本地服务器模块
var webServer = require('./webServer');

module.exports = {
    //订阅
    subscriptions: null,
    //缓存atom存储的状态变量
    state: null,
    //当atom启动时
    activate: function (state) {
        var that = this;
        this.state = state;
        //文库列表记录
        this.state.libraryList = this.state.libraryList || [];
        //文库列表地址MD5，检查文库变化时创建
        this.state.libraryMD5 = this.state.libraryMD5 || {};
        //amWiki命令
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            //命令，基于当前config.json创建wiki
            'amWiki:create': function () {
                creator.create(that.state);
            },
            //命令，在当前文档上抓取h2、h3为页内目录
            'amWiki:catalogue': function () {
                catalogue.make();
            },
            //命令，手动更新当前文库导航
            'amWiki:makeNav': function () {
                makeNav.update(that.state);
            },
            //命令，粘帖截图
            'amWiki:paste': function () {
                pasterImg.paster();
            },
            //命令，启动node静态服务器
            'amWiki:runServer': function () {
                webServer.run(that.state.libraryList);
            },
            //命令，浏览打开当前页面
            'amWiki:browser': function () {
                webServer.browser(that.state.libraryList);
            },
            //命令，显示about
            'amWiki:about': function () {
                that.showAbout();
            }
        }));
        //自动化模块启动
        automatic.start(this.state);
        automatic.onLibrariesChange = function () {
            webServer.updateMap(that.state.libraryList);
        };
        window.amWikiState = state;
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        webServer.destroy();
        automatic.destroy();
        this.subscriptions.dispose();
    },
    //当atom窗口被挂起，保存文库列表
    serialize: function () {
        return {
            libraryList: this.state.libraryList,
            libraryMD5: this.state.libraryMD5
        };
    },
    //显示相关
    showAbout: function () {
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