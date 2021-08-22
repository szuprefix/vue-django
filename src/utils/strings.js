/**
 * Created by denishuang on 2021/8/12.
 */

export function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (!first.length && !second.length) return 1                  // if both are empty strings
    if (!first.length || !second.length) return 0                  // if only one is empty string
    if (first === second) return 1                                                         // identical
    if (first.length === 1 && second.length === 1) return 0         // both are 1-letter strings
    if (first.length < 2 || second.length < 2) return 0                     // if either is a 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2)
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1

        firstBigrams.set(bigram, count)
    }
    ;

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2)
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0

        if (count > 0) {
            firstBigrams.set(bigram, count - 1)
            intersectionSize++
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2)
}
