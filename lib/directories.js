/**
 * @desc amWiki 工作端·文件夹管理模块
 * @author Tevin
 */

var fs = require('fs');

module.exports = {
    //读取文库文件夹
    readLibraryDir: function (path, callback) {
        if (!/library(\\|\/)$/.test(path)) {
            callback('The path is not a library.');
            return false;
        }

        //使用递归的方式来分析文件夹
        var tree = {};
        var folders = [];
        var files = [];
        var dirdepth = 0;
        browserSubFolder(dirdepth, tree, path, files, folders);

        callback(null, tree, files, folders);
        return true;
    },
    
    /**
     * @desc 循环检查每个库
     * @param[in] list 存放所有库的数组
     * @param[in] stepCallback 在此回调函数之中处理库
     */
    eachLibrary: function (list, stepCallback) {
        var list2 = [];
        var path = '';
        var atomProjects = atom.project.getPaths();
        for (var i = 0; i < list.length; i++) {
            //路径缺乏library字段弃用
            if (list[i].indexOf('library') < 0) {
                continue;
            }
            path = list[i].replace(/\\/g, '/').split('library')[0] + 'library/';
            //路径不存在弃用
            if (!fs.existsSync(path)) {
                continue;
            }
            //路径重复弃用
            var pathRepeat = false;
            for (var j = 0; j < list2.length; j++) {
                if (list2[j] == list[i]) {
                    pathRepeat = true;
                    break;
                }
            }
            if (pathRepeat) {
                continue;
            }
            //如果atom已经移除此项目，弃用
            /*var pathUseful = false;
            for (var k = 0; k < atomProjects.length; k++) {
                if (atomProjects[k].replace(/\\/g, '/') + '/library/' == path) {
                    pathUseful = true;
                    break;
                }
            }
            if (!pathUseful) {
                continue;
            }*/
            //有用路径
            list2.push(path);
            stepCallback && stepCallback(list[i]);
        }
        return list2;
    },
    
    /**
     * @desc 判断一个文件夹是否为amWiki文库项目 
     * @param[in] path 待判断的文件夹的路径
     */
    isAmWiki: function (path) {
        path = path.indexOf('library') < 0 ? path : path.split('library')[0];
        path = path.indexOf('config.json') < 0 ? path : path.split('config.json')[0];
        path = path.indexOf('index.html') < 0 ? path : path.split('index.html')[0];
        var states = [
            fs.existsSync(path + '/library/'),
            fs.existsSync(path + '/amWiki/'),
            fs.existsSync(path + '/config.json'),
            fs.existsSync(path + '/index.html')
        ];
        return states[0] && states[1] && states[2] && states[3] ? path : false;
    },
    
    /**
     * @desc 清空文件夹
     * @param[in] path 待清空的文件夹的路径
     */
    cleanDir: function (path) {
        var list = fs.readdirSync(path);
        var path2;
        for (var i = 0, item; item = list[i]; i++) {
            path2 = path + '/' + item;
            if (fs.statSync(path2).isDirectory(path2)) {
                if (item.indexOf('.') != 0) {  //跳过特殊文件夹
                    this.cleanDir(path2);
                    fs.rmdirSync(path2);
                }
            } else {
                fs.unlinkSync(path2);
            }
        }
    }
};

/**
 * @desc 遍历分析指定文件夹下的目录结构
 * @param dirdepth 当前相对文库library的层级深度
 * @param tree 当前相对文库library文件下的层级目录
 * @param filepath 当前分析到的文件夹路径信息
 * @param files 存放文库文件的数组
 * @param folders 存放文库文件夹的数组
 * @return 返回为false，则说明解析出错
 */
function browserSubFolder(dirdepth, tree, filepath, files, folders) {
    var bNoneError = true;
    var subfiles = fs.readdirSync(filepath);
    folders.push(filepath);
    for (var i = 0; i < subfiles.length; i++) {
        var path2 = '';
        if (dirdepth > 0) {
            path2 = filepath + '/' + subfiles[i];
        } else {
            path2 = filepath + subfiles[i];
        }
        if (/^\./.test(subfiles[i])) {
            continue;
        }
        if (fs.statSync(path2).isDirectory(path2)) {
            try {
                tree[subfiles[i]] = {};
                var tempDepth = dirdepth + 1;
                bNoneError = browserSubFolder(tempDepth, tree[subfiles[i]], path2, files, folders);
            } catch (err) {
                console.log('browserSubFolder error：'+err);
                callback(err);
                bNoneError = false;
                return bNoneError;
                // return false;
            }
        } else {
            if (dirdepth > 0) {
                tree[subfiles[i]] = false;
                files.push(path2);
            }
        }
    }
    return bNoneError;
}