/**
 * Created by denishuang on 2017/8/9.
 */
export default {
    'auth': {
        verbose_name: '用户身份',
        models: {
            'group': {
                verbose_name: '用户组',
                dependents: []
            }
        }
    }
}