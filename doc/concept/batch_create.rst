===========
概念
===========

批量创建
===========

    - 判断一个对象是否要创建

        - 判断一个对象是否已存在

            - 如果有foreignKey不存在, 则此对象也不存在

            - 如果按所有foreignKey键值及plainField字段查询, 记录不存在, 则对象不存在

        - 对象已存在, 则记录下主键

        - 对象不存在, 则创建, 然后记录下主键


.. code:: javascript

    st1={name:'school.student',
         foreignKeys:[
           {name:'school.major',
            plainFields:['name']
           },
           {name:'school.clazz',
            foreignKeys:[
              {name:'school.grade',
                plainFields:['name']
              },
              {name:'school.session',
              rel:'entrance_session',
              plainFields:['name']
              },
              {name:'school.session',
              rel:'graduate_session',
              plainFields:['name']
              }
            ],
            plainFields:['name']
           }],
         plainFields:['name','number']
        }


Model列表自动排版
======================

Model编辑自动排版
======================