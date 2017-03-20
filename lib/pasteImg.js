/**
 * @desc 工作端·粘帖图片模块
 * @author Tevin
 */

const {File} = require('atom');
const fs = require("fs");
const clipboard = require('clipboard');
const crypto = require('crypto');
const mngFolder = require('../build/manageFolder');

module.exports = {
    paster: function (editor, editPath) {
        let img = clipboard.readImage();
        if (img.isEmpty()) {
            return;
        }
        let imgbuffer = img.toPng();
        //文件保存
        let md5 = crypto.createHash('md5');
        md5.update(imgbuffer);
        let {mdFile, assetsDirPath, createDirPath, insertPath, writePath} = this.getPaths(editPath);
        if (!mdFile) {
            return;
        }
        let filename = "" + (mdFile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '').split(/[-_]/)[0]) +
            "-" + (md5.digest('hex').slice(0, 8)) + ".png";
        mngFolder.createFolder(createDirPath, () => {
            fs.writeFile(writePath + filename, imgbuffer, 'binary', () => {
                editor.insertText("![](assets/" + insertPath + filename + ")", editor);
            });
        });
    },
    getPaths: function (editorPath) {
        //路径计算
        let assetsDirPath,  //项目assets文件夹地址
            createDirPath,  //本次创建图片地址
            insertPath,  //插入文档的图片引用路径
            writePath;  //图片输出路径
        let mdFile = new File(editorPath);
        let parentDir;
        //library直接子级
        if (mdFile.getParent().getBaseName() === 'library') {
            assetsDirPath = mdFile.getParent().getParent().getPath() + "/assets";
            createDirPath = assetsDirPath + '/';
            writePath = assetsDirPath + '/';
            insertPath = '';
        }
        //library下一级目录
        else if (mdFile.getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + "/assets";
            createDirPath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0] + '/';
            insertPath = parentDir.getBaseName().split(/[-_]/)[0] + '/';
        }
        //library下二级目录
        else if (mdFile.getParent().getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent().getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + "/assets";
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