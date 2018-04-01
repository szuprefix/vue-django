<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input
                        placeholder="搜索标题"
                        prefix-icon="el-icon-search"
                        v-model="queries.search"
                        @keyup.enter.native="onSearch">
                </el-input>
            </el-col>
            <el-col :span="16">
                <div class="flex-right">
                    <el-button icon="el-icon-plus" size="small" @click="$router.push('create')"></el-button>
                </div>
            </el-col>
        </el-row>

        <el-table :data="table" @row-dblclick="toEditModel">
            <el-table-column :prop="f.name" :label="f.label || f.name" v-for="f in fields" :key="f.name">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row[f.name]" :prop="f.name" :row="row" v-if="f.widget"></component>
                    <template v-else>{{row[f.name]}}</template>
                </template>
            </el-table-column>
            <el-table-column label="" width="100px">
                <template slot-scope="{row}">
                    <el-button-group class="hover-show">
                        <el-button @click="toEditModel(row)" size="small">
                            <i class="fa fa-pencil" aria-hidden="true"
                               title="编辑"></i>
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                @current-change="onPageChanged"
                :total="count">
        </el-pagination>
    </div>
</template>
<script>
    import list_view from '../../mixins/list_view'
    export default{
        props: {
            appModelName: String,
            pageSize: {type: Number, default: 20},
            fields: Array
        },
        data () {
            return {}
        },
        mixins: [list_view]
    }
</script>
