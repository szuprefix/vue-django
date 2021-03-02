<template>
    <field readonly clickable v-bind="[field]" :value="value" @click="showPicker = true">
        <template #input>
            <popup v-model="showPicker" position="bottom">
                <picker
                    show-toolbar
                    :columns="columns"
                    @change="onPopupChange"
                    @cancel="showPicker = false"
                />
            </popup>
        </template>
    </field>
</template>
<script>
    export default{
        props: {
            field: Object,
            value: String,
            context: Object
        },
        data () {
            return {
                showPicker,
                options:[]
            }
        },
        components: {},
        methods: {
            onPopupChange(picker, value, index) {

            },
            load(){
                let model = this.field.model
                this.$http.get(`/${model.replace('.','/')}/`).then(({data}) => {
                    this.options = data.results
                })
            }
        },
        computed: {
            columns () {
                return this.options.map(a => a.name || a.title)
            }
        }
    }
</script>
