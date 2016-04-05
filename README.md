# amWiki 文库

amWiki是一套非常简单基于atom编辑器markdown语法的轻量级wiki文库系统。  
使用amWiki文库，仅需要您使用atom编辑markdown文档和拥有http纯静态访问空间！  

### amWiki优势

- 文档系统采用markdown语法
- 不用数据库，文档使用`.md`格式保存本地文件
- 无需服务端开发，只需http纯静态访问
- 一键创建新的文库
- 通过监视文件改动自动更新文库导航目录 (也可以手动更新)
- 支持截图直接粘帖为本地png并插入当前markdown
- 文档web端自适应显示，适合所有平台
- ... (更多内容期待您的发现)


## 如何开始

1. 下载Github开源文本编辑器[Atom](https://atom.io/ "atom官网")，并安装

2. 安装Atom插件amWiki，并重启Atom
	- Atom菜单，File -> Setting -> Install -> 搜索`amWiki`
	- 或者，运行cmd：`apm install amWiki`
	- 或者，从Github的[amWiki项目托管](https://github.com/TevinLi/amWiki)下载zip，解压到`C:\Users\Administrator\.atom\packages`，并将文件夹名`amWiki-master`改为`amWiki`

3. (在本地服务器静态目录)创建一个文件夹

4. 在Atom中添加项目文件夹`Ctrl+Alt+O`，并指向刚创建的文件夹

5. 在Atom刚创建的项目下新建`config.json`文件，并输入一下内容：

		{
		    "name": "(您的文库名称，为空显示默认名)",
		    "version": "(文本版本号或作者，为空不显示)",
		    "logo": "(logo的url，为空显示默认logo)"
		}

6. 点击Atom菜单 

		Packages -> amWiki文库 -> 通过“config.json”文件创建新amWiki文库

7. 此时项目中自动创建了许多内容，其中library目录即为您的文档库

8. 使用http访问刚刚自动创建的index.html


## 目录结构

	index.html               //http访问首页
	amWiki/                  //amWiki工作文件目录
	library/                 //你的markdown文库目录，所有文件必须使用.md格式
	  ├ _navigation_.md      //amWiki文库目录导航文件，可自动/手动更新
	  ├ 首页.md              //内容区默认显示内容
	  ├ 01-关于amWiki文库/    //markdown文件夹01
      │   ├ 001-关于amWiki   //一些markdown文档，不支持更深的目录
      │   └ 002-...
      ├ 02-学习markdown/     //markdown文件夹02
      │   ├ 001-md入门       //一些markdown文档，不支持更深的目录
      │   └ 002-...
      └ 03-...               //更多markdown文件夹
	(assetes/)               //如果您粘帖截图，图片文件将自动创建在此处


## 如何编辑
1. 新建或更改文件夹和文档名，组织你自己的文档结构 (文档必须markdown文档、**使用.md扩展名**)

2. 编辑markdown文档，制作你自己的文档内容

3. 每个文件夹使用两位编号、每个文件使用三位编号来实现排序，请勿删除，删除后导航将丢失部分文字的显示(但访问正常)

4. library文件夹下`首页.md`为打开时默认的或url hash错误时的显示内容

5. `_navigation_.md`目录导航文件无需人工维护，创建新文件夹或文件时将自动更新，也可以在菜单栏

		Packages -> amWiki文库 -> 手动刷新“\_navigation\_.md”
6. 如果需要在markdown文档中插入图片，请先截图，然后在.md文档对应位置使用

		Ctrl + Shift + V
6. 对于较长文章，你可以使用

		Packages -> amWiki文库 -> 提取h2、h3标题为页内目录
即可在光标处插入。  
注意：如需提取页内目录，请按顺序使用h1、h2、h3，其中h1仅允许使用一次。

7. 如果本插件升级了，你想更新`项目/amWiki/`文件夹下的web端工作文件，你只需重新打开`config.json`文件，然后在Atom菜单上选择`通过“config.json”文件创建新amWiki文库`即可。  
这个二次创建操作不会影响你library文件夹下的内容。


## 如何使用
1. 使用http访问项目的index.html

2. PC端使用左侧导航栏、移动端使用右上角导航弹出菜单切换页面

3. 在导航栏或导航菜单顶部，可以使用 ![](https://raw.githubusercontent.com/TevinLi/amWiki/master/files/icon_filter.png) 栏位对导航目录进行**包含筛选**

4. 如果存在页内目录，直接点击，页内目录使用hash滚动；同时你可以直接带hash分享，以方便他人快速浏览指定内容
