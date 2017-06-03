/**
 * 工作端 - 文件夹管理模块
 * @author Tevin
 */

const fs = require('fs');

module.exports = {
    /**
     * 递归分析指定文件夹下的目录结构
     * @param {string} dirPath - 指定要分析的目录
     * @param {number} [depth=0] - 文件夹深度
     * @param {object} [tree={}] - 当前深度结构的树形
     * @param {object[]} [list=[]] - 当前深度结构的列表
     * @param {string[]} [files=[]] - 当前深度文件的列表
     * @private
     */
    _listSubFolder: function (dirPath, depth = 0, tree = {}, list = [], files = []) {
        try {
            let filePath;
            for (let fileName of fs.readdirSync(dirPath)) {
                //文件路径
                filePath = dirPath + (depth > 0 ? '/' : '') + fileName;
                //跳过点号开头的系统保留文件
                if (/^\./.test(fileName)) {
                    continue;
                }
                //文件夹及其递归处理
                if (fs.statSync(filePath).isDirectory(filePath)) {
                    //读取下一级数据
                    const [tempTree, tempList, tempFiles] = this._listSubFolder(filePath, depth + 1);
                    //记录子级的树形
                    tree[fileName] = tempTree;
                    //将此文件夹和其所有子级文件(夹)加入结构列表
                    list.push({
                        depth: depth,
                        type: 'folder',
                        name: fileName,
                        path: dirPath
                    }, ...tempList);
                    //将所有子级文件加入文件列表
                    files.push(...tempFiles);
                }
                //第二层以下深度才允许使用文件（第一层仅允许为文件夹）
                else {
                    if (depth > 0) {
                        //类型为文件时，树形标记为否
                        tree[fileName] = false;
                        //将此文件加入结构列表
                        list.push({
                            depth: depth,
                            type: 'file',
                            name: fileName,
                            path: dirPath
                        });
                        //将此文件加入文件列表
                        files.push(filePath);
                    }
                }
            }
        } catch (err) {
            //readdirSync读取失败时仅抛错
            console.error(err);
        }
        return [tree, list, files];
    },
    /**
     * 读取文库library文件夹树形数据
     * @param {string} path - 文库library文件夹路径
     * @returns {object} 树形数据、文件列表数据、文件夹列表数据
     */
    readLibraryTree: function (path) {
        if (!/library[\\\/]$/.test(path)) {
            console.warn('The path is not a library.');
            return [];
        }
        return this._listSubFolder(path);
    },
    /**
     * 递归清空文件夹
     * @param {string} path - 要清空的文件夹
     */
    cleanFolder: function (path) {
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
    /**
     * 获取项目文件夹
     * @param path - 需要计算的文件夹路径
     * @return {strong|boolean} 放回当前文库项目的路径，如果非文库返回 false
     */
    getProjectFoloder: function (path) {
        path = this.getLibraryFolder(path);
        if (path) {
            return path.split('library')[0];
        } else {
            return false;
        }
    },
    /**
     * 获取 library 目录路径 (通过反向查找，而不是 split 截断)
     * @param {string} path - 需要计算的文件夹路径
     * @returns {string|boolean} 返回当前文库 library 目录的路径，如果非文库则返回 false
     */
    getLibraryFolder: function (path) {
        if (!path) {
            return false;
        }
        //如果当前路径不存在 library 字眼，则判断路径下是否存在 library 文件夹
        if (path.indexOf('library') < 0) {
            //存在返回拼合路径
            if (fs.existsSync(path + '/library/')) {
                return path.replace(/\/$/, '') + '/library/';
            }
            //不存在继续检查上一级
            else {
                return this.getLibraryFolder(this.getParentFolder(path));
            }
        }
        //存在 library 字眼，反向层层识别，直到 library/ 为止
        else {
            if (/library\/?$/.test(path)) {
                return path.replace(/\/?$/, '/');
            } else {
                return this.getLibraryFolder(this.getParentFolder(path));
            }
        }
    },
    /**
     * 获取当前文件(夹)所属上级目录的路径
     * @param {string} path - 需要计算的文件夹路径
     * @returns {string|boolean} 父级文件夹路径
     */
    getParentFolder: function (path) {
        path = path.replace(/\\/g, '/');
        // Win 平台，如果太短直接返回 false
        if (/^[a-zA-Z]:/.test(path) && path.length < 3) {
            return false;
        }
        // Linux 平台，如果斜杆数只有一个，返回 false
        if (path.replace('/', '').indexOf('/') < 0) {
            return false;
        }
        return path.replace(/\/$/, '').replace(/\/[^\/]+$/, '/');
    },
    /**
     * 获取当前文件(夹)的名称
     * @param {string} path - 需要计算的路径
     * @return {string} 文件(夹)名称
     */
    getBaseName: function (path) {
        return path.replace(/\\/g, '/').replace(/\/$/, '').match(/\/([^\/]*?)$/)[1];
    },
    /**
     * 递归创建文件夹
     * @param {string} path - 需要创建的文件夹路径
     */
    createFolder: function (path) {
        //先判断父级文件夹是否存在，不存在先创建父级文件夹
        const parentPath = this.getParentFolder(path);
        if (!fs.existsSync(parentPath)) {
            this.createFolder(parentPath);  //向上递归创建父级
            this.createFolder(path);        //创建完父级后再创建本级
        }
        //如果父级已存在，直接创建本级
        else {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, 0o777);
            }
        }
    },
    /**
     * 判断一个文件夹是否为 amWiki 文库项目
     * @param {string} path - 需要判断的文件夹路径
     * @returns {boolean|string} 判断为否时返回 false，判断为真时返回项目根目录的路径
     */
    isAmWiki: function (path) {
        if (!path && typeof path !== 'string') {
            return false;
        }
        path = path.replace(/\\/g, '/');
        path = path.indexOf('config.json') < 0 ? path : path.split('config.json')[0];
        path = path.indexOf('index.html') < 0 ? path : path.split('index.html')[0];
        //获取 library 路径
        path = this.getProjectFoloder(path);
        if (!path) {
            return false;
        }
        //通过识别文件夹子项来判定
        else {
            let states = [
                fs.existsSync(path + 'library/'),
                fs.existsSync(path + 'amWiki/'),
                fs.existsSync(path + 'config.json'),
                fs.existsSync(path + 'index.html')
            ];
            return states[0] && states[1] && states[2] && states[3] ? path : false;
        }
    }
};