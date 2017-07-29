/**
 * 工作端 － 创建 mounts/*.js 页面挂载数据模块
 * @author Tevin
 */


const fs = require('fs');
const mngFolder = require('./manageFolder');
const mngWiki = require('./manageWiki');

const makeMounts = (function () {
    return {
        /**
         * 创建 mounts 数据
         * @param {String} editPath
         * @param {Boolean} [offMsg] - 是否关闭提示
         * @public
         */
        make: function (editPath, offMsg) {
            const rootPath = mngFolder.getProjectFolder(editPath);
            if (!this._checkMountsAllow(rootPath)) {
                if (offMsg !== true) {
                    alert('更新失败！\n配置项“page-mounts”不存在或不为 true，请在 config.json 中配置');
                }
                return;
            }
            const libPath = rootPath + 'library/';
            const [, list,] = mngFolder.readLibraryTree(libPath);
            const mountData = this._getMountsData(libPath, rootPath, list);
            const mountFiles = this._exportMounts(mountData, rootPath);
            this._updateMountLinks(mountFiles, rootPath);
        },
        /**
         * 检查 mounts 创建许可
         * @param {String} rootPath
         * @returns {Boolean}
         * @private
         */
        _checkMountsAllow: function (rootPath) {
            const wiki = mngWiki.getWikiByRoot(rootPath);
            if (!wiki) {
                return false;
            }
            const config = wiki.config;
            if (typeof config.pageMounts !== 'undefined') {
                return config.pageMounts === true || typeof config.pageMounts === 'object';
            } else {
                return false;
            }
        },
        /**
         * 收集 mounts 数据
         * @param {String} libPath
         * @param {String} rootPath
         * @param {[Object]} list
         * @returns {{Array}}
         * @private
         */
        _getMountsData: function (libPath, rootPath, list) {
            const mountData = {};
            const timestamp = Date.now();
            for (let file of list) {
                if (file.type !== 'file') {
                    continue;
                }
                let filePath = file.path + '/' + file.name;
                let lv1Id = 'm' + mngFolder.getLevel1Id(filePath, libPath);
                if (lv1Id.length === 0) {
                    continue;
                }
                if (typeof mountData[lv1Id] === 'undefined') {
                    mountData[lv1Id] = [];
                }
                mountData[lv1Id].push({
                    name: file.name,
                    path: filePath.substr(libPath.length),
                    content: fs.readFileSync(filePath, 'utf-8'),
                    timestamp: timestamp
                });
            }
            mountData['home'] = this._getHomeMount(libPath);
            mountData['nav'] = this._getNavMount(libPath);
            mountData['icon'] = this._getIconsMount(rootPath);
            //console.log(mountData['home'].name, mountData['nav'].name, mountData['icon'].name);
            mountData['home'].timestamp = mountData['nav'].timestamp = mountData['icon'].timestamp = timestamp;
            return mountData;
        },
        /**
         * 获取首页挂载数据
         * @param {String} libPath
         * @returns {{name: String, path: String, content: String}}
         * @private
         */
        _getHomeMount: function (libPath) {
            const list = mngFolder.readFolder(libPath);
            for (let name of list) {
                if (/^home[-_].*?\.md$/.test(name) || name === '首页.md') {
                    const homePath = libPath + name;
                    return {
                        name: name,
                        path: homePath.substr(libPath.length),
                        content: fs.readFileSync(homePath, 'utf-8'),
                    }
                }
            }
        },
        /**
         * 获取导航挂载数据
         * @param {String} libPath
         * @returns {{name: String, path: String, content: String}}
         * @private
         */
        _getNavMount: function (libPath) {
            const filePath = libPath + '$navigation.md';
            return {
                name: '$navigation.md',
                path: filePath.substr(libPath.length),
                content: fs.readFileSync(filePath, 'utf-8')
            }
        },
        /**
         * 获取图标挂载数据
         * @param {String} rootPath
         * @returns {{name: String, path: String, content: String}}
         * @private
         */
        _getIconsMount: function (rootPath) {
            const filePath = rootPath + 'amWiki/images/icons.svg';
            return {
                name: 'icons.svg',
                path: '../' + filePath.substr(rootPath.length),
                content: fs.readFileSync(filePath, 'utf-8')
            }
        },
        /**
         * 输出 ./mounts/*.js 文件
         * @param {{Array}} mountData
         * @param {String} rootPath
         * @returns {Array}
         * @private
         */
        _exportMounts: function (mountData, rootPath) {
            const mountPath = rootPath + 'amWiki/mounts/';
            if (!fs.existsSync(mountPath)) {
                fs.mkdirSync(mountPath, 0o777);
            } else {
                mngFolder.cleanFolder(mountPath);
            }
            const mountTemplate = 'if(typeof AWPageMounts==\'undefined\'){AWPageMounts={}};' +
                'AWPageMounts[\'{{id}}\']={{content}}';
            const mountFiles = [];
            for (let mountId in mountData) {
                if (mountData.hasOwnProperty(mountId)) {
                    let mountContent = JSON.stringify(mountData[mountId]).replace(/'/g, '\\\'');
                    mountContent = mountTemplate
                        .replace('{{id}}', mountId)
                        .replace('{{content}}', mountContent);
                    let mountName = mountId + '-' + mountContent.length + '.js';
                    mountFiles.push(mountName);
                    fs.writeFileSync(mountPath + mountName, mountContent, 'utf-8');
                }
            }
            return mountFiles;
        },
        /**
         * 更新 index.html 文件的挂载
         * @param {Array} mountFiles
         * @param {String} rootPath
         * @private
         */
        _updateMountLinks: function (mountFiles, rootPath) {
            let linksHtml = '';
            for (let fileName of mountFiles) {
                linksHtml += '<script src="amWiki/mounts/' + fileName + '"></script>';
            }
            let indexSrc = fs.readFileSync(rootPath + 'index.html', 'utf-8');
            const mountReg = /<div(.*?)aw-include="mountLinks"(.*?)>([\s\S]*?)<\/div>/;
            indexSrc = indexSrc.replace(mountReg, function (m, s1, s2, s3) {
                return '<div' + s1 + 'aw-include="mountLinks"' + s2 + '>' +
                    linksHtml +  s3 + '</div>';
            });
            fs.writeFileSync(rootPath + 'index.html', indexSrc, 'utf-8');
        }
    };
})();

module.exports = makeMounts;
