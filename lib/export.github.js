/**
 * @desc amWiki 工作端·导出项目(github)模块
  * @author 耀轩之
 * @copyright 在Tevin的原基础上修改所得
 */

var vscode = require('vscode');
var fs = require("fs");
var directories = require('./directories');

module.exports = {
    /**
     * @desc 复制图片文件到指定目录
     * @param[in] from 待拷贝的文件路径
     * @param[in] to 拷贝后的所在路径
     * @return 无
     */
    _copyImg: function (from, to) {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    },

    /**
     * @desc 拷贝一篇文档
     * @param[in] fileName 文件名
     * @param[in] pathTo 拷贝后的所在路径
     */
    _copyMd: function (fileName, pathTo) {
        var file = fs.readFileSync(fileName[0], 'utf-8');
        //相对路径图片地址转换
        file = file
            .replace(/!\[(.*?)]\(assets(.*?)\)/g, '![$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/\[(.*?)]\(assets(.*?)\)/g, '[$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/<img(.*?)src="assets(.*?)"/g, '<img$1src="' + this._githubUrl + 'wiki/images$2"')
            .replace(/<a(.*?)href="assets(.*?)"/g, '<a$1href="' + this._githubUrl + 'wiki/images$2"');
        //页内目录 github 规则转换
        file = file.replace(/\[(.*?)]\(#(.*?) "(.*?)"\)/g, function (match, s1, s2, s3) {
            s2 = s2
                .replace(/( |%20)/g, '-')
                .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '')
                .toLocaleLowerCase();
            return '[' + s1 + '](#' + s2 + ' "' + s3 + '")';
        });
        fs.writeFileSync(pathTo + '/' + fileName[1], file, 'utf-8');
    },

    /**
     * @desc 导出导航、底部签名
     * @param[in] fileList 文件列表
     * @param[in] duplicate 文件重复的标记
     * @param[in] 原文件的所在路径
     * @param[in] 拷贝后的所在路径
     * @return 无
     */
    _exportNavigation: function (fileList, duplicate, pathFrom, pathTo) {
        var navigation = fs.readFileSync(pathFrom + '/$navigation.md', 'utf-8');
        var list = fileList.concat(duplicate);
        var path, name;
        for (var i = 0, item; item = list[i]; i++) {
            path = item[0]
                .replace(/\\/g, '/')
                .split('library/')[1]
                .replace(/\.md$/, '');
            name = item[1]
                .replace(/\.md$/, '')
                .replace(/ /g, '%20');
            navigation = navigation.replace('?file=' + path, this._githubUrl + 'wiki/' + name);
        }
        navigation = navigation
            .replace('?file=首页', this._githubUrl + 'wiki')
            .replace('#### [首页]', '## WIKI 导航\n\n##### [首页]');
        navigation += '\n\n﹊﹊﹊﹊﹊﹊﹊﹊﹊﹊  \n' +
            '**This wiki is created by [[amWiki](https://github.com/TevinLi/amWiki)]**';
        fs.writeFileSync(pathTo + '/_Sidebar.md', navigation, 'utf-8');
    },

    /**
     * @desc 导出首页
     * @param[in] 原文件的所在路径
     * @param[in] 拷贝后的所在路径
     * @return 无
     */
    _exportHome: function (pathFrom, pathTo) {
        var that = this;
        var file = fs.readFileSync(pathFrom + '/首页.md', 'utf-8');
        file = file
            //相对路径图片地址转换
            .replace(/!\[(.*?)]\(assets(.*?)\)/g, '![$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/\[(.*?)]\(assets(.*?)\)/g, '[$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/<img(.*?)src="assets(.*?)"/g, '<img$1src="' + this._githubUrl + 'wiki/images$2"')
            .replace(/<a(.*?)href="assets(.*?)"/g, '<a$1href="' + this._githubUrl + 'wiki/images$2"')
            //logo复制与图片引用地址转换
            .replace('amWiki/images/logo.png', function () {
                that._copyImg(pathFrom + '../amWiki/images/logo.png', pathTo + '\\images\\amWiki-logo.png');
                return that._githubUrl + 'wiki/images/amWiki-logo.png';
            });
        fs.writeFileSync(pathTo + '/Home.md', file, 'utf-8');
    },

    /**
    * @desc 导出图片
    * @param[in] pathFrom 待拷贝的文件路径
    * @param[in] pathTo 拷贝后的所在路径
    * @return 无
    */
    _exportImage: function (pathFrom, pathTo) {
        var that = this;
        if (!fs.existsSync(pathTo + '/images/')) {
            fs.mkdirSync(pathTo + '/images/', 0777);
        }
        //文件夹拷贝
        var copyFolder = function (from, to) {
            var list = fs.readdirSync(from);
            var path, to2;
            for (var i = 0, item; item = list[i]; i++) {
                path = from + '/' + item;
                to2 = to + '/' + item;
                if (fs.statSync(path).isDirectory(path)) {
                    fs.mkdirSync(to2, 0777);
                    copyFolder(path, to + '/' + item);
                } else {
                    that._copyImg(path, to + '/' + item);
                }
            }
        };
        if (fs.existsSync(pathFrom + '../assets/')) {
            copyFolder(pathFrom + '../assets/', pathTo + '/images/');
        }
    },
    
    /**
     * @desc 检查文件列表是否存在重名文件
     * @param[in] fileList 待检查的文件列表
     * @return 返回重名的文件列表
     */
    _checkDuplicate: function (fileList) {
        var dup = [];
        for (var i = 0, item; item = fileList[i]; i++) {
            for (var j = i + 1, item2; item2 = fileList[j]; j++) {
                if (item[1] == item2[1]) {
                    dup.push([item, item2]);
                }
            }
        }
        return dup;
    },

    /**
     * @desc 导出重复文档
     * @param[in] list 待导出的重复文件列表
     * @param[in] pathTo 导出后的所在目录
     * @return 无
     */
    _exportDuplicate: function (list, pathTo) {
        if (list.length == 0) {
            return;
        }
        var that = this;
        var file;
        var checkExist = function (fileName) {
            //如果已存在，增加空格
            if (fs.existsSync(pathTo + '/' + fileName[1])) {
                fileName[1] = fileName[1].replace(/\.md$/, ' .md');
                checkExist(fileName);
            }
            //不存在正常复制
            else {
                that._copyMd(fileName, pathTo);
            }
        };
        for (var i = 0, fileName; fileName = list[i]; i++) {
            checkExist(fileName);
        }
    },
    
    /**
     * @desc 导出普通文档
     * @param[in] list 待导出的普通文件列表
     * @param[in] pathTo 导出后的所在目录
     * @return 无
     */
    _exportNormal: function (list, pathTo) {
        if (list.length == 0) {
            return;
        }
        for (var i = 0, fileName; fileName = list[i]; i++) {
            this._copyMd(fileName, pathTo);
        }
    },

    /**
     * @desc 验证某个文件夹是否为空
     * @param[in] pathFrom 原来的文件路径
     * @param[in] pathTo 处理后的所在文件路径
     * @param[in] fileList 待处理的文件列表
     * @param[in] duplicates 重复文件列表
     */
    _toExportEx: function (pathFrom, pathTo, fileList, duplicates) {
        var that = this;
        if (fs.readdirSync(pathTo).length > 0) {
            vscode.window.showInformationMessage('所选文件夹不为空，是否需要清空？', '清空').then(function (msg) {
                if (msg === '清空') {
                    directories.cleanDir(pathTo);
                }
                that._toExport(pathFrom, pathTo, fileList, duplicates);
            });
        } else {
            that._toExport(pathFrom, pathTo, fileList, duplicates);
        }
    },

     /**
     * @desc 开始导出
     * @param[in] pathFrom 原来的文件路径
     * @param[in] pathTo 处理后的所在文件路径
     * @param[in] fileList 待处理的文件列表
     * @param[in] duplicates 重复文件列表
     */
    _toExport: function (pathFrom, pathTo, fileList, duplicates) {
        var fileList2 = [];
        var duplicate2 = [];
        if (typeof duplicates != 'undefined') {
            for (var i = 0, file; file = fileList[i]; i++) {
                var fileDup = false;
                for (var j = 0, dup; dup = duplicates[j]; j++) {
                    if (file[0] == dup) {
                        fileDup = true;
                        duplicate2.push(file);
                        break;
                    }
                }
                if (!fileDup) {
                    fileList2.push(file);
                }
            }
        } else {
            fileList2 = fileList;
        }
        //开始拷贝
        this._exportNormal(fileList2, pathTo);
        this._exportDuplicate(duplicate2, pathTo);
        this._exportImage(pathFrom, pathTo);
        this._exportHome(pathFrom, pathTo);
        this._exportNavigation(fileList2, duplicate2, pathFrom, pathTo);
    },
    
    /**
     * @desc 导出准备
     * @param[in] pathFrom 原来的文件路径
     * @param[in] pathTo 处理后的所在文件路径
     * @return 无
     */
    _toPrepare: function (pathFrom, pathTo) {
        var that = this;
        var fileList = [];
        pathFrom += pathFrom.substr(pathFrom.length - 1, 1) == '\\' ? 'library\\' : '\\library\\';
        //读取文件夹
        directories.readLibraryDir(pathFrom, function (err, tree, files) {
            if (err) {
                console.log(err);
            } else {
                //console.log(tree, files);
                var fileName = '';
                //提取文件名
                for (var i = 0, item; item = files[i]; i++) {
                    fileName = item.split(/\\|\//);
                    fileList.push([
                        item,
                        fileName[fileName.length - 1].replace(/^\d+(\.\d+)?[-_](.*?)$/, '$2')
                    ]);
                }
                //重名检查
                var duplicate = that._checkDuplicate(fileList);
                //重名文件单独处理
                if (duplicate.length > 0) {
                    var dups = [];
                    var message = '以下文件脱离文件夹偏平化时将会重名：\n\n';
                    for (var j = 0, dup; dup = duplicate[j]; j++) {
                        message += dup[0][0].replace(/\//g, '\\') + '\n' +
                            dup[1][0].replace(/\//g, '\\') + '\n\n';
                        dups.push(dup[0][0], dup[1][0]);
                    }
                    message += '点击确认将自动处理（追加额外空格）并继续导出；\n' +
                        '点击取消将退出导出，您可以在改名后再次重新导出。';
                    vscode.window.showWarningMessage(message, '确认').then(function (msg) {
                        that._toExportEx(pathFrom, pathTo, fileList, dups);
                    });
                } else {
                    that._toExportEx(pathFrom, pathTo, fileList);
                }
            }
        });
    },
    //GitHub地址
    _githubUrl: '',


    /**
     * @desc 解析 GitHub url
     * @param[in] path 待处理的路径信息
     * @return 如果返回为false，则导出失败
     */
    _parseGithubUrl: function (path) {
        var config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf-8'));
        if (typeof config['github-url'] == 'undefined') {
            vscode.window.showWarningMessage('导出失败！\n未检测到 “github-url” 配置，请在 config.json 中配置您项目的 github-url');
            return false;
        }
        var url = config['github-url'];
        if (url.indexOf('github.com') == 0 || url.split('github.com')[1] == '') {
            vscode.window.showWarningMessage('导出失败！\n请配置完整 github 项目地址！');
            return false;
        }
        var urlArr = url.split('github.com')[1].split('/');
        if (urlArr.length < 3) {
            vscode.window.showWarningMessage('导出失败！\n请配置完整 github 项目地址！');
            return false;
        }
        return '/' + urlArr[1] + '/' + urlArr[2] + '/';
    },
    
    /**
     * @desc 导出文库为github wiki
     */
    export: function () {
        var that = this;
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var amWikiPath = vscode.workspace.rootPath;
        //检测是否为 amWiki 项目
        amWikiPath = directories.isAmWiki(amWikiPath);
        if (!amWikiPath) {
            vscode.window.showWarningMessage('导出失败！\n只能对一个 amWiki 项目进行导出！');
            return;
        }
        //检测 GitHub 项目地址
        this._githubUrl = this._parseGithubUrl(amWikiPath);
        if (!this._githubUrl) {
            return;
        }

        //选中保存github wiki的文件夹信息
        vscode.window.showInputBox({ placeHolder: '请输入存放github wiki的文件夹路径，如C:\\XXX\\Test', ignoreFocusOut: true }).then(function (msg) {
            console.log('当前输入的路径为：' + msg);
            if (msg !== 'undefined') {
                if (fs.existsSync(msg)) {
                    that._toPrepare(amWikiPath, msg);
                }
            }
        });
    }
};