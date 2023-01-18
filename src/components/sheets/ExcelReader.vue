<template>
    <div>
        <el-upload :http-request="readFile" ref="uploader" accept=".xls,.xlsx"
                   :show-file-list="false"
                   :on-change="onChange">
            <el-button size="small" type="primary">打开文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
        </el-upload>
    </div>
</template>
<script>
    function readWorkbookFromLocalFile(XLSX, file, callback) {
        var reader = new FileReader()
        reader.onload = function (e) {
            var data = e.target.result
            var workbook = XLSX.read(data, {type: 'binary'})
            if (callback) callback(workbook)
        }
        reader.readAsBinaryString(file)
    }

    export default{
        data () {
            return {}
        },
        components: {},
        methods: {
            onChange(file, fileList) {
//                console.log(file)
            },
            readFile(req) {
                this.$emit('start', req)
                let file = req.file
                import('xlsx').then(XLSX => {

                    readWorkbookFromLocalFile(XLSX, file, (wb) => {
                        let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
                        console.log(data)
                        this.$emit('read', {file, data, wb})
                    })

                })
            }
        },
        computed: {}
    }
</script>
