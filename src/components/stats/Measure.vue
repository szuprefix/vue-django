<template>
    <el-card shadow="hover" class="stat-measure" @mouseover.native="onHover" @mouseout.native="offHover">
        <el-row>
            <el-col :span="8">
                <i :class="`fa fa-${icon} icon`"
                   :style="{color: icon_color, background: icon_background}"></i></el-col>
            <el-col :span="16">
                <div class="name">{{name}}</div>
                <div class="number">{{formatedNumber}}</div>
            </el-col>
        </el-row>
    </el-card>
</template>
<script>
    import {toThousandslsFilter} from '../../utils/filters'
    export default{
        props: {
            icon: {type: String, default: 'dolar'},
            name: String,
            number: {type: Number, default: 0},
            filter: {type: Function, default: toThousandslsFilter},
            iconColor: {type: String, default: '#000000'}
        },
        data () {
            return {
                icon_color: this.iconColor,
                icon_background: '#ffffff'
            }
        },
        components: {},
        methods: {
            onHover(){
                this.icon_color = '#ffffff'
                this.icon_background = this.iconColor
            },
            offHover(){
                this.icon_color = this.iconColor
                this.icon_background = '#ffffff'

            }
        },
        computed: {
            formatedNumber(){
                return this.filter(this.number)
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    .stat-measure {
        margin: 20px;
        .icon {
            font-size: 3rem;
            padding: 0.8rem;
            border-radius: 5px;
            line-height: 3rem;
            width: 4.6rem;
            text-align: center;
        }

        .name, .number {
            font-size: 1.2rem;
            text-align: right;
        }

        .name {
            color: #999999;
        }
        .number{
            padding-top: 10px;
        }
    }
</style>
