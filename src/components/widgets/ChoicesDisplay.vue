<template>
    <span>{{display}}</span>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        },
        computed:{
            display(){
                let v = this.value[this.field.name]
                let a = this.field.choices.find(a => a.value === v)
                return a && a.display_name
            }
        }
    }
</script>
