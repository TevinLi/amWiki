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

const helpWords = `
用法：
  amwiki [command] [arguments]

命令列表：
  -h, help        显示帮助
  -v, version     显示版本号
  -c, create      创建 wiki
  -u, update      更新 wiki 数据
                  默认全部项目更新，添加参数可以指定部分更新
                      [nav]  仅更新导航
                  ${clc(90, '(eg: amwik update nav)')}
  -s, server      启动本地服务器
                  默认本地服务器使用端口5171，添加参数可以修改端口
                      [8080]  修改端口
                  ${clc(90, '(eg: amwiki server 8080)')}
  -b, browser     本地浏览文档
                  默认访问文库首页，添加参数可以打开指定页面
                      [002/001]  按目录文档的id打开指定文档(待开发)
                  ${clc(90, '(eg: amwiki browser 002/001)')}
  -e, export      项目导出
                  第一位参数，必需，指定导出类型
                      github-wiki  导出为github的项目wiki
                  第二位参数，必需，指定导出路径
                      d:/your-path  导出路径
                  ${clc(90, '(eg: amwiki export github-wiki d:/your-path)')}
                  
更多文档：
  https://tevinli.github.io/amWiki/index.html`;

//[embed]  仅更新嵌入数据(待开发)
//[seo]  仅更新SEO模块(待开发)

const vesWords = `
                       kk            kk  kk  kk      ww
 wwwwww     www  www    kk          kk       kk
      ww  ww   ww   ww  kk    kk    kk   kk  kk  kk  kk
 wwwwwww  ww   ww   ww   kk  kkkk  kk    kk  kk kk     kk
ww    ww  ww   ww   ww   kk kk  kk kk    kk  kkkk      kk
 wwwwwww  ww   ww   ww    kk      kk     kk  kk  kk  kk
 
`.replace(/w/g, `${clc(32, '$')}`).replace(/k/g, `${clc(36, '$')}`);

module.exports = {
    clc: clc,
    help: function () {
        alert(helpWords);
    },
    ver: function (mainPath) {
        const packageStr = fs.readFileSync(mainPath.split(/bin[\\\/]main/)[0] + 'package.json', 'utf-8');
        const packageConf = JSON.parse(packageStr);
        const text = [
            'Package:   amWiki',
            `Version:   ${clc(0, packageConf.version)}`,
            'Author:    Tevin Li',
            'HomePage:  https://github.com/tevinli/amWiki',
            'License:   MIT'
        ];
        //const text = ` ${clc(92, 'am')}${clc(96, 'Wiki')} ${clc(1, 'v' + packageConf.version)}`;
        alert(vesWords + text.join('\n'));
    }
};