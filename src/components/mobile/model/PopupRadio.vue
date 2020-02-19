<template>
    <popup-radio v-bind="[$attrs]" :title="title" :options="options" v-model="value_"></popup-radio>
</template>
<script>
    import {Register} from '../../../utils/app_model'
    import {PopupRadio} from 'vux'
    export default{
        props: {
            appModel: String,
            queries: {type: Object, default: {}},
            value: [String, Number]
        },
        data () {
            return {
                model: Register.get(this.appModel),
                options: [],
                value_: undefined
            }
        },
        components: {PopupRadio},
        created () {
            this.value_ = this.value
            this.load()
        },
        methods: {
            load () {
                return this.model.query(this.queries).then(data => {
                    this.options = data.results.map(a => {
                        return {key: a.id, value: a[this.labelField]}
                    })
                })
            }
        },
        computed: {
            title () {
                return this.$attrs.title || this.model.verboseName
            },
            labelField () {
                return this.$attrs.labelField || this.model.title_field
            }
        },
        watch: {
            value (v) {
                this.value_ = v
            },
            value_ (v) {
                this.$emit('input', v)
            },
            queries (v) {
                this.load()
            }
        }
    }
</script>
