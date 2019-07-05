<template>
    <span :title="localStr">{{now}}</span>
</template>
<script>
    import {formatTime, localTimeStr} from '../../utils/filters'
    export default{
        props: {
            value: [String],
            field: Object
        },
        computed:{
            localStr (){
               return this.value && localTimeStr(this.value)  || ''
            },
            now(){
                let s = this.value
                if(s == null){
                    return ""
                }
                return formatTime(new Date(s))
            }
        }
    }
</script>
