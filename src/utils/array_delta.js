/**
 * Created by denishuang on 2023/7/14.
 */
import {difference} from 'lodash'
export default function (value) {
    return {
        last: value.slice(),
        current: value.slice(),
        addParts: [],
        removeParts: [],
        changed(v){
            this.last = this.current
            this.current = v.slice()
            this.addParts = difference(this.current, this.last)
            this.removeParts = difference(this.last, this.current)
        }

    }
}
