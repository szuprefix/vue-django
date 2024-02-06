<template>
    <div>
        <template v-for="(g, i) in groups">
            <check-group v-bind="[g]" v-model="values[i]" :field="{options: g.options}" :key="g.name"
                         @change="onChange(g)"></check-group>
        </template>
    </div>
</template>
<script>
    import CheckGroup from './CheckGroup.vue'
    import {flatten} from 'lodash'
    export default {
        props: {
            value: Array,
            field: Object
        },
        data() {
            return {
                values: []
            }
        },
        components: {CheckGroup},
        created (){
            this.setValues()
        },
        methods: {
            setValues() {
                if(!this.groups) {
                    return
                }
                this.groups.forEach((g, i) => {
                    let v = []
                    g.options.forEach(a => {
                        if (this.value.includes(a.value)) {
                            v.push(a.value)
                        }
                    })
                    this.values[i] = v
                })
            },
            onChange(g) {
                let v = flatten(this.values)
                this.$emit('input', v)
//                console.log(v)
            }
        },
        computed: {
            groups () {
                let oll = this.field.options
                return oll
//                let gs = []
//                return oll.map(a => {
//
//                })
//                return gs
            }
        },
        watch: {
            value(){
                this.setValues()
            },
            field () {
                this.setValues()
            }
        }
    }
</script>