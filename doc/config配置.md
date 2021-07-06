# Config 文件配置

## 创建新的app

1. 首先在apps.js 文件中将app加入到apps中

   ```
   let apps = {
   	'app_name':{
   		verbose_name: '在侧边栏显示的列名'
   		icon: 'el ui 中的icon',
   		menu: '上级菜单',
   		itemActions:[
   			{name: '取名', icon: '图标', title: '标题', do:'执行的命令'}
   		]
   	}
   }
   ```

   

2. 在src/views目录下创建app对应的目录，并创建对应的子目录如： baidu/user为百度app下的user目录，并在user目录下创建config.js文件, 通过配置config.js可以生成对应django model中对应表的列表页。例如在django中我们startapp 名为baidu,并添加了user的model，对应数据库中的baidu_user表，在前端vue配置config文件即可自动生成对应的列表页，省去了创建列表页的繁琐。下面展示部分配置：

   ```
   function search_post({row}){
       console.log(row)
   }
   export default {
       list: {
           items: ['username', 'age', 'city'],
           options: {
               remoteTable:{
                   rowActions:[{name:'anyname', label: '按钮上的文字', do:search_post}]
               }
           },
           batchActions:[
               {
                   name: 'name',
                   api: 'batch_disable',
                   context: {'enable_flag': false},
                   label: '禁用',
                   notice: '禁用将不再显示.'
               }
           ]
   
       }
   }
   ```

   其中list表示列表的配置，items用于配置显示的列，代码表示显示username, age, city三列, options用于配置表格，在remoteTable下可以配置行操作按钮, name可以随意设置，label设置按钮文字，do设置执行的命令。

   **特别注意：do如果设置为方法名（不带括号）则会调用前面设置的function如上面的search_post方法，而且会自动传参过去，如上面的row就是传入的参数，里面包含了行信息。除此之外还会有column, store等参数可选。如果do后面跟随字符串如 'baidu/user/add' 则点击按钮后会访问'baidu/user/add.vue' , 我们可以使用this.$attrs 获取row的参数。**

   batchActions用于批处理数据，批处理多行信息如删除等操作。其中name可以随意设置，api为后端api, 如示例代码将会调用  url/api/baidu/user/batch_disable 方法，并会默认传入每行的id, 并附带context中的参数enable_flag.   label设置顶部按钮文本，notice设置弹出的提示。

   后端的api的设计：

   ```
   @decorators.action(['POST'], detail=False)
       def batch_disable(self, request):
           return self.do_batch_action('is_active')
   ```

   后端使用do_batch_action可以用来处理请求，如上面的代码可以将 is_active 字段设置为true, 因为is_active字段是boolean类型的，do_batch_action 默认支持处理boolean数据， 如果哟啊将is_active设为false则需要传入context.