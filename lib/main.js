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
var updateNav = require('./updateNav');
//引入-自动刷新工具
var autoNav = require('./autoNav');
//引入-创建器
var creator = require('./creator');
//引入-页内目录创建器
var contents = require('./contents');
//引入-截图粘帖
var pasterImg = require('./pasterImg');

module.exports = {
    //保存
    subscriptions: null,
    //缓存atom存储的状态变量
    state: null,
    //当atom启动时
    activate: function (state) {
        var that = this;
        this.state = state;
        this.state.libraryList = this.state.libraryList || [];
        this.subscriptions = new CompositeDisposable();
        this.autoNavigation();
        //命令，手动更新导航
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:updateNav': function () {
                that.updateNavigation();
            }
        }));
        //命令，暂停所有文件夹监听
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:pauseNav': function () {
                that.pauseNavigation();
            }
        }));
        //命令，基于当前config.json创建wiki
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:create': function () {
                that.createWiki();
            }
        }));
        //命令，在当前文档上抓取h2、h3为页内目录
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:contents': function () {
                that.makeContents();
            }
        }));
        //命令，粘帖截图
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'amWiki:pasteImg': function () {
                pasterImg.paster();
            }
        }));
    },
    //当atom即将关闭，终止所有监听
    deactivate: function () {
        autoNav.destroy();
        this.subscriptions.dispose();
    },
    //当atom关闭，保存临时数据
    serialize: function () {
        return {
            libraryList: this.state.libraryList
        };
    },
    //手动更新导航文件
    updateNavigation: function () {
        var editor, grammar, state;
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (grammar.scopeName !== 'source.gfm') {
            return;
        }
        state = this.state;
        updateNav.refresh(editor.getPath(), function (path) {
            var hs, i;
            i = 0;
            hs = false;
            while (i < state.libraryList.length) {
                if (state.libraryList[i] === path) {
                    hs = true;
                }
                i++;
            }
            if (!hs) {
                state.libraryList.push(path);
            }
        });
    },
    //开启自动更新导航文件
    autoNavigation: function () {
        var state;
        state = this.state;
        autoNav.watchLibrary(this.state.libraryList, function (list) {
            state.libraryList = list;
        });
    },
    //暂停导航文件自动更新
    pauseNavigation: function () {
        var editor;
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        autoNav.pause(editor.getPath(), this.state.libraryList);
    },
    //创建wiki
    createWiki: function () {
        var editor, state;
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        state = this.state;
        creator.buildAt(editor.getPath(), atom.configDirPath, function (path) {
            state.libraryList.push(path);
        });
    },
    //创建页内目录
    makeContents: function () {
        var ct, editor, grammar;
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (grammar.scopeName !== 'source.gfm') {
            return;
        }
        ct = contents.make(editor.getPath()) || '';
        this.insertText(ct, editor);
    }
};