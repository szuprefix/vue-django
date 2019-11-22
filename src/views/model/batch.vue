<template>
    <multi-creator :appModel="appModel">
    </multi-creator>
</template>
<script>
    import multi_create_mixin from 'vue-django/src/mixins/model/multi_create_mixin'
    export default{
        mixins: [multi_create_mixin],
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
