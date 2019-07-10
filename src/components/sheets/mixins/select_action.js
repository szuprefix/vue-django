/**
 * Created by denishuang on 2019/7/7.
 */
import SelectionDialog from '../SelectionDialog.vue'
export default {
    components: {SelectionDialog},
    data () {
        return {
            selection: {
                actionName: '',
                action: null,
                list: [],
                show: false
            }
        }
    },

    methods: {
        toDoSelectionAction(context){
            this.selection.first = context.name
            this.selection.list = [context.name]
            this.selection.actionName = context.action.label
            this.selection.action = this[context.action.name] //context.action.postAction
            this.selection.show = true
        },
    }
}