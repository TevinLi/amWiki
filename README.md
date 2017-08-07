# amWiki 轻文库

![amWiki logo](https://amwiki.xf09.net/docs/assets/logo.png)  
amWiki 是一款由 JS 开发、依赖 Atom 或 Nodejs-Npm 的 Markdown 轻量级前端化开源文库系统。  
amWiki 致力于让大家可以更简单、更便捷的建设个人和团队文库！  

[[fork amWiki on Github](https://github.com/TevinLi/amWiki)]  

GitHub:  
[![](https://img.shields.io/github/stars/TevinLi/amWiki.svg?style=social&label=Star)](https://github.com/TevinLi/amWiki "GitHub Stars") [![](https://img.shields.io/github/forks/TevinLi/amWiki.svg?style=social&label=Fork)](https://github.com/TevinLi/amWiki "GitHub Forks") [![](https://img.shields.io/github/issues-raw/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Open Issues") [![](https://img.shields.io/github/issues-closed-raw/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Closed Issues")  
[![GitHub Tag](https://img.shields.io/github/tag/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Tag") [![apm](https://img.shields.io/github/license/TevinLi/amWiki.svg)](https://atom.io/packages/amWiki "MIT License")  
APM:  
[![APM Version](https://img.shields.io/apm/v/amWiki.svg)](https://atom.io/packages/amWiki "APM Version") [![APM Downloads](https://img.shields.io/apm/dm/amWiki.svg)](https://atom.io/packages/amWiki "APM Downloads")  
NPM:  
[![NPM Version](https://img.shields.io/npm/v/amwiki.svg)](https://www.npmjs.com/package/amwiki "NPM Version") [![APM Downloads](https://img.shields.io/npm/dt/amwiki.svg)](https://www.npmjs.com/package/amwiki "APM Downloads") [![npm](https://img.shields.io/npm/dm/amwiki.svg)](https://www.npmjs.com/package/amwiki)

<br>

## amWiki 的优势
- 文档系统采用 markdown 语法
- 不用数据库，文档使用 `.md` 格式保存本地文件
- 无需服务端开发，只需支持 http 静态访问网页空间
- 一键创建新的文库
- 自动更新文库导航目录
- 支持多级目录
- 支持截图直接粘帖为本地 png 并插入当前 markdown
- 文档web端自适应显示，适合所有平台
- 支持接口文档自动抓取内容生成简单的ajax测试
- 无需服务端的全文库标题内容搜索与计分排序
- ... (更多内容期待您的发现)

<br>

## 安装 amWiki
amWiki 可以同时在 Atom 编辑器和 nodejs npm 的命令行两个平台工作，两个平台的工作相互独立，但所创建的文库却可以相互共用  
（PS：对这两个平台的依赖都是编辑需求而不是服务器需求，amWiki 创建的文库是纯静态 html，可以布置到任意服务器）

### 作为 Atom 插件安装
1. 下载 Github 开源文本编辑器 [Atom](https://atom.io/ "Atom官网")，并安装  
2. 安装 Atom 插件 amWiki，并在完成后重启 Atom
    - 前往 Github 的 [amWiki版本发布页](https://github.com/TevinLi/amWiki/releases) 下载最新版压缩包，解压到 C:\Users\Administrator\.atom\packages，并将文件夹名 `amWiki-1.x.x` 改为 `amWiki`
    - 或者，Atom 菜单，File -> Setting -> Install -> 搜索 `amWiki` -> 找到 amWiki 并  Install
    - 或者，在 cmd 或终端中命令：`apm install amWiki`（_第三字母 W 大写_）
3. 在 Atom 菜单，File -> `Add Project Folder` 添加一个项目文件夹
4. 在此文件夹下创建一个名为 `config.json` 的文件
5. 在 Atom 菜单，amWiki轻文库 -> 通过“config.json”创建新文库

### 作为 nodejs 全局模块安装
1. 下载 [nodejs](https://nodejs.org/) 并安装
2. 执行命令： `npm install -g amwiki`（_第三字母 w 小写_）
3. cd 到某个文件夹，通过命令 `amwiki create` 创建文库
4. 通过命令 `amwiki help` 查看帮助

<br>

## amWiki 教程 & 文档
更多详细功能与使用介绍请前往: [ [amWiki 官网文档中心：amwiki.org/doc/](https://amwiki.org/doc/) ]  
(amWiki 的文档由项目自身创建与维护)  

<br>

## 更新日志
### 如何获取最新版本信息与动态？
- QQ群 **347125653**
- 如果可以，欢迎直接加我微信  
  ![](http://img.amwiki.org/global/wx.qrcode.150.png)

### 如何查看历史版本日志？
[amWiki 版本更新日志](https://github.com/TevinLi/amWiki/blob/master/CHANGELOG.md "amWiki版本更新日志")
