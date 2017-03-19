/**
 * @desc 工作端·文件拖拽模块
 * @author Tevin
 */

let fs = require("fs");
let mngFolder = require('../build/manageFolder');
let pasteImg = require('./pasteImg');

module.exports = {
    //拖拽图片
    _dropImg: function (files, paths, editor) {
        pasteImg.createDirectory(paths.creatDirPath, function () {
            for (let i = 0, file; file = files[i]; i++) {
                fs.createReadStream(file.path).pipe(fs.createWriteStream(paths.writePath + file.name));
                editor.insertText("![](assets/" + paths.insertPath + file.name + ")  \n", editor);
            }
        });
    },
    //监听拖拽
    listenDrop: function (getEditorPath) {
        let that = this;
        atom.document.getElementsByClassName('item-views')[0].addEventListener('drop', function (e) {
            //TODO: console.log(e.dataTransfer.getData("treeViewDrag"));
            //文件验证，包含非图片文件跳过不工作
            let files = e.dataTransfer.files;
            let allImg = true;
            for (let i = 0, file; file = files[i]; i++) {
                if (file.type.indexOf('image/') !== 0) {
                    allImg = false;
                }
            }
            if (!allImg) {
                return;
            }
            //编辑器状态验证，非markdown不工作
            let [isOnEdit, editor, editPath] = getEditorPath();
            if (!isOnEdit) {
                return;
            }
            let paths = pasteImg.getPaths(editPath);
            if (!paths.mdFile) {
                return;
            }
            //验证路径，非amWiki不工作
            if (!mngFolder.isAmWiki(editPath)) {
                return;
            }
            //条件匹配，阻止默认动作
            e.stopPropagation();
            //执行拖拽图片
            that._dropImg(files, paths, editor);
        });

        /* TODO:
         atom.packages.activatePackage('tree-view').then(function (pkg) {
         that.treeView = pkg.mainModule.treeView;
         that.treeView[0].addEventListener('dragstart', function (e) {
         let path = e.target.childNodes[0].getAttribute('data-path');
         e.dataTransfer.setData("treeViewDrag", path);
         });
         });*/
    }
};

