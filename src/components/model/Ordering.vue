<template>
    <div class="model-ordering">
       <div style="text-align: right; padding-right: 1rem;">
           <el-button @click="onSave" :type="changed?'primary':''" :enable="ids && ids.length>0">保存</el-button>
       </div>
        <draggable v-model="ids">
            <transition-group>
                <el-card v-for="s, i in objects" :key="s.id" class="item hover-show__parent">
                    <el-image v-if="s.logo" :src="s.logo" style="width: 4rem;"></el-image>
                    <div>{{s.name}}</div>
                    <span class="number">{{i + 1}}</span>
                    <!--<span class="action hover-show" @click="onDelete(i)"><i class="fa fa-trash"></i>删除</span>-->
                </el-card>

            </transition-group>
        </draggable>
    </div>
</template>
<script>
    import draggable from 'vuedraggable'
    import async_queue from '../../utils/async_queue'
    import Model from './Model'
    export default{
        props: {
            objects: Array,
            appModel: String,
            queries: Object,
            orderField: {type: String, default: 'order_num'}
        },
        data () {
            return {
                model: Model(this.appModel, this.defaults, this.$store.state.bus),
                ids: null,
                changed: false
            }
        },
        components: {},
        created () {
            this.load()
        },
        methods: {
            onSave(){
                let qs = this.ids.map((id, i) => [id, i])
                async_queue(qs, 2, (a) => {
                    let d = {}
                    d[this.orderField] = a[1]
                    let id = a[0]
                    return this.$http.patch(this.model.getDetailUrl(id), d)
                }).then(() => {
                    this.model.emitPosted(this.ids)
                })
            },
            load() {
                let d = {page_size: 200, ...this.queries}
                this.model.query(d).then(data => {
                    this.objects = data.results
                    this.ids = this.objects.map(a => a.id)
                })
            }
        },
        computed: {},
        watch: {
            ids (v, ov) {
                if (ov == null) {
                    this.changed = false
                } else {
                    this.changed = true
                }
                let os = this.ids.map(id => this.objects.find(a => a.id === id))
                this.objects = os
            }
        }
    }
</script>
<style lang="less">
    .model-ordering {
        .item {
            width: 10rem;
            height: 10rem;
            cursor: pointer;
            float: left;
            margin-right: 1rem;
            margin-top: 1rem;
            text-align: center;
            position: relative;
            .number {
                position: absolute;
                bottom: 0.2rem;
                color: blue;
                left: 1rem;
            }
            .action {
                position: absolute;
                bottom: 0.2rem;
                color: red;
                right: 1rem;
            }
        }

    }
</style>