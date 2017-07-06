/**
 * 工作端 - Atom - 富粘帖操作模块
 * @author Tevin
 */

const {File} = require('atom');
const fs = require('fs');
const clipboard = require('clipboard');
const crypto = require('crypto');
const mngFolder = require('../build/manageFolder');

const richPaste = (function () {
    return {
        /**
         * 编辑器实例
         * @private
         */
        _editPath: null,
        /**
         * 富粘贴
         * @param {Object} editor - 当前文档编辑器的引用
         * @param {String} editPath - 当前文档的路径
         * @public
         */
        paste: function (editor, editPath) {
            this._editPath = editPath;
            //网页粘贴检查
            const html = clipboard.readHtml();
            if (html && html.length > 2) {
                //形如 <div><img src="..."></div> 格式的 html 视为图片粘贴
                const htmlMatch = html.match(/^(<div>)?\s*<img src="(.*?)" *.*?>\s*(<\/div>)?$/i);
                if (htmlMatch && htmlMatch.length >= 4) {
                    // file 协议视为本地图片，转移图片
                    if (htmlMatch[2].indexOf('file:') === 0) {
                        this._pasteImg('file', htmlMatch[2], function (state, text, title) {
                            if (state) {
                                text = '![](' + text + title + ')' + '  \n';
                                editor.insertText(text, editor);
                            }
                        }, editor);
                    }
                    // http 协议视为远程图片
                    else if (htmlMatch[2].indexOf('http') === 0) {
                        //如果此时粘贴板能读取图片，则读取
                        this._pasteImg('clip', '', function (state, text, title) {
                            console.log(state, text, title);
                            if (state) {
                                text = '![](' + text + title + ')' + '  \n';
                                editor.insertText(text, editor);
                            }
                            //不能读取图片，则插入网络地址
                            else {
                                text = '![](' + htmlMatch[2].split(/[?#]/)[0] + title + ')' + '  \n';
                                editor.insertText(text, editor);
                            }
                        }, editor);
                    }
                }
                //否则视为大段 html 粘贴模式
                else {
                    //
                }
            }
            //截图粘贴检查
            else {
                this._pasteImg('clip', '', function (state, text, title) {
                    if (state) {
                        text = '![](' + text + title + ')' + '  \n';
                        editor.insertText(text, editor);
                    }
                }, editor);
            }
        },
        /**
         * 粘贴图片
         * @param {String} type - 粘贴的类型：file / clip
         * @param {String} filePath - 需要读取的图片路径
         * @param {Function} callback - 粘贴处理后的回调（是否成功的状态，图片src路径，图片title）
         * @param {Object} editor - 当前编辑器的引用
         * @private
         */
        _pasteImg: function (type, filePath, callback, editor) {
            //满足一定条件的选中文本可以插入为图片 title
            let selectText = editor.getSelectedText();
            if (/^[a-z0-9\u4e00-\u9fa5\s\-_!,.?:;（）！，。？“”：；]+$/.test(selectText)) {
                selectText = ' "' + selectText.replace(/^\s+|\s+$/g, '') + '"';
            } else {
                selectText = '';
            }
            //读取数据
            let imgbuffer = null;
            let ext = 'png';
            if (type === 'file') {
                filePath = filePath.substr(8);   //截去 file:/// 协议头
                try {
                    imgbuffer = fs.readFileSync(filePath, 'binary');
                    ext = filePath.split(/[?#]/)[0].match(/\.([^\.\/]*?)$/);
                    ext = ext ? ext[1] : 'png';
                } catch (e) {
                    callback && callback(false);
                    return;
                }
            } else if (type === 'clip') {
                const img = clipboard.readImage();
                if (img.isEmpty()) {
                    callback && callback(false);
                    return;
                }
                imgbuffer = img.toPng();
            }
            //计算路径
            const [assetsDirPath, createDirPath, insertText] = this.getPastePaths();
            if (!assetsDirPath) {
                callback && callback(false);
                return;
            }
            //计算文件名
            let filename = '';
            //按天区分文件
            const date = new Date();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            month = (month <= 9 ? '0' : '') + month;
            day = (day <= 9 ? '0' : '') + day;
            //加入 md5 创建文件名，重复多次粘贴时只创建一个图片文件
            const md5 = crypto.createHash('md5');
            md5.update(imgbuffer);
            filename += date.getFullYear() + month + day + '-' + md5.digest('hex').slice(0, 8) + '.' + ext;
            //输出文件
            mngFolder.createFolder(createDirPath);
            fs.writeFile(createDirPath + filename, imgbuffer, 'binary', () => {
                callback && callback(true, insertText + filename, selectText);
            });
        },
        /**
         * 计算操作路径
         * @param {String} [editPath] - 当前文档的路径
         * @returns {Object} 粘贴图片需要的路径列表
         * @public
         */
        getPastePaths: function (editPath = this._editPath) {
            const path = mngFolder.getProjectFolder(editPath);
            if (!path) {
                return [];
            }
            let assetsDirPath = path + 'assets/';  //项目assets文件夹地址;
            let createDirPath = '',  //本次创建图片地址
                insertText = '';     //插入文档的图片引用路径
            // library 目录
            if (mngFolder.getBaseName(mngFolder.getParentFolder(editPath)) === 'library') {
                createDirPath = assetsDirPath;
                insertText = 'assets/'
            }
            // library 深子级
            else {
                let lv1Name = editPath.substr((path + 'library/').length);
                let lv1Id = lv1Name.split(/[-_]/)[0];
                createDirPath = assetsDirPath + lv1Id + '/';
                insertText = 'assets/' + lv1Id + '/';
            }
            return [assetsDirPath, createDirPath, insertText];
        }
    };
})();

module.exports = richPaste;