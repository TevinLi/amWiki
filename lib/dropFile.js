/**
 * 工作端 - Atom - 文件拖拽模块
 * @author Tevin
 */

const fs = require('fs');
const mngFolder = require('../build/manageFolder');
const richPaste = require('./richPaste');
const pinyin = require('../files/pinyin.js').PinYin;

const dropFile = (function () {
    return {
        /**
         * 转存获取编辑器当前文档状态的方法
         * @private
         */
        _getEditorPath: null,
        /**
         * 拖拽图片
         * @param {[Object]} files - 鼠标拖拽的文件列表
         * @param {String} createDirPath - 输出的目录
         * @param {String} insertText - 插入的文本
         * @param {Object} editor - 编辑器的引用
         * @private
         */
        _dropImg: function (files, createDirPath, insertText, editor) {
            mngFolder.createFolder(createDirPath);
            //按天区分文件
            const date = new Date();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            month = (month <= 9 ? '0' : '') + month;
            day = (day <= 9 ? '0' : '') + day;
            //输出
            for (let file of files) {
                let ext = 'jpg';
                let name = date.getFullYear() + month + day + '-';
                //将名称中的汉字转换为拼音，以避免跨平台文件名编码不同，造成无法访问的问题
                name += pinyin.convert(file.name.replace(/\.([^.]+?)$/, function (m, s1) {
                    ext = s1;
                    return '';
                }));
                fs.createReadStream(file.path).pipe(fs.createWriteStream(createDirPath + name + '.' + ext));
                insertText = '![](' + insertText + name + '.' + ext + ' "' + file.name.replace(/\.([^.]+?)$/, '') + '")  \n';
                editor.insertText(insertText, editor);
            }
        },
        /**
         * 监听拖拽
         * @param {Function} getEditorPath - 获取编辑器当前文档状态的方法的引用
         * @public
         */
        listenDrop: function (getEditorPath) {
            this._getEditorPath = getEditorPath;
            atom.document.getElementsByClassName('item-views')[0].addEventListener('drop', (e) => {
                //TODO: console.log(e.dataTransfer.getData("treeViewDrag"));
                //文件验证，包含非图片文件跳过不工作
                const files = e.dataTransfer.files;
                let allImg = true;
                for (let file of files) {
                    if (file.type.indexOf('image/') !== 0) {
                        allImg = false;
                    }
                }
                if (!allImg) {
                    return;
                }
                //编辑器状态验证，非 markdown 不工作
                const [isOnEdit, editor, editPath] = this._getEditorPath();
                if (!isOnEdit) {
                    return;
                }
                const [assetsDirPath, createDirPath, insertText] = richPaste.getPastePaths(editPath);
                if (!assetsDirPath) {
                    return;
                }
                //验证路径，非 amWiki 不工作
                if (!mngFolder.isAmWiki(editPath)) {
                    return;
                }
                //此时已经匹配拖拽条件，阻止默认动作
                e.stopPropagation();
                //执行拖拽图片
                this._dropImg(files, createDirPath, insertText, editor);
            });

            /* TODO:
             atom.packages.activatePackage('tree-view').then(function (pkg) {
             this.treeView = pkg.mainModule.treeView;
             this.treeView[0].addEventListener('dragstart', function (e) {
             let path = e.target.childNodes[0].getAttribute('data-path');
             e.dataTransfer.setData("treeViewDrag", path);
             });
             });*/
        }
    };
})();

module.exports = dropFile;

