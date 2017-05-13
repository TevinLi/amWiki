/**
 * 工作端 - Atom - 富粘帖操作模块
 * @author Tevin
 */

const {File} = require('atom');
const fs = require('fs');
const clipboard = require('clipboard');
const crypto = require('crypto');
const mngFolder = require('../build/manageFolder');

module.exports = {
    /**
     * 粘贴图片
     * @param {object} editor - 当前文档编辑器的引用
     * @param {string} editPath - 当前文档的路径
     */
    paster: function (editor, editPath) {
        let imgbuffer = null;
        let ext = 'png';
        //网页粘贴检查
        const html = clipboard.readHtml();
        if (html && html.length > 2) {
            //形如 <div><img src="file:///..."></div> 格式的 html 视为图片粘贴
            const htmlMatch1 = html.match(/^<div>\s*<img src="(.*?)" *.*?>\s*<\/div>$/i);
            //形如 <img src=""> 格式的 html 视为图片粘贴
            const htmlMatch2 = html.match(/^<img src="(.*?)" *.*?>$/i);
            if (htmlMatch1 && htmlMatch1.length >= 2 && htmlMatch1[1].indexOf('file:') === 0) {
                imgbuffer = fs.readFileSync(htmlMatch1[1].substr(8), 'binary');
                ext = htmlMatch1[1].split('.');
                ext = ext[ext.length - 1];
                ext = ext.split(/[\?#]/)[0];
            } else if (htmlMatch2 && htmlMatch2.length >= 2) {
                // file 协议视为本地图片，转移图片
                if (htmlMatch2[1].indexOf('file:') === 0) {
                    imgbuffer = fs.readFileSync(htmlMatch1[1].substr(8), 'binary');
                    ext = htmlMatch1[1].split('.');
                    ext = ext[ext.length - 1];
                    ext = ext.split(/[\?#]/)[0];
                }
                // http 协议视为远程图片
                else if (htmlMatch2[1].indexOf('http') === 0) {
                    //如果此时粘贴板能读取图片，则读取
                    const img = clipboard.readImage();
                    if (!img.isEmpty()) {
                        imgbuffer = img.toPng();
                    }
                    //不能读取图片，插入远程地址
                    else {
                        return editor.insertText('![](' + htmlMatch2[1].split(/[\?#]/)[0] + ')', editor);
                    }
                }
            }
            //否则视为大段 html 粘贴模式
            else {
                return;
            }
        }
        //截图粘贴检查
        else {
            const img = clipboard.readImage();
            if (img.isEmpty()) {
                return;
            }
            imgbuffer = img.toPng();
        }
        //文件保存
        const md5 = crypto.createHash('md5');
        md5.update(imgbuffer);
        const {mdFile, assetsDirPath, createDirPath, insertPath, writePath} = this.getPaths(editPath);
        if (!mdFile) {
            return;
        }
        const filename = '' + (mdFile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '').split(/[-_]/)[0]) +
            '-' + (md5.digest('hex').slice(0, 8)) + '.' + ext;
        mngFolder.createFolder(createDirPath);
        fs.writeFile(writePath + filename, imgbuffer, 'binary', () => {
            editor.insertText('![](assets/' + insertPath + filename + ')', editor);
        });
    },
    /**
     * 计算操作路径
     * @param {string} editPath - 当前文档的路径
     * @returns {object} 粘贴图片需要的路径列表
     */
    getPaths: function (editPath) {
        //路径计算
        const mdFile = new File(editPath);
        let assetsDirPath,  //项目assets文件夹地址
            createDirPath,  //本次创建图片地址
            insertPath,  //插入文档的图片引用路径
            writePath,  //图片输出路径
            parentDir;
        //library直接子级
        if (mdFile.getParent().getBaseName() === 'library') {
            assetsDirPath = mdFile.getParent().getParent().getPath() + '/assets';
            createDirPath = assetsDirPath + '/';
            writePath = assetsDirPath + '/';
            insertPath = '';
        }
        //library下一级目录
        else if (mdFile.getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + '/assets';
            createDirPath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0] + '/';
            insertPath = parentDir.getBaseName().split(/[-_]/)[0] + '/';
        }
        //library下二级目录
        else if (mdFile.getParent().getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent().getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + '/assets';
            createDirPath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0] + '/';
            insertPath = parentDir.getBaseName().split(/[-_]/)[0] + '/';
        }
        //其他目录
        else {
            return {};
        }
        return {
            mdFile: mdFile,
            assetsDirPath: assetsDirPath,
            createDirPath: createDirPath,
            insertPath: insertPath,
            writePath: writePath
        }
    }
};