/**
 * @desc 工作端·文件夹管理模块
 * @author Tevin
 */

const fs = require('fs');

module.exports = {
    //读取文库文件夹
    readLibraryTree: function (path, callback) {
        if (!/library[\\\/]$/.test(path)) {
            callback('The path is not a library.');
            return;
        }
        const tree = {};
        const folders = [];
        const files = [];
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
    //清空文件夹
    cleanFolder: function(path) {
        const list = fs.readdirSync(path);
        let path2;
        for (let item of list) {
            path2 = path + '/' + item;
            if (fs.statSync(path2).isDirectory(path2)) {
                if (item.indexOf('.') !== 0) {  //跳过特殊文件夹
                    this.cleanFolder(path2);
                    fs.rmdirSync(path2);
                }
            } else {
                fs.unlinkSync(path2);
            }
        }
    },
    //创建文件夹
    createFolder: function (path, callback) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, 0o777);
        }
        callback && callback();
    },
    //判断一个文件夹是否为amWiki文库项目
    isAmWiki: function (path) {
        path = path.indexOf('library') < 0 ? path : path.split('library')[0];
        path = path.indexOf('config.json') < 0 ? path : path.split('config.json')[0];
        path = path.indexOf('index.html') < 0 ? path : path.split('index.html')[0];
        let states = [
            fs.existsSync(path + '/library/'),
            fs.existsSync(path + '/amWiki/'),
            fs.existsSync(path + '/config.json'),
            fs.existsSync(path + '/index.html')
        ];
        return states[0] && states[1] && states[2] && states[3] ? path : false;
    }
};