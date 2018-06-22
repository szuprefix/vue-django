<template>
    <el-tabs v-model="curTab" type="card" closable @tab-remove="tabRemove" stretch>
        <el-tab-pane :label="t.title" :name="t.name" v-for="t in tabs" :key="t.name">
            <component :is="t.view" :tab="t"></component>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    export default{
        data () {
            return {
                tabs: [],
                curTab: '/'
            }
        },
        created (){
            this.curTab = this.$route.path
            this.changeRoute(this.$route)
            this.$store.state.bus.$on("user-logout", this.clearTabs)
        },
        components: {},
        methods: {
            clearTabs(){
                this.curTab = '/'
                this.tabs = [this.tabs.find((tab) => tab.name == this.curTab)]
            },
            tabRemove(name){
                let targetName = name
                if (this.curTab === targetName) {
                    this.tabs.forEach((tab, index) => {
                        if (tab.name === targetName) {
                            let nextTab = this.tabs[index + 1] || this.tabs[index - 1]
                            if (nextTab) {
                                this.curTab = nextTab.name
                            }
                        }
                    })
                }
                this.tabs = this.tabs.filter(tab => tab.name !== targetName)
            },
            tabAdd (tab) {
                let old = this.tabs.find((o) => o.name === tab.name)
                if (!old) {
                    this.tabs.push(tab)
                }
                this.curTab = tab.name
            },
            changeRoute(newVal, oldVal){
                let to = newVal
                let view = to.matched[0]
                if (view === undefined) {
                    if (to.path != '/') {
                        this.$message({message: `找不到该路径:${to.path}`, type: 'error'})
                    }
                    return
                }

                let title = to.meta && to.meta.title || to.path
                let tab = {
                    title, name: to.path, to, view: view.components.default
                }
                this.tabAdd(tab)
            }
        },
        watch: {
            curTab(){
                this.$router.push(this.curTab)
            },
            $route(newVal, oldVal){
                this.changeRoute(newVal, oldVal)
            }
        },
        computed: {}
    }
</script>
<style>
    .el-tabs__item{
        font-size: 0.5rem;
    }
</style>