/**
 * 工作端 - 导出 github-wiki 模块
 * @author Tevin
 */

const fs = require('fs');
const co = require('../modules/co');
const mngFolder = require('./manageFolder');

module.exports = {
    //拷贝一张图片
    _copyImg: function (from, to) {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    },
    //拷贝一篇文档
    _copyMd: function (fileName, pathTo) {
        let file = fs.readFileSync(fileName[0], 'utf-8');
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
    //导出导航、底部签名
    _exportNavigation: function (fileList, duplicate, pathFrom, pathTo) {
        let navigation = fs.readFileSync(pathFrom + '/$navigation.md', 'utf-8');
        const list = fileList.concat(duplicate);
        let path, name;
        for (let item of list) {
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
    //导出首页
    _exportHome: function (pathFrom, pathTo) {
        let file = fs.readFileSync(pathFrom + '/首页.md', 'utf-8');
        file = file
            //相对路径图片地址转换
            .replace(/!\[(.*?)]\(assets(.*?)\)/g, '![$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/\[(.*?)]\(assets(.*?)\)/g, '[$1](' + this._githubUrl + 'wiki/images$2)')
            .replace(/<img(.*?)src="assets(.*?)"/g, '<img$1src="' + this._githubUrl + 'wiki/images$2"')
            .replace(/<a(.*?)href="assets(.*?)"/g, '<a$1href="' + this._githubUrl + 'wiki/images$2"')
            //logo复制与图片引用地址转换
            .replace('amWiki/images/logo.png', () => {
                this._copyImg(pathFrom + '../amWiki/images/logo.png', pathTo + '\\images\\amWiki-logo.png');
                return this._githubUrl + 'wiki/images/amWiki-logo.png';
            });
        fs.writeFileSync(pathTo + '/Home.md', file, 'utf-8');
    },
    //导出图片
    _exportImage: function (pathFrom, pathTo) {
        if (!fs.existsSync(pathTo + '/images/')) {
            fs.mkdirSync(pathTo + '/images/', 0o777);
        }
        //文件夹拷贝
        const copyFolder = (from, to) => {
            const list = fs.readdirSync(from);
            let path, to2;
            for (let item of list) {
                path = from + '/' + item;
                to2 = to + '/' + item;
                if (fs.statSync(path).isDirectory(path)) {
                    fs.mkdirSync(to2, 0o777);
                    copyFolder(path, to + '/' + item);
                } else {
                    this._copyImg(path, to + '/' + item);
                }
            }
        };
        if (fs.existsSync(pathFrom + '../assets/')) {
            copyFolder(pathFrom + '../assets/', pathTo + '/images/');
        }
    },
    //检查重名
    _checkDuplicate: function (fileList) {
        const dup = [];
        for (let i = 0, item; item = fileList[i]; i++) {
            for (let j = i + 1, item2; item2 = fileList[j]; j++) {
                if (item[1] === item2[1]) {
                    dup.push([item, item2]);
                }
            }
        }
        return dup;
    },
    //导出重复文档
    _exportDuplicate: function (list, pathTo) {
        if (list.length === 0) {
            return;
        }
        const checkExist = (fileName) => {
            //如果已存在，增加空格
            if (fs.existsSync(pathTo + '/' + fileName[1])) {
                fileName[1] = fileName[1].replace(/\.md$/, ' .md');
                checkExist(fileName);
            }
            //不存在正常复制
            else {
                this._copyMd(fileName, pathTo);
            }
        };
        for (let fileName of list) {
            checkExist(fileName);
        }
    },
    //导出普通文档
    _exportNormal: function (list, pathTo) {
        if (list.length === 0) {
            return;
        }
        for (let fileName of list) {
            this._copyMd(fileName, pathTo);
        }
    },
    //开始导出
    _toExport: function (pathFrom, pathTo, fileList, duplicates) {
        const that = this;
        return co(function* () {
            if (fs.readdirSync(pathTo).length > 0 && (yield confirm2('所选导出文件夹不为空，是否需要清空？'))) {
                mngFolder.cleanFolder(pathTo);
            }
            let fileList2 = [];
            const duplicate2 = [];
            if (typeof duplicates !== 'undefined') {
                for (let file of fileList) {
                    let fileDup = false;
                    for (let dup of duplicates) {
                        if (file[0] === dup) {
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
            that._exportNormal(fileList2, pathTo);
            that._exportDuplicate(duplicate2, pathTo);
            that._exportImage(pathFrom, pathTo);
            that._exportHome(pathFrom, pathTo);
            that._exportNavigation(fileList2, duplicate2, pathFrom, pathTo);
        }).catch((e) => {
            console.error(e);
        });
    },
    //导出准备
    _toPrepare: function (pathFrom, pathTo) {
        const that = this;
        return co(function*() {
            const fileList = [];
            pathFrom += /[\\\/]$/.test(pathFrom) ? 'library/' : '/library/';
            //读取文件夹
            const [, , files] = mngFolder.readLibraryTree(pathFrom);
            if (files.length === 0) {
                return;
            }
            let fileName = '';
            //提取文件名
            for (let item of files) {
                fileName = item.split(/[\\\/]/);
                fileList.push([
                    item,
                    fileName[fileName.length - 1].replace(/^\d+(\.\d+)?[-_](.*?)$/, '$2')
                ]);
            }
            //重名检查
            const duplicate = that._checkDuplicate(fileList);
            //重名文件单独处理
            if (duplicate.length > 0) {
                const dups = [];
                let message = '以下文件脱离文件夹偏平化时将会重名：\n\n';
                for (let j = 0, dup; dup = duplicate[j]; j++) {
                    message += dup[0][0].replace(/\//g, '\\') + '\n' +
                        dup[1][0].replace(/\//g, '\\') + '\n\n';
                    dups.push(dup[0][0], dup[1][0]);
                }
                message += '点击确认将自动处理（追加额外空格）并继续导出；\n' +
                    '点击取消将退出导出，您可以在改名后再次重新导出。';
                if (yield confirm2(message)) {
                    return that._toExport(pathFrom, pathTo, fileList, dups);
                }
            } else {
                return that._toExport(pathFrom, pathTo, fileList);
            }
        }).catch((e) => {
            console.error(e);
        });
    },
    //GitHub地址
    _githubUrl: '',
    //解析 GitHub url
    _parseGithubUrl: function (path) {
        const config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf-8'));
        if (typeof config['github-url'] === 'undefined') {
            alert('导出失败！\n未检测到 “github-url” 配置，请在 config.json 中配置您项目的 github-url');
            return false;
        }
        const url = config['github-url'];
        if (url.indexOf('github.com') === 0 || url.split('github.com')[1] === '') {
            alert('导出失败！\n请以https开头，配置完整的 github URL！');
            return false;
        }
        const urlArr = url.split('github.com')[1].split('/');
        if (urlArr.length < 3) {
            alert('导出失败！\n请配置完整 github 项目路径！');
            return false;
        }
        return '/' + urlArr[1] + '/' + urlArr[2] + '/';
    },
    /**
     * 导出为github-wiki
     * @param {string} root - 文库项目根目录
     * @param {string} outputPath - 输出路径
     * @returns {promise}
     */
    export: function (root, outputPath) {
        const that = this;
        return co(function* () {
            //检测 GitHub 项目地址
            that._githubUrl = that._parseGithubUrl(root.split('library')[0]);
            if (!that._githubUrl) {
                return;
            }
            yield that._toPrepare(root, outputPath);
        });
    }
};
