/**
 * Created by denishuang on 2020/4/21.
 */

import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'

export function Cache (key, db) {
    if (Number.isInteger(db) || db === undefined) {
        db = `userStore${db}`
    }
    if (typeof db === 'string') {
        let adapter = new LocalStorage(db)
        db = low(adapter)
        db.read()
    }
    return {
        db,
        save (v) {
            db.set(key, v).write()
        },
        read (k) {
            return db.get(k || key).value()
        },
        destroy () {
            db.unset(key).write()
        }
    }
}

export function BCache (key, db) {
    function changeKey (k) {
        let ps = k.split('.')
        ps[2] = ps[2].replace(/^n/, '')
        return ps.join('.')
    }
    let cache = Cache(key, db)
    return {
        ...cache,
        read (k) {
            return cache.read(k) || JSON.parse(localStorage.getItem(changeKey(k || key)))
        }
    }
}

export default BCache
