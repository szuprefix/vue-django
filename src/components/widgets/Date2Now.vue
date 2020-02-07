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
        computed:{
            localStr (){
                let v = this.value[this.field.name]
               return  v && localTimeStr(v)  || ''
            },
            now(){
                let v = this.value[this.field.name]
                return v && formatTime(v) || ''
            }
        }
    }
</script>
