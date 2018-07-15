/**
 * Created by denishuang on 2018/4/25.
 */
import ModelMultiCreator from '../components/rest/ModelMultiCreator.vue'
import server_response from './server_response'
export default{
    mixins: [server_response],
    data(){
        return {
            records:""
        }
    },
    components:{
        ModelMultiCreator
    }

}