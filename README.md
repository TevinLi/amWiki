# amWiki 轻文库

![amWiki logo](https://amwiki.xf09.net/docs/assets/logo.png)  
amWiki 是一款基于 Javascript 脚本语言、依赖 Atom 编辑器、使用 Markdown 标记语法的轻量级开源 wiki 文库系统。  
amWiki 致力于让大家可以更简单、更便捷的建设个人和团队文库系统！  

[[view amWiki on Github](https://github.com/TevinLi/amWiki)]  
[![](https://img.shields.io/github/stars/TevinLi/amWiki.svg?style=social&label=Star)](https://github.com/TevinLi/amWiki "GitHub Stars") [![](https://img.shields.io/github/forks/TevinLi/amWiki.svg?style=social&label=Fork)](https://github.com/TevinLi/amWiki "GitHub Forks") [![](https://img.shields.io/github/issues-raw/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Open Issues") [![](https://img.shields.io/github/issues-closed-raw/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Closed Issues") [![](https://img.shields.io/github/contributors/TevinLi/amWiki.svg)](https://github.com/TevinLi/amWiki "GitHub Contributors")  
Apm:  
[![apm](https://img.shields.io/apm/v/amWiki.svg)](https://atom.io/packages/amWiki "Apm Version") [![apm](https://img.shields.io/apm/dm/amWiki.svg)](https://atom.io/packages/amWiki "Apm Downloads") [![apm](https://img.shields.io/apm/l/amWiki.svg)](https://atom.io/packages/amWiki "MIT License")

## 关于amWikiForVSCode
此项目是通过fork amWiki来的，由于amWiki是基于Atom的extension，因此在Visual Studio Code中是无法使用的，不过本人比较喜欢VS Code，于是着手将amWiki移植到VS Code中。幸亏Atom和VS Code都是基于electron二次开发的，所以两者的extension api有极高的相似度，因此移植工作还算进行得顺利。不过本人也是因为萌发了移植amWiki的念头之后，才开始学习VS Code extension开发的，因此有许多地方考虑不周，望大家见谅啦，如果发现有哪些地方的逻辑或者是语法使用不当的话，欢迎大家过来拍砖><。

[[view amWikiForVSCode on Github](https://github.com/YaoXuanZhi/amWikiForVSCode)]  
[![](https://img.shields.io/github/stars/YaoXuanZhi/amWikiForVSCode.svg?style=social&label=Star)](https://github.com/YaoXuanZhi/amWikiForVSCode "GitHub Stars") [![](https://img.shields.io/github/forks/YaoXuanZhi/amWikiForVSCode.svg?style=social&label=Fork)](https://github.com/YaoXuanZhi/amWikiForVSCode "GitHub Forks") [![](https://img.shields.io/github/issues-raw/YaoXuanZhi/amWikiForVSCode.svg)](https://github.com/YaoXuanZhi/amWikiForVSCode "GitHub Open Issues") [![](https://img.shields.io/github/issues-closed-raw/YaoXuanZhi/amWikiForVSCode.svg)](https://github.com/YaoXuanZhi/amWikiForVSCode "GitHub Closed Issues") [![](https://img.shields.io/github/contributors/YaoXuanZhi/amWikiForVSCode.svg)](https://github.com/YaoXuanZhi/amWikiForVSCode "GitHub Contributors")

## 在VSCode中的使用演示
- 创建新文库
> 先在一个文件夹下创建`config.json`文件，然后用`VSCode`打开此文件夹，此时在“`资源管理器`”上的`config.json`右击，执行右键菜单中的“基于config.json创建wiki”命令，即可在此文件夹下创建默认的amWiki文库，如下图所示：

![创建新文库](https://cloud.githubusercontent.com/assets/14124918/21590721/27c48c12-d139-11e6-8ee8-d8cc6c8136c3.gif)

- 粘贴截图
>按下组合键`shift+ctrl+alt+v`或者是使用文档编辑器的右键菜单中的`粘帖截图到文档`命令，如下图所示：

![粘贴截图](https://cloud.githubusercontent.com/assets/14124918/21590733/457a5444-d139-11e6-864f-b47ff91ff343.gif)

- 插入页内目录
>使用文档编辑器的右键菜单中的`插入页内目录`命令，会把当前markdown文档中的h2、h3级作为页内目录抽取成文本，并将其粘贴到当前光标处，如下图所示：

![插入页内目录](https://cloud.githubusercontent.com/assets/14124918/21590750/6cc274fa-d139-11e6-9f36-c20ec6e71fa9.gif)

- 导出项目为`github wiki`
>使用文档编辑器的右键菜单中的`导出项目为github wiki`命令，最终会在指定目录下生成符合github wiki目录结构的文件，如下图所示：

![导出项目为github wiki](https://cloud.githubusercontent.com/assets/14124918/21590767/89ad689a-d139-11e6-9a76-790f156f5343.gif)

- 浏览当前页面
>按下组合键`f12`或者使用文档编辑器的右键菜单中的`浏览当前页面`命令，然后，会自动打开默认浏览器来浏览当前markdown文件对应的页面，如下图所示：
![在浏览器中浏览此页面](https://cloud.githubusercontent.com/assets/14124918/21590799/b0dc7460-d139-11e6-9e69-903d3ae30872.gif)
