# Markdown 语法高亮

Markdown增强语法，代码段语法高亮  
使用前后各三个“\`” 标记构成代码段，并加上语言类型标记，即可触发语法高亮：


## json
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-json.png)

效果：
```javascript
{
    "state": {
        "code": 10200,                   //code状态码
        "msg": "ok"                      //状态描述
    },
    "data": {
        "team_num": 13,                  //队伍数
        "position": "海珠区新港中路"      //位置
    }
}
```
amWiki对javascript代码片段做了再次增强，可以点击代码块右上角隐藏/显示注释  
当注释处于隐藏状态时不会被复制，比较适合模拟返回json数据的接口时直接拷贝（json不允许注释）

## javascript
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-js.png)

效果：
```javascript
//发送验证码
function cd(num) {
    $('#code').val(num + '秒后可重发');
    setTimeout(function() {
        if (num - 1 >= 0) {
            cd(num - 1);
        } else {
            $('#code').removeClass('bg-gray').prop('disabled', false).val('重新发送验证码');
        }
    },
    1000);
}
```

## Html
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-html.png)

效果：
```html
<body>
    <div class="loading"><img src="/assets/images/loading.gif"></div>
    <header>some text</header>    
</body>
<script type="text/javascript" src="/assets/js/jquery-2.1.4.min.js"></script>
```

## css
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-css.png)

效果：
```css
html,body{display:block;width:100%;height:100%;min-width:320px;}
a,img{-webkit-touch-callout:none;}
input[type="button"],input[type="submit"],input[type="reset"],textarea{-webkit-appearance:none;}
```

## php
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-php.png)

效果：
```php
private function addQuestData($data, $filing_id)
  {
    $quest_num = $data['status'] == 10 ? 1 : 2;
      $where = [
        ['user_filing_id', '=', $filing_id],
        ['project_id', '=', $data['project_id']],
        ['mobile','=', $data['mobile']],
        ['quest_num', '=', $quest_num]
      ];
  }
```

## sql
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-sql.png)

效果：
```sql
SELECT Company, OrderNumber FROM Orders ORDER BY Company, OrderNumber
```

## java
代码截图：  
![](http://tevinli.github.io/illustration/amWiki/highlight-java.png)

效果：
```java
public class Test {
   public static void main(String args[]) {
      int x = 10;
      while( x < 20 ) {
         System.out.print("value of x : " + x );
         x++;
         System.out.print("\n");
      }
   }
}
```
