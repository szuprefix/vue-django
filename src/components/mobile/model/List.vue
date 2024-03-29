<template>
    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="$attrs.infiniteScrollDisabled || loading"
         infinite-scroll-distance="10">
        <slot v-bind:data="data">
            <panel v-bind="[$attrs,$props]" v-model="data" v-if="layout === 'panel'"></panel>
            <cells v-bind="[$attrs,$props]" v-model="data" v-else-if="layout === 'cells'">
                <template v-if="$scopedSlots.icon" v-slot:icon="scope">
                    <slot name="icon" v-bind="scope"></slot>
                </template>
                <template v-if="$scopedSlots.title" v-slot:title="scope">
                    <slot name="title" v-bind="scope"></slot>
                </template>
                <template v-if="$scopedSlots.child" v-slot:child="scope">
                    <slot name="child" v-bind="scope"></slot>
                </template>
                <template v-if="$scopedSlots['inline-desc']" #inline-desc="scope">
                    <slot name="inline-desc" v-bind="scope"></slot>
                </template>

            </cells>
        </slot>
        <load-more :tip="tip" :show-loading="loading" v-if="currentPageSize < count"></load-more>
        <div v-if="!loading && count<=0" style="text-align: center;margin: 2rem 0;">暂无数据</div>
    </div>
</template>
<script>
    import {LoadMore, InlineLoading} from 'vux'
    import Panel from './Panel.vue'
    import Cells from './Cells.vue'
    import {Register} from '../../../utils/app_model'
    import ServerResponse from '../../../mixins/server_response'
    export default{
        mixins: [ServerResponse],
        props: {
            appModel: String,
            owner: Object,
            queries: {type: Object, default: {}},
            layout: {type: [String, Object], default: 'panel'},
            prepare: Function,
            pageSize: {type: Number, default: 20},
            url: String
        },
        data () {
            return {
                loading: false,
                data: [],
                count: 0,
                currentPageSize: 0,
                model: Register.get(this.appModel)
            }
        },
        components: {Panel, Cells, LoadMore, InlineLoading},
        created () {
            this.currentPageSize = this.pageSize
        },
        methods: {
            load () {
                let qd = {...this.queries, page_size: this.currentPageSize}
                if (this.owner) {
                    qd.owner_type = this.owner.options.content_type_id
                    qd.owner_id = this.owner.id
//                    qd.relation_limit = this.owner.appModel
                }
                this.loading = true
                return this.model.query(qd, this.url).then(data => {
                    this.loading = false
                    this.$emit('loaded', data)
                    this.count = data.count
                    let ds = data.results
                    if (this.prepare) {
                        ds = this.prepare(ds)
                    }
                    return ds
                }).then(ds => {
                    this.data = ds
                }).catch(this.onServerResponseError)
            },
            loadMore (loaded) {
                if (this.currentPageSize < this.count) {
                    this.currentPageSize += this.pageSize
                }
            }
        },
        computed: {
            tip () {
                return this.currentPageSize < this.count ? '加载中' : '没有了'
            }
        },
        watch: {
            queries (v) {
                this.load()
            },
            currentPageSize (v) {
                this.load()
            },
            owner (v) {
                this.load()
            }
        }
    }
</script>
