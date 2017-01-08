/**
 * @desc amWiki 工作端·主模块
 * @author 耀轩之
 * @copyright 在Tevin的原基础上修改所得
 * @see {@link https://github.com/YaoXuanZhi/amWiki}
 * @license MIT - Released under the MIT license.
 */

var vscode = require('vscode');
//手动刷新工具
var makeNav = require('./makeNav');
// //自动化工具
// var automatic = require('./automatic');
// wiki创建器
var creator = require('./creator');
//页内目录创建器
var catalogue = require('./catalogue');
//截图粘帖模块
var pasterImg = require('./pasterImg');
//本地服务器模块
var webServer = require('./webServer');
//项目导出模块
var exportGithub = require('./export.github');
// //文件拖拽模块
// var fileDrop = require('./fileDrop');

function activate(context) {
    var state = {};
    state.context = context;
    //文库列表记录
    state.libraryList = state.libraryList || [];
    //文库列表地址MD5，检查文库变化时创建
    state.libraryMD5 = state.libraryMD5 || {};

    //注册“基于当前config.json创建wiki”响应事件
    var amWikiCreateProc = vscode.commands.registerCommand('amWiki.create', function () {
        creator.create(state);
    });

    //注册“在当前文档上抓取h2、h3为页内目录”响应事件
    var amWikiCatalogueProc = vscode.commands.registerCommand('amWiki.catalogue', function () {
        catalogue.make();
    });

    //注册“手动更新当前文库导航”响应事件
    // var amWikiMakeNavProc = vscode.commands.registerCommand('amWiki.makeNav', function () {
    //     makeNav.update(state);
    // });

    //注册“粘帖截图”响应事件
    var pasteImgObj = new pasterImg(vscode);
    var amWikiPasteImgProc = vscode.commands.registerCommand('amWiki.pasteImg', function () {
        pasteImgObj.PasteImgFromClipboard();
    });

    //注册“启动node静态服务器”响应事件
    // var amWikiRunServerProc = vscode.commands.registerCommand('amWiki.runServer', function () {
    //     vscode.window.showInformationMessage('amWiki.runServer');
    // });

    //注册“浏览打开当前页面”响应事件
    var amWikiBrowserProc = vscode.commands.registerCommand('amWiki.browser', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //启动本地服务器
        webServer.run(state.libraryList);
        //更新文库导航
        if (makeNav.update(state)) {
            //在浏览器中预览此文档
            webServer.browser(state.libraryList);
        } else {
            vscode.window.showErrorMessage('更新导航失败，可能存在重复文件ID，请检查');
        }
    });

    //注册“导出项目为 github wiki”响应事件
    var amWikiExportTogitHubProc = vscode.commands.registerCommand('amWiki.exportTogitHub', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //将本文库以github wiki目录结构方式
        //导出到指定文件夹内
        exportGithub.export();
    });

    context.subscriptions.push(amWikiCreateProc);
    context.subscriptions.push(amWikiCatalogueProc);
    // context.subscriptions.push(amWikiMakeNavProc);
    context.subscriptions.push(amWikiPasteImgProc);
    // context.subscriptions.push(amWikiRunServerProc);
    context.subscriptions.push(amWikiBrowserProc);
    context.subscriptions.push(amWikiExportTogitHubProc);
}

exports.activate = activate;


// module.exports = {
//     //订阅
//     _subscriptions: null,
//     //缓存atom存储的状态变量
//     _state: null,
//     //当atom启动时
//     activate: function (state) {
//         var that = this;
//         this._state = state;
//         //文库列表记录
//         this._state.libraryList = this._state.libraryList || [];
//         //文库列表地址MD5，检查文库变化时创建
//         this._state.libraryMD5 = this._state.libraryMD5 || {};
//         //amWiki命令
//         this._subscriptions = new CompositeDisposable();
//         this._subscriptions.add(atom.commands.add('atom-workspace', {
//             //命令，基于当前config.json创建wiki
//             'amWiki:create': function () {
//                 creator.create(that._state);
//             },
//             //命令，在当前文档上抓取h2、h3为页内目录
//             'amWiki:catalogue': function () {
//                 catalogue.make();
//             },
//             //命令，手动更新当前文库导航
//             'amWiki:makeNav': function () {
//                 makeNav.update(that._state);
//             },
//             //命令，粘帖截图
//             'amWiki:paste': function () {
//                 pasterImg.paster();
//             },
//             //命令，启动node静态服务器
//             'amWiki:runServer': function () {
//                 webServer.run(that._state.libraryList);
//             },
//             //命令，浏览打开当前页面
//             'amWiki:browser': function () {
//                 webServer.browser(that._state.libraryList);
//             },
//             //命令，导出项目为 github wiki
//             'amWiki:export.gitHub': function () {
//                 exportGithub.export();
//             },
//             //命令，显示about
//             'amWiki:about': function () {
//                 that._showAbout();
//             }
//         }));
//         //自动化模块启动
//         automatic.start(this._state);
//         automatic.onLibrariesChange = function () {
//             webServer.updateMap(that._state.libraryList);
//         };
//         fileDrop.listenDrop();
//         //window.amWikiState = state;
//     },
//     //当atom即将关闭，终止所有监听
//     deactivate: function () {
//         webServer.destroy();
//         automatic.destroy();
//         this._subscriptions.dispose();
//     },
//     //当atom窗口被挂起，保存文库列表
//     serialize: function () {
//         return {
//             libraryList: this._state.libraryList,
//             libraryMD5: this._state.libraryMD5
//         };
//     },
//     //显示相关
//     _showAbout: function () {
//         atom.packages.activatePackage('amWiki').then(function (pkg) {
//             var content = 'amWiki v' + pkg.metadata.version + '\n' +
//                 'https://github.com/TevinLi/amWiki\n' +
//                 'MIT Copyright(c) 2016-2099 Tevin Li\n';
//             alert(content);
//             //TODO: 升级关于弹窗
//             //var c = atom.workspace.addModalPanel({item: document.createElement('div'), className: 'amWiki-about'})
//         });
//     }
// };
