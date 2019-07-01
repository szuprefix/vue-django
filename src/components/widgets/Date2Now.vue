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
            _value (){
                return this.value[this.field.name]
            },
            localStr (){
               return this._value && localTimeStr(this._value)  || ''
            },
            now(){
                let s = this._value
                if(s == null){
                    return ""
                }
                return formatTime(new Date(s))
            }
        }
    }
</script>
