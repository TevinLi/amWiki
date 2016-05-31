# Markdown 快速开始

## 简介
Markdown是为那些需要经常码字或者进行文字排版的、对码字手速和排版顺畅度有要求的人群设计的，他们希望用键盘把文字内容啪啪啪地打出来后就已经排版好了，最好从头到尾都不要使用鼠标。  
这些人包括经常需要写文档的码农、博客写手、网站小编、出版业人士等等。  
Markdown的语法简洁明了、学习容易，得到了许多著名网络平台的支持，例如代码托管平台[Github](https://github.com/)、博客平台[WordPress](https://cn.wordpress.org/)等等。  

## 语法快速入门

### <font color=#C71585>标题</font>
在行首插入1到6个#，对应1到6阶标题
    # 这是 H1
    ## 这是 H2
    ### 这是 H3
    #### 这是 H4
    ##### 这是 H5
    ###### 这是 H6
# 这是 H1
## 这是 H2
### 这是 H3
#### 这是 H4
##### 这是 H5
###### 这是 H6

### <font color=#C71585>修辞和强调</font>
使用星号和底线来标记需要强调的区段

    **加粗**
    __加粗__
    *斜体*
    _斜体_

**加粗**  
__加粗__  
*斜体*  
_斜体_  

### <font color=#C71585>删除线</font>

    ~~要删掉的内容~~
    
~~要删掉的内容~~

### <font color=#C71585>列表</font>
无序列表使用星号、加号和减号来做为列表的项目标记
    * Candy.
    * Gum.
    + Booze.
    * Booze. 长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本  
    这里是断行-文本长文本长文本长文本  
    这里是断行-文本长文本长文本长文本
    - Booze.
      + 嵌套
      * 嵌套
* Candy.
* Gum.
+ Booze.
* Booze. 长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本  
这里是断行-文本长文本长文本长文本  
这里是断行-文本长文本长文本长文本
- Booze.
  + 嵌套
  * 嵌套

有序的列表则是使用一般的数字接着一个英文句点作为项目标记
    1. Red
    50. Green
    1000. Blue
1. Red
50. Green
1000. Blue

### <font color=#C71585>链接</font>
在方括号后面用圆括号接上链接

    这是一个[链接显示文本](http://www.baidu.com "链接title文本")

这是一个[链接显示文本](http://www.baidu.com "链接title文本")

### <font color=#C71585>图片</font>
图片的语法和链接很像

    ![alt文本](amWiki/images/logo.png "Title")

![alt文本](amWiki/images/logo.png "Title")

### <font color=#C71585>代码</font>
使用反引号 \` 来标记代码区段

    我是`code`，`<div>division</div>`

我是`code`，`<div>division</div>`

如果要建立一个已经格式化好的代码区块，只要每行都缩进 4 个空格或是一个 tab 就可以了

    var name = 'Candy'

### <font color=#C71585>表格</font>
使用竖线分割内容，且同时使用“---”与“:”指定对齐方式

    | Header01 | Header02 | Header03
    | -------- | :------: | ---:
    | 默认 | 居中 | 右

| Header01 | Header02 | Header03
| -------- | :------: | ---:
| 默认 | 居中 | 右

### <font color=#C71585>引用</font>
只需要在文本前加入 > 这种尖括号（大于号）即可

    >这里是一段引用

>这里是一段引用

### <font color=#C71585>分割线</font>
只需要三个 \- 号

    ---

---

### <font color=#C71585>换行</font>
只需要两个以上的空格然后回车

    我是首行  
    我换行了

我是首行  
我换行了

### <font color=#C71585>html</font>
可以直接在文档里书写 HTML，不需要额外标注这是 HTML

    <div>division</div>

<div>division</div>

---

## 更多

### 研究markdown语法详细细节
>   - [创始人 John Gruber 的 Markdown 语法说明](http://daringfireball.net/projects/markdown/syntax)  
>   - [Markdown 中文版语法说明](http://wowubuntu.com/markdown/)

### Markdown编辑器众多

#### 在线网页编辑器
[MaHua](http://mahua.jser.me/)、 [简书](http://www.jianshu.com/)、[马克飞象](https://maxiang.io/)、[Dillinger](http://dillinger.io/)、[StackEdit](https://stackedit.io/)

#### 全平台编辑器
[Atom](https://atom.io/)、[SublimeText](http://www.sublimetext.com/)、[CmdMarkdown](https://www.zybuluo.com/mdeditor)、[小书匠编辑器](http://soft.xiaoshujiang.com/)

#### Windows平台编辑器
[MarkdownPad](http://www.markdownpad.com/)

#### OSX平台编辑器
[Mou](http://25.io/mou/)、[MacDown](http://macdown.uranusjr.com/)、[Byword](https://bywordapp.com/)

#### Linux平台编辑器
ReText、[UberWriter](http://uberwriter.wolfvollprecht.de/)
