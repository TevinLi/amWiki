/**
 * @desc 工作端·文件夹管理模块
 * @author Tevin
 */

let fs = require('fs');

module.exports = {
    //读取文库文件夹
    readLibraryDir: function (path, callback) {
        if (!/library[\\\/]$/.test(path)) {
            callback('The path is not a library.');
            return;
        }
        let tree = {};
        let folders = [];
        let files = [];
        try {
            let files1 = fs.readdirSync(path),
                files2, files3,
                path2, path3, path4;
            folders.push(path);
            //第一层，files1，library直接子级，仅允许为文件夹
            for (let i = 0; i < files1.length; i++) {
                path2 = path + files1[i];
                if (/^\./.test(files1[i])) {
                    continue;
                }
                if (fs.statSync(path2).isDirectory(path2)) {
                    try {
                        files2 = fs.readdirSync(path2);
                        folders.push(path2);
                        tree[files1[i]] = {};
                        //第二层，files2，允许为文件夹和文件
                        for (let j = 0; j < files2.length; j++) {
                            path3 = path2 + '/' + files2[j];
                            if (/^\./.test(files2[j])) {
                                continue;
                            }
                            if (fs.statSync(path3).isDirectory(path3)) {
                                try {
                                    files3 = fs.readdirSync(path3);
                                    folders.push(path3);
                                    tree[files1[i]][files2[j]] = {};
                                    //第三层，files3，仅允许为文件夹，不再深入
                                    for (let k = 0; k < files3.length; k++) {
                                        path4 = path3 + '/' + files3[k];
                                        if (/^\./.test(files3[k])) {
                                            continue;
                                        }
                                        if (!fs.statSync(path4).isDirectory(path4)) {
                                            tree[files1[i]][files2[j]][files3[k]] = false;
                                            files.push(path4);
                                        }
                                    }
                                } catch (err) {
                                    callback(err);
                                    return;
                                }
                            } else {
                                tree[files1[i]][files2[j]] = false;
                                files.push(path3);
                            }
                        }
                    } catch (err) {
                        callback(err);
                        return;
                    }
                }
            }
        } catch (err) {
            callback(err);
            return;
        }
        callback(null, tree, files, folders);
    },
    //循环检查每个库
    eachLibrary: function (list, stepCallback) {
        let list2 = [];
        let path = '';
        let atomProjects = atom.project.getPaths();
        for (let i = 0; i < list.length; i++) {
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
            let pathRepeat = false;
            for (let j = 0; j < list2.length; j++) {
                if (list2[j] === list[i]) {
                    pathRepeat = true;
                    break;
                }
            }
            if (pathRepeat) {
                continue;
            }
            //如果atom已经移除此项目，弃用
            /*let pathUseful = false;
            for (let k = 0; k < atomProjects.length; k++) {
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
    //清空文件夹
    cleanFolder: function(path) {
        let list = fs.readdirSync(path);
        let path2;
        for (let i = 0, item; item = list[i]; i++) {
            path2 = path + '/' + item;
            if (fs.statSync(path2).isDirectory(path2)) {
                if (item.indexOf('.') !== 0) {  //跳过特殊文件夹
                    this.cleanDir(path2);
                    fs.rmdirSync(path2);
                }
            } else {
                fs.unlinkSync(path2);
            }
        }
    }
};