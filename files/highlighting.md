# markdown 语法高亮

github markdown 增强了markdown语法，新增了比如代码段的语法高亮  
使用三个`符号包围起来并写上语言类型即可使用语法高亮：


### json
![](http://tevinli.github.io/illustration/amWiki/highlight-json.png)
```json
{
    "state": { 
        "code": 10200,
        "msg": "ok"
    },
    "data": {
        "team_num": 13,
        "position": "海珠区新港中路"
    }
}
```

### javascript
![](http://tevinli.github.io/illustration/amWiki/highlight-js.png)
```javascript
//发送验证码
function cd(num) {
    $('#reservation-code').val(num + '秒后可重发');
    setTimeout(function() {
        if (num - 1 >= 0) {
            cd(num - 1);
        } else {
            $('#reservation-code').removeClass('bg-gray').prop('disabled', false).val('重新发送验证码');
        }
    },
    1000);
}
```

### Html
![](http://tevinli.github.io/illustration/amWiki/highlight-html.png)
```html
<body>
    <div class="loading"><img src="/assets/images/loading.gif"></div>
    <header>some text</header>    
</body>
<script type="text/javascript" src="/assets/js/jquery-2.1.4.min.js"></script>
```

### css
![](http://tevinli.github.io/illustration/amWiki/highlight-css.png)
```css
html,body{display:block;width:100%;height:100%;min-width:320px;}
a,img{-webkit-touch-callout:none;}
input[type="button"],input[type="submit"],input[type="reset"],textarea{-webkit-appearance:none;}
```

### php
![](http://tevinli.github.io/illustration/amWiki/highlight-php.png)
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

### sql
![](http://tevinli.github.io/illustration/amWiki/highlight-sql.png)
```sql
SELECT Company, OrderNumber FROM Orders ORDER BY Company, OrderNumber
```

### java
![](http://tevinli.github.io/illustration/amWiki/highlight-java.png)
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