/**
 * 工作端 - 终端(命令行) - 着色打印
 * @author Tevin
 */

const fs = require('fs');

//命令行彩色输出简化，command line color
const clc = (colorId, text) => `\x1b[${colorId}m${text}\x1b[0m`;

//文件与文件夹创建操作着色打印
const {mkdir, mkdirSync, writeFile, writeFileSync} = fs;
fs.mkdir = (path, mode, callback) => {
    alert(` ${clc(36, 'create')} ${path}`);
    return mkdir(path, mode, callback);
};
fs.mkdirSync = (path, mode) => {
    alert(` ${clc(36, 'create')} ${path}`);
    return mkdirSync(path, mode);
};
fs.writeFile = (path, data, options, callback) => {
    alert(` ${clc(36, 'create')} ${path}`);
    return writeFile(path, data, options, callback);
};
fs.writeFileSync = (path, data, options) => {
    alert(` ${clc(36, 'create')} ${path}`);
    return writeFileSync(path, data, options);
};

//文件与文件夹删除操作着色打印
const {rmdir, rmdirSync, unlink, unlinkSync} = fs;
fs.rmdir = (path, callback) => {
    alert(` ${clc(31, 'delete')} ${path}`);
    return rmdir(path, callback);
};
fs.rmdirSync = (path) => {
    alert(` ${clc(31, 'delete')} ${path}`);
    return rmdirSync(path);
};
fs.unlink = (path, callback) => {
    alert(` ${clc(31, 'delete')} ${path}`);
    return unlink(path, callback);
};
fs.unlinkSync = (path) => {
    alert(` ${clc(31, 'delete')} ${path}`);
    return unlinkSync(path);
};

//终端输出操作着色打印
const {info, warn, error} = console;
console.info = (...content) => {
    return console.log(`${clc(46, 'INFO:')}`, ...content);
};
console.warn = (...content) => {
    return console.log(`${clc(43, 'WARN:')}`, ...content);
};
console.error = (...content) => {
    return console.log(`${clc(41, 'ERROR:')}`, ...content);
};

//帮助文本
const helpWords = `
用法：
  amwiki [command] [arguments]

命令列表：
  -h, help        显示本帮助
  -v, version     显示版本号
  -c, create      创建 wiki
  -u, update      更新 wiki 数据，默认根据文库配置选择适当内容更新
                  可选参数：
                      [nav|mut]
                          指定仅更新导航
                          指定仅更新页面挂载数据
                  ${clc(90, '(eg: amwik update nav)')}
  -s, server      启动本地服务器，默认本地服务器使用端口号 5171
                  可选参数：
                      [8080]  重新指定端口号
                      [no-index]  关闭 amwiki 索引页
                  ${clc(90, '(eg: amwiki server 8080 no-index)')}
  -b, browser     本地浏览文档，默认访问文库首页
                  可选参数：
                      [002/001]  按目录文档的id打开指定文档(待开发)
                  ${clc(90, '(eg: amwiki browser 002/001)')}
  -e, export      amwiki 项目导出
                  必需参数：
                      github-wiki  指定导出类型为 github 项目附属 wiki
                      d:\/your-path  指定本次导出的本地输出路径
                  ${clc(90, '(eg: amwiki export github-wiki d:\/your-path)')}

更多文档：
  https://amwiki.org/doc/
`;
//[seo]  仅更新SEO模块(待开发)

//amWiki logo
const vesWords = `
                       kk            kk  kk  kk      ww
 wwwwww     www  www    kk          kk       kk
      ww  ww   ww   ww  kk    kk    kk   kk  kk  kk  kk
 wwwwwww  ww   ww   ww   kk  kkkk  kk    kk  kk kk     kk
ww    ww  ww   ww   ww   kk kk  kk kk    kk  kkkk      kk
 wwwwwww  ww   ww   ww    kk      kk     kk  kk  kk  kk
 
`.replace(/w/g, `${clc(32, '$')}`).replace(/k/g, `${clc(36, '$')}`);

const printf = (function () {
    return {
        /**
         * 命令行彩色输出
         * @public
         */
        clc: clc,
        /**
         * 显示帮助信息
         * @public
         */
        help: function () {
            alert(helpWords);
        },
        /**
         * 显示版本信息
         * @param {Object} packageConf
         * @public
         */
        ver: function (packageConf) {
            const text = [
                'Package:   amWiki',
                `Version:   ${clc(0, packageConf.version)}`,
                'Author:    Tevin Li',
                'HomePage:  amwiki.org',
                'Fork:      github.com/tevinli/amWiki',
                'License:   MIT'
            ];
            alert(vesWords + text.join('\n') + '\n');
        }
    };
})();

module.exports = printf;