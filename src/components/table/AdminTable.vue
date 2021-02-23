<template>
    <div>
        <search :items="searchItems" v-model="search"  @change="onSearch" :exclude="$attrs.baseQueries"></search>
        <batch-actions :items="batchActionItems" @done="refresh" :context="{selection,count}"
                       v-if="batchActionItems.length>0"></batch-actions>
        <remote-table v-bind="[$attrs, $props]" :items="tableItems" ref="table"
                      @loaded="onLoaded" @selection-change="onSelectionChange" v-on="$listeners"></remote-table>
    </div>
</template>
<script>
    import RemoteTable from './RemoteTable.vue'
    import Search from './Search.vue'
    import BatchActions from '../layout/BatchActions.vue'
    import serverResponse from '../../mixins/server_response'
    import arrayNormalize from '../../utils/array_normalize'
    import Qs from 'qs'
    export default{
        mixins: [serverResponse],
        props: {
            items: {type: Array, default: () => []},
            searchItems: {type: Array, default: () => []},
            batchActions: {type: Array, default: () => []},
        },
        data () {
            return {
                selection: [],
                count: 0,
                tableItems: [],
                batchActionItems: [],
                search: {}
            }
        },
        components: {
            RemoteTable,
            Search,
            BatchActions
        },
        mounted () {
            for(var e in this.eventMonitors) {
                this.$store.state.bus.$on(e, this.eventMonitors[e])
//                console.log(this.$store.state.bus)
            }
        },
        beforeDestroy () {
            for(var e in this.eventMonitors) {
                this.$store.state.bus.$off(e, this.eventMonitors[e])
            }
        },
        methods: {
            normalizeItems(){
                let rs = this.items
                if (this.batchActions.length > 0) {
                    rs = [{type: 'selection'}].concat(rs)
                }
                this.tableItems = rs
            },
            normalizeBatchActionItems () {
                this.batchActionItems = arrayNormalize(this.batchActions, {}, (a) => {
                    if (!a.do) {
                        a.do = this.defaultBatchActionDo(a)
                    }
                    return a
                })
            },
            onLoaded (v) {
                this.count = v.count
                this.$emit('loaded', v)
            },
            onSearch (qd) {
                this.search = {...qd}
                this.$refs.table.updateQueries({...qd, page: 1})
            },
            refresh () {
                this.$refs.table.refresh()
            },
            onSelectionChange (selection) {
                this.selection = selection
            },
            defaultBatchActionDo (action) {
                return ({selection, scope}) => {
                    let ids = selection.map((a) => a.id)
                    let qd = {...this.search}
                    console.log(qd)
                    let url =`${this.$attrs.url}${action.api || action.name}/?${Qs.stringify(qd, {arrayFormat: 'comma'})}`
                    console.log(ids, url)
                    return this.$http.post(url, {
                        batch_action_ids: ids, ...action.context,
                        scope
                    })
                }
            }
        },
        created () {
            this.normalizeBatchActionItems()
            this.normalizeItems()
        },
        computed: {
            eventMonitors () {
                return this.$attrs.eventMonitors || {}
            }
        },
        watch: {
            batchActions(){
                this.normalizeBatchActionItems()
            },
            items () {
                this.normalizeItems()
            }
        }
    }
</script>
