<template>
    <div>
        {{theValue}}
    </div>
</template>
<script>
    export default{
        props: {
            value: Object,
            prop: String
        },
        computed: {
            theValue(){
                let n = `${this.prop}_name`
                return this.value[n] || this.value[this.prop]
            }
        }
    }
</script>
