/**
 * amWiki
 * https://github.com/TevinLi/amWiki
 * by Tevin
 *
 * Released under the MIT license.
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
    //保存
    subscriptions: null,
    //缓存atom存储的状态变量
    state: null,
    //当atom启动时
    activate: function (state) {
        var that = this;
        this.state = state;
        this.state.libraryList = this.state.libraryList || [];  //文库列表记录
        this.subscriptions = new CompositeDisposable();
        //命令，手动更新导航
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:makeNav': function () {
                makeNav.update(that.state, function (library) {
                    automatic.addLibWatcher(library);
                });
            }
        }));
        //命令，基于当前config.json创建wiki
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:create': function () {
                creator.create(that.state);
            }
        }));
        //命令，在当前文档上抓取h2、h3为页内目录
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:catalogue': function () {
                catalogue.make();
            }
        }));
        //命令，粘帖截图
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:pasteImg': function () {
                pasterImg.paster();
            }
        }));
        //命令，启动node静态服务器
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:runServer': function () {
                webServer.run(that.state.libraryList);
            }
        }));
        //命令，浏览打开当前页面
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:browser': function () {
                webServer.browser(that.state.libraryList);
            }
        }));
        //自动化模块启动
        automatic.start(this.state);
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        automatic.destroy();
        this.subscriptions.dispose();
    },
    //当atom关闭，保存文库列表
    serialize: function () {
        return {
            libraryList: this.state.libraryList
        };
    }
};