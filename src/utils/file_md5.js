/**
 * Created by denishuang on 2021/2/25.
 */

export function getFileMd5Async(file) {
    return import('spark-md5').then(SparkMD5 => {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        chunkSize = 2097152,                             // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader()

        return new Promise((resolve, reject) => {


            fileReader.onload = function (e) {
                // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
                spark.append(e.target.result)                   // Append array buffer
                currentChunk++

                if (currentChunk < chunks) {
                    loadNext()
                } else {
                    let md5 =  spark.end()
                    // console.log('finished loading')
                    resolve(md5)
                }
            }

            fileReader.onerror = function () {
                reject('oops, something went wrong.')
            }

            function loadNext() {
                var start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize

                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
            }

            loadNext()
        })


    })
}