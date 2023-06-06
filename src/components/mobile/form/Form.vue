<template>
    <div>
        <form-group v-for="g,i in formGroups" :items="g.items" v-model="formValue" :key="g.name" :title="g.name"
                    :ref="`group${i}`"></form-group>
        <slot name="info"></slot>
        <box gap="10px 10px">
            <x-button type="primary" @click.native="onSubmit">{{submitName}}</x-button>
            <div v-if="errors.non_field_errors" class="weui-cell_warn">{{errors.non_field_errors}}</div>
        </box>
    </div>
</template>
<script>
    import FormMixin from '../../form/FormMixin.js'
    import FormGroup from './FormGroup.vue'
    import {
        XButton,
        Box
    } from 'vux'
    export default{
        name: 'MForm',
        componentName: 'MForm',
        mixins: [FormMixin],
        props: {
            groups: {
                type: Array,
                default: () => []
            },
        },
        data () {
            return {
                formValue: {},
                errors: {}
            }
        },
        created () {
            this.formValue = this.value
        },
        components: {
            FormGroup,
            XButton,
            Box
        },
        methods: {},
        computed: {
            formGroups () {
                return (this.groups.length > 0) ? this.groups : [{name: '', items: this.items}]
            }
        },
        watch: {
            value (val) {
                this.formValue = val
            }
        }
    }
</script>
