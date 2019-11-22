/**
 * Created by denishuang on 2019/9/3.
 */
import MultiCreator from '../../components/model/MultiCreator.vue'
import server_response from 'vue-django/src/mixins/server_response'
export default{
    mixins: [server_response],
    data(){
        return {
            records:"",
            fields:['name']
        }
    },
    components:{
        MultiCreator
    }

}