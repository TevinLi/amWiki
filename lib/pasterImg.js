
var environment = require('atom'),
    File = environment.File,
    Directory = environment.Directory;
var fs = require("fs");
var clipboard = require('clipboard');
var crypto = require("crypto");



module.exports = {
    paster: function () {
        var editor = atom.workspace.getActiveTextEditor();

        //状态验证，当编辑md文档时才允许操作
        var grammar, img;
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
        if (editor.getPath().substr(-3) !== '.md') {
            return;
        }
        img = clipboard.readImage();
        if (img.isEmpty()) {
            return;
        }

        //路径计算
        var assetsDirPath,  //项目assets文件夹地址
            creatDirPath,  //本次创建图片地址
            insertPath,  //插入文档的图片引用路径
            writePath,  //图片输出路径
            mdFile;
        mdFile = new File(editor.getPath());
        if (mdFile.getParent().getParent().getBaseName() === 'library') {
            parentDir = mdFile.getParent();
            assetsDirPath = parentDir.getParent().getParent().getPath() + "/assets";
            creatDirPath = assetsDirPath + '/' + parentDir.getBaseName().split('-')[0];
            writePath = assetsDirPath + '/' + parentDir.getBaseName().split('-')[0] + '/';
            insertPath = parentDir.getBaseName().split('-')[0] + '/';
        } else if (mdFile.getParent().getBaseName() === 'library') {
            assetsDirPath = mdFile.getParent().getParent().getPath() + "/assets";
            creatDirPath = assetsDirPath + '/';
            writePath = assetsDirPath + '/';
            insertPath = '';
        } else {
            return;
        }

        //文件保存
        var md5 = crypto.createHash('md5');
        var imgbuffer = img.toPng();
        md5.update(imgbuffer);
        var filename = "" + (mdFile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '').split('-')[0]) +
            "-" + (md5.digest('hex').slice(0, 8)) + ".png";
        this.createDirectory(creatDirPath, function () {
            fs.writeFile(writePath + filename, imgbuffer, 'binary', function () {
                editor.insertText("![](assets/" + insertPath + filename + ")", editor);
            });
        });
    },
    createDirectory: function (dirPath, callback) {
        var that = this;
        var assetsDir;
        assetsDir = new Directory(dirPath);
        assetsDir.exists().then(function (existed) {
            if (!existed) {
                assetsDir.create().then(function (created) {
                    if (created) {
                        //console.log('Success Create dir');
                        callback();
                    }
                });
            } else {
                callback();
            }
        });
    }
};