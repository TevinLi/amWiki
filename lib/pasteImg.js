/**
 * @desc 工作端·粘帖图片模块
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
        const img = clipboard.readImage();
        if (img.isEmpty()) {
            return;
        }
        const imgbuffer = img.toPng();
        //文件保存
        const md5 = crypto.createHash('md5');
        md5.update(imgbuffer);
        const {mdFile, assetsDirPath, createDirPath, insertPath, writePath} = this.getPaths(editPath);
        if (!mdFile) {
            return;
        }
        const filename = '' + (mdFile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '').split(/[-_]/)[0]) +
            '-' + (md5.digest('hex').slice(0, 8)) + '.png';
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