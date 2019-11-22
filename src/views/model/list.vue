<template>
    <model-table :appModel="appModel" v-model="data"  ref="table"></model-table>
</template>
<script>
    import list_mixin from 'vue-django/src/mixins/model/list_mixin'
    export default{
        mixins: [list_mixin],
        data () {
            return {
                appModel: ''
            }
        },
        created () {
            let ps = this.$route.path.split('/')
            this.appModel = `${ps[1]}.${ps[2]}`
        }
    }
</script>
