# amWiki 文库

amWiki是一套非常简单基于atom编辑器markdown语法的轻量级wiki文库系统。  
使用amWiki文库，仅需要您使用atom编辑markdown文档和支持http静态访问网页空间！  

### amWiki优势

- 文档系统采用markdown语法
- 不用数据库，文档使用`.md`格式保存本地文件
- 无需服务端开发，只需支持http静态访问网页空间
- 一键创建新的文库
- 自动更新文库导航目录(通过监视文件)
- 支持截图直接粘帖为本地png并插入当前markdown
- 文档web端自适应显示，适合所有平台
- 支持接口文档自动抓取内容生成简单的ajax测试
- ... (更多内容期待您的发现)

### web端效果演示
一键创建新文库将自动生成一套Web端html页面，默认生成效果一览：[http://tevinli.github.io/amWiki/](http://tevinli.github.io/amWiki/index.html)

## 如何开始

1. 下载Github开源文本编辑器 [Atom官网](https://atom.io/ "atom官网") / [Atom下载](https://atom.io/download/windows)，并安装

2. 安装Atom插件amWiki，并重启Atom
	- Atom菜单，File -> Setting -> Install -> 搜索`amWiki`
	- 或者，运行cmd：`apm install amWiki`
	- 或者，从Github的 [amWiki项目托管](https://github.com/TevinLi/amWiki) 下载zip，解压到`C:\Users\Administrator\.atom\packages`，并将文件夹名`amWiki-master`改为`amWiki`

3. (在本地服务器静态目录)创建一个文件夹

4. 在Atom中 **添加项目文件夹**，并指向刚创建的文件夹

5. 在Atom刚创建的项目下新建`config.json`文件，并输入一下内容：
```javascript
	{
	    "name": "",      //您的文库名称，设置但为空或不设置将显示默认名
	    "ver": "",       //文本版本号或维护者名号，设置但为空将不显示，注意诺不设置此属性将显示amWiki作者
	    "logo": "",      //logo的url，设置但为空或不设置将显示默认logo
	    "testing": true, //是否启用接口测试，默认值false
	    "colour": ""     //自定义颜色，默认为蓝色
	}
```
6. 点击Atom菜单：

		Packages -> amWiki文库 -> 通过“config.json”文件创建新amWiki文库

7. 此时项目中自动创建了许多内容，其中 library 文件夹即为您的文档库，编辑您的文库文档

8. 使用 http 访问刚刚自动创建的 index.html


## 目录结构

	index.html               //http访问首页
	amWiki/                  //amWiki工作文件目录
	library/                 //您的markdown文库目录，所有文件必须使用.md格式
	  ├ $navigation.md       //amWiki文库目录导航文件，可自动/手动更新
	  ├ 首页.md              //内容区默认显示内容
	  ├ 01-关于amWiki文库/    //markdown文件夹01
      │   ├ 001-关于amWiki   //一些markdown文档，支持二级目录
      │   └ 002-...
      ├ 02-学习markdown/     //markdown文件夹02
      │   ├ 001-md入门       //一些markdown文档，支持二级目录
      │   └ 002-...
      └ 03-...               //更多markdown文件夹
	(assetes/)               //如果您粘帖截图，图片文件将自动创建在此处


## 如何编辑
1. 新建或更改文件夹和文档名，组织您自己的文档结构 (文档必须markdown文档、**使用.md扩展名**)

2. 编辑markdown文档，制作您自己的文档内容

3. 每个文件夹或文件使用“id-名称”来实现命名排序，请勿删除id，删除后将无法正常工作  
   id仅允许整数或浮点数类型，且使用连接符或下划线与具体名称组成命名

4. library文件夹下`首页.md`为打开时默认的或url参数错误时的显示内容

5. `$navigation.md`导航文件无需人工维护，创建新文件夹或文件时将自动更新，也可以在菜单栏手动刷新：

		菜单栏 -> amWiki文库 -> 手动更新当前文库导航文件

6. 如果需要在markdown文档中插入图片，**请先截图**，然后在.md文档对应位置使用快捷键：`Ctrl + Shift + V`

7. 对于较长文章，可以使用页内目录，依次操作

		菜单栏 -> amWiki文库 -> 提取h2、h3标题为页内目录
即可在光标处插入页内目录，或使用快捷键`Ctrl + D`。  
注意：如需提取页内目录，请按顺序使用h1、h2、h3，其中h1仅允许使用一次。

8. 如果启用了测试，对于文档中**同时存在“请求地址”“请求类型”“请求参数”三个h3标题**的文档，自动在右上角激活接口测试功能
	- 请求参数的表格，请按`参数名、类型、必填、描述、默认值`的顺序建立表格，否则不能正常抓取
	- 只能请求同域接口，不能跨域
	- 如果接口需要登录权限，请先登录您自己的系统  


9. 如果本插件升级了，您想更新`项目/amWiki/`文件夹下的web端工作文件，您只需重新打开`config.json`文件，然后在Atom菜单上选择`通过“config.json”文件创建新amWiki文库`即可。  
这个二次创建操作不会影响您 library 与 assetes 文件夹下的内容。

10. 借助版本管理 SVN、Git、Hg，传输协议FTP/SFTP，文件同步Dropbox、百度云等等工具，便捷实现网络访问。


## 如何使用

1. 使用 http 访问项目的 index.html。

2. PC端使用左侧导航栏、移动端使用右上角导航弹出菜单切换页面。

3. 在导航栏或导航菜单顶部，可以使用 ![](http://tevinli.github.io/illustration/amWiki/icon_filter.png) 栏位对导航目录进行筛选。

4. 如果存在页内目录，直接点击，页内目录使用hash滚动；同时您可以直接带hash分享，以方便他人快速浏览指定内容。

5. 如果页面激活了接口测试功能，点击右上角“测试接口”打开测试面板，输出参数并点击“发送Ajax”，即可看到响应内容。


## 后记
这个项目的灵感来自 [MDwiki](http://www.mdwiki.net/)，一开始，我也准备使用 MDwiki 来写一些文档，但是我很快发现，如果我新增一篇文档，需要我手动去编辑导航栏文件增加一条导航，这个挺不友好的。然后想写一套类似 [微信公众平台开发者文档](http://mp.weixin.qq.com/wiki/home/index.html) 的文档库，发现 MDwiki 由于其容量所限，并不能很好的胜任。  
于是经过一番折腾，就有了amWiki。

## 更新日志
[amWiki 版本更新日志](https://github.com/TevinLi/amWiki/blob/master/CHANGELOG.md "amWiki版本更新日志")
