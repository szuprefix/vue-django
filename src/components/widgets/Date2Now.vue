<template>
    <span :title="localStr">{{now}}</span>
</template>
<script>
    import {formatTime, localTimeStr} from '../../utils/filters'
    export default{
        props: {
            value: Object,
            field: Object
        },
        computed: {
            val () {
                let v = this.value[this.field.name]
                if(typeof v === 'string' && !v.includes('-')) {
                    v = parseInt(v)
                }
                if (typeof v === 'number') {
                    if (v < 10000000000) {
                        v = v * 1000
                    }
                }
                return v
            },
            localStr (){
                let v = this.val
                return v && localTimeStr(v) || ''
            },
            now(){
                let v = this.val
                return v && formatTime(v) || ''
            }
        }
    }
</script>
