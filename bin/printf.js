/**
 * @desc 命令行着色打印
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

module.exports = {
    clc: clc,
    help: function () {
        alert('coming soon!')
    },
    ver: function (mainPath) {
        const packageStr = fs.readFileSync(mainPath.replace(/bin[\\\/]main$/, '') + 'package.json', 'utf-8');
        const packageConf = JSON.parse(packageStr);
        const text = ` ${clc(92, 'am')}${clc(96, 'Wiki')} ${clc(1, 'v' + packageConf.version)}`;
        alert(text);
    }
};