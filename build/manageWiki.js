/**
 * 工作端 - 文库管理模块
 * @author Tevin
 */

const fs = require('fs');
const mngFolder = require('./manageFolder');
const tools = require('./tools');

const manageWiki = (function () {
    return {
        /**
         * 文库记录
         * @private
         */
        _wikis: null,
        /**
         * 绑定文库记录
         * @param {Object} wikis - 文库记录列表的引用
         * @public
         */
        linkWikis: function (wikis) {
            this._wikis = wikis;
        },
        /**
         * 获取所有文库记录
         * @returns {Object}
         * @public
         */
        getWikis: function () {
            return this._wikis
        },
        /**
         * 通过 root 地址获取单个文库记录
         * @param {String} root
         * @returns {Object}
         * @public
         */
        getWikiByRoot: function (root) {
            for (let wId in this._wikis){
                if (this._wikis.hasOwnProperty(wId)) {
                    if (this._wikis[wId].root === root) {
                        return this._wikis[wId]
                    }
                }
            }
            return null;
        },
        /**
         * 添加一个文库到记录
         * @param {String} root - 文库根目录
         * @param {Number} [id] - 文库的计算id
         * @public
         */
        addWiki: function (root, id = this.createWikiId(root)) {
            if (typeof root === 'undefined') {
                return;
            }
            if (typeof this._wikis[id] !== 'undefined') {
                //读取配置文件
                this.updateWikiConfig();
                return;
            }
            //文库信息
            this._wikis[id] = {
                //文库id，由真实地址计算而来，也就是说文库是基于不同地址来管理的
                id: id,
                //文库根目录地址
                root: root,
                //文库文档地址
                path: root + 'library/',
                //弃用标记，当文库被删除或转移走后，原有地址标记为弃用
                deprecated: false,
                //文件清单md5值，用于检测文库目录树变化
                treeMD5: '',
                //文库配置文件的解析结果
                config: null
            };
            //读取配置文件
            this.updateWikiConfig();
        },
        /**
         * 计算文库id
         * @param {String} root - 需要计算id的文库根目录
         * @returns {Number} 文库id，由根目录路径字符串计算而来
         * @public
         */
        createWikiId: function (root) {
            root = root.replace(/\\/g, '/').replace(/\/$/, '');
            //累加地址字符串每个字符Unicode值与此字符序号的乘积
            let code = 0;
            for (let j = 0; j < root.length; j++) {
                code += root.charCodeAt(j) * j;
            }
            //再与地址字符串长度拼合
            code = parseInt(root.length + '' + code);
            return code;
        },
        /**
         * 判断文库是否加入记录，未加入则补录
         * @param {String} path - 需要判断的路径
         * @public
         */
        checkAddWiki: function (path) {
            //验证转换 path 为 wiki 根目录
            const root = mngFolder.isAmWiki(path);
            if (root) {
                this.addWiki(root);
            }
        },
        /**
         * 检查文库是否仍然有效，失效则标记弃用
         * @param {Number} wId - 需要判断的文库id
         * @public
         */
        checkWikiValid: function (wId) {
            if (typeof this._wikis[wId] !== 'undefined') {
                const root = this._wikis[wId].root;
                //当文件夹不存在或者文件夹不为amWiki时，标记弃用
                //也就是说，从atom目录树删除项目，并不会标记弃用，必须删除文库本地文件和文件夹
                this._wikis[wId].deprecated = !fs.existsSync(root) || !mngFolder.isAmWiki(root)
            }
        },
        /**
         * 更新文库记录中对应 config.json 的内容
         * @public
         */
        updateWikiConfig: function () {
            for (let wId in this._wikis) {
                if (this._wikis.hasOwnProperty(wId)) {
                    //读取 config
                    if (!this._wikis[wId].deprecated) {
                        let configStr = fs.readFileSync(this._wikis[wId].root + 'config.json') || '{}';
                        try {
                            this._wikis[wId].config = this.parseConfig(JSON.parse(configStr));
                        } catch (e) {
                            console.error('您位于 ' + this._wikis[wId].root +
                                ' 的文库，config.json 内容格式不合法，请按照 json 格式书写！');
                        }
                    }
                    //弃用的文库删除 config
                    else {
                        this._wikis[wId].config = null;
                    }
                }
            }
        },
        /**
         * 重新解析/过滤 config 配置
         * @param {Object} config
         * @return {Object} config
         * @public
         */
        parseConfig: function (config) {
            //库名称
            config.name = typeof config.name === 'undefined' ? 'amWiki轻文库' : config.name + '';
            //库版本号
            config.version = typeof config.ver === 'undefined' ? 'by Tevin' : config.ver + '';
            //logo地址
            config.logo = typeof config.logo === 'undefined' ? 'amWiki/images/logo.png' : config.logo + '';
            //是否开启接口测试
            config.testing = !!config.testing || false;
            //设置自定义颜色
            config.colour = typeof config.colour === 'undefined' ? '#4296eb' : config.color + '';
            //本地页面数据挂载
            config.pageMounts = !!(config['page-mounts'] || config.pageMounts) || false;
            delete config['page-mounts'];
            //项目的 github 地址
            config.githubUrl = config['github-url'] || config.githubUrl;
            config.githubUrl = typeof config.githubUrl === 'undefined' ? '' : config.githubUrl + '';
            delete config['github-url'];
            //转接 library 地址
            config.libraryPrefix = config['library-prefix'] || config.libraryPrefix;
            config.libraryPrefix = typeof config.libraryPrefix === 'undefined' ? '' : config.libraryPrefix + '';
            delete config['library-prefix'];
            //自定义 css、js 文件
            if (tools.isArray(config.imports) && config.imports.length > 0) {
                const imports2 = {
                    js: [],
                    css: []
                };
                for (let file of config.imports) {
                    let type = file.split(/[?#]/)[0].match(/((\.js)|(\.css))$/)[0];
                    if (type === '.js') {
                        imports2.js.push(file);
                    } else if (type === '.css') {
                        imports2.css.push(file);
                    }
                }
                config.imports = imports2;
            } else {
                delete config.imports;
            }
            return config;
        }
    };
})();

module.exports = manageWiki;