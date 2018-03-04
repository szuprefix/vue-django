/**
 * Created by denishuang on 2018/3/4.
 */

export  default {
    data () {
        return {
            id: 'create',
            data: {},
            appModel: {},
            rest_options: {}
        }
    },
    methods: {
        load (){
            this.loading = '加载中'
            return this.appModel.load().then((model) => {
                this.appModel = Object.assign({}, model)
                this.tab.title = model.data.name || `新增${this.appModel.verboseName}`
                this.loading = false
                this.data = Object.assign({}, model.data)
                return model
            }).catch(this.onServerResponseError)
        },
        formPosted (data) {
            if (this.id === 'create') {
                let p = '/' + this.appModel.detailUrl()
                this.tab.name = p
                this.$router.replace(p)
            } else {
                this.tab.title = data.name
            }
        },

    }
}