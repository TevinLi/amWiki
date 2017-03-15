/**
 * @desc 工作端·粘帖图片模块
 * @author Tevin
 */

let environment = require('atom'),
    File = environment.File,
    Directory = environment.Directory;
let fs = require("fs");
let clipboard = require('clipboard');
let crypto = require("crypto");

module.exports = {
    paster: function () {
        let editor = atom.workspace.getActiveTextEditor();
        //状态验证，当编辑md文档时才允许操作
        let grammar, img;
        if (!editor) {
            return;
        }
        grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (editor.getPath().substr(-3) !== '.md') {
            return;
        }
        img = clipboard.readImage();
        if (img.isEmpty()) {
            return;
        }
        let paths = this.getPaths(editor.getPath());
        if (!paths) {
            return;
        }
        //文件保存
        let md5 = crypto.createHash('md5');
        let imgbuffer = img.toPng();
        md5.update(imgbuffer);
        let filename = "" + (paths.mdFile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '').split(/[-_]/)[0]) +
            "-" + (md5.digest('hex').slice(0, 8)) + ".png";
        this.createDirectory(paths.creatDirPath, function () {
            fs.writeFile(paths.writePath + filename, imgbuffer, 'binary', function () {
                editor.insertText("![](assets/" + paths.insertPath + filename + ")", editor);
            });
        });
    },
    getPaths: function (editorPath) {
        //路径计算
        let assetsDirPath,  //项目assets文件夹地址
            creatDirPath,  //本次创建图片地址
            insertPath,  //插入文档的图片引用路径
            writePath;  //图片输出路径
        let mdFile = new File(editorPath);
        let parentDir;
        //library直接子级
        if (mdFile.getParent().getBaseName() === 'library') {
            assetsDirPath = mdFile.getParent().getParent().getPath() + "/assets";
            creatDirPath = assetsDirPath + '/';
            writePath = assetsDirPath + '/';
            insertPath = '';
        }
        //library下一级目录
        else if (mdFile.getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + "/assets";
            creatDirPath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0] + '/';
            insertPath = parentDir.getBaseName().split(/[-_]/)[0] + '/';
        }
        //library下二级目录
        else if (mdFile.getParent().getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent().getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + "/assets";
            creatDirPath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split(/[-_]/)[0] + '/';
            insertPath = parentDir.getBaseName().split(/[-_]/)[0] + '/';
        }
        //其他目录
        else {
            return null;
        }
        return {
            mdFile: mdFile,
            assetsDirPath: assetsDirPath,
            creatDirPath: creatDirPath,
            insertPath: insertPath,
            writePath: writePath
        }
    },
    createDirectory: function (dirPath, callback) {
        let that = this;
        let assetsDir;
        assetsDir = new Directory(dirPath);
        assetsDir.exists().then(function (existed) {
            if (!existed) {
                assetsDir.create().then(function (created) {
                    if (created) {
                        callback();
                    }
                });
            } else {
                callback();
            }
        });
    }
};