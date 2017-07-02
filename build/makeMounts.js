/**
 * 工作端 － 创建 ./mounts/*.js 页面挂载数据模块
 * @author Tevin
 */


const fs = require('fs');
const mngFolder = require('./manageFolder');
const mngWiki = require('./manageWiki');

const makeMounts = (function () {
    return {
        /**
         * 创建 mounts 数据
         * @param {string} editPath
         * @param {boolean} [offMsg] - 是否关闭提示
         * @public
         */
        make: function (editPath, offMsg) {
            const rootPath = mngFolder.getProjectFolder(editPath);
            if (!this._checkMountsAllow(rootPath)) {
                if (offMsg !== true) {
                    alert('更新失败！\n未检测到 “localMounts” 配置，请在 config.json 中配置');
                }
                return;
            }
            const libPath = rootPath + 'library/';
            const [, list,] = mngFolder.readLibraryTree(libPath);
            const mountData = this._getMountsData(libPath, list);
            const mountFiles = this._exportMounts(mountData, rootPath);
            this._updateMountLinks(mountFiles, rootPath);
        },
        /**
         * 检查 mounts 创建许可
         * @param rootPath
         * @returns {boolean}
         * @private
         */
        _checkMountsAllow: function (rootPath) {
            const wiki = mngWiki.getWikiByRoot(rootPath);
            if (!wiki) {
                return false;
            }
            const config = wiki.config;
            if (typeof config.localMounts !== 'undefined') {
                return config.localMounts === true || typeof config.localMounts === 'object';
            } else {
                return false;
            }
        },
        /**
         * 收集 mounts 数据
         * @param {string} libPath
         * @param {[object]} list
         * @returns {{array}}
         * @private
         */
        _getMountsData: function (libPath, list) {
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
            return mountData;
        },
        /**
         * 输出 ./mounts/*.js 文件
         * @param {{array}} mountData
         * @param {string} rootPath
         * @returns {array}
         * @private
         */
        _exportMounts: function (mountData, rootPath) {
            const mountPath = rootPath + 'mounts/';
            if (!fs.existsSync(mountPath)) {
                fs.mkdirSync(mountPath, 0o777);
            } else {
                mngFolder.cleanFolder(mountPath);
            }
            const mountTemplate = 'if(typeof pageMountData==\'undefined\'){pageMountData={}};' +
                'pageMountData[\'{{id}}\']={{content}}';
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
         * 更新 inde.html 文件的挂载
         * @param {array} mountFiles
         * @param {string} rootPath
         * @private
         */
        _updateMountLinks: function (mountFiles, rootPath) {
            let linksHtml = '';
            for (let fileName of mountFiles) {
                linksHtml += '<script src="mounts/' + fileName + '"></script>';
            }
            let indexSrc = fs.readFileSync(rootPath + 'index.html', 'utf-8');
            const mountReg = /<div(.*?)aw-include="mountLinks"(.*?)>(.*?)<\/div>/;
            indexSrc = indexSrc.replace(mountReg, function (m, s1, s2) {
                let mountHtml = '<div' + s1 + 'aw-include="mountLinks"' + s2 + '>' +
                    linksHtml + '</div>';
                return mountHtml;
            });
            fs.writeFileSync(rootPath + 'index.html', indexSrc, 'utf-8');
        }
    };
})();

module.exports = makeMounts;
