/**
 * @desc amWiki 工作端·文件拖拽模块
 * @author Tevin
 */

var fs = require("fs");
var directories = require('./directories');
var pasterImg = require('./pasterImg');

module.exports = {
    //拖拽图片
    _dropImg: function (files, paths, editor) {
        pasterImg.createDirectory(paths.creatDirPath, function () {
            for (var i = 0, file; file = files[i]; i++) {
                fs.createReadStream(file.path).pipe(fs.createWriteStream(paths.writePath + file.name));
                editor.insertText("![](assets/" + paths.insertPath + file.name + ")", editor);
            }
        });
    },
    //监听拖拽
    listenDrop: function () {
        var that = this;
        atom.document.getElementsByClassName('item-views')[0].addEventListener('drop', function (e) {
            //文件验证，包含非图片文件跳过不工作
            var files = e.dataTransfer.files;
            var allImg = true;
            for (var i = 0, file; file = files[i]; i++) {
                if (file.type.indexOf('image/') != 0) {
                    allImg = false;
                }
            }
            if (!allImg) {
                return;
            }
            //编辑器状态验证，非markdown不工作
            var editor = atom.workspace.getActiveTextEditor();
            var grammar;
            if (!editor) {
                return;
            }
            grammar = editor.getGrammar();
            if (!grammar) {
                return;
            }
            if (grammar.scopeName !== 'source.gfm' && grammar.scopeName !== 'text.md') {
                return;
            }
            var editorPath = editor.getPath();
            if (editorPath.substr(-3) !== '.md') {
                return;
            }
            var paths = pasterImg.getPaths(editorPath);
            if (!paths) {
                return;
            }
            //验证路径，非amWiki不工作
            if (!directories.isAmWiki(editorPath)) {
                return;
            }
            //条件匹配，阻止默认动作
            e.stopPropagation();
            //拖拽图片
            that._dropImg(files, paths, editor);
        });
    }
};

