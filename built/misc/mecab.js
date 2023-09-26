"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getIndexer: function() {
        return getIndexer;
    },
    getWordIndexer: function() {
        return getWordIndexer;
    }
});
const _parse = require("../mfm/parse");
const _totext = require("../mfm/to-text");
const _toword = require("../mfm/to-word");
const _config = require("../config");
const _array = require("../prelude/array");
const _child_process = require("child_process");
const _util = require("util");
const _stream = require("stream");
const _memorystreams = require("memory-streams");
const _os = require("os");
const NeologdNormalizer = require('neologd-normalizer').default;
const pipeline = _util.promisify(_stream.pipeline);
const stopWords = new Set([
    ...require('stopwords-en'),
    ...require('stopwords-zh')
]);
async function getIndexer(note) {
    const source = `${note.text || ''} ${note.cw || ''}`;
    const text = (0, _totext.default)((0, _parse.parseFull)(source));
    const tokens = await me(text);
    const words = (0, _array.unique)(tokens.filter((token)=>[
            'フィラー',
            '感動詞',
            '形容詞',
            '連体詞',
            '動詞',
            '副詞',
            '名詞'
        ].includes(token[1])).map((token)=>token[0]));
    const filtered = filterStopWords(words);
    return filtered;
}
async function getWordIndexer(note) {
    const source = `${note.text || ''} ${note.cw || ''}`;
    const text = (0, _toword.default)((0, _parse.parseFull)(source));
    const tokens = await me(text);
    const words = (0, _array.unique)(tokens.filter((token)=>token[1] === '名詞').map((token)=>token[0]));
    const filtered = filterStopWords(words);
    return filtered;
}
function filterStopWords(array) {
    return array.filter((x)=>!stopWords.has(x));
}
async function me(text) {
    var _config_mecabSearch;
    if ((_config_mecabSearch = _config.default.mecabSearch) === null || _config_mecabSearch === void 0 ? void 0 : _config_mecabSearch.mecabBin) {
        text = text.normalize('NFKC');
        text = text.toLowerCase();
        if (_config.default.mecabSearch.mecabNeologd) text = NeologdNormalizer.normalize(text);
        return await mecab(text, _config.default.mecabSearch.mecabBin, _config.default.mecabSearch.mecabDic);
    }
    return [];
}
/**
 * Run MeCab
 * @param text Text to analyze
 * @param mecab mecab bin
 * @param dic mecab dictionaly path
 */ async function mecab(text, mecab = 'mecab', dic) {
    const args = [];
    if (dic) args.push('-d', dic);
    const lines = await cmd(mecab, args, `${text.replace(/[\n\s\t]/g, ' ')}\n`);
    const results = [];
    for (const line of lines){
        if (line === 'EOS') break;
        const [word, value = ''] = line.split('\t');
        const array = value.split(',');
        array.unshift(word);
        results.push(array);
    }
    return results;
}
async function cmd(command, args, stdin) {
    const mecab = (0, _child_process.spawn)(command, args);
    const writable = new _memorystreams.WritableStream();
    mecab.stdin.write(stdin);
    mecab.stdin.end();
    await pipeline(mecab.stdout, writable);
    return writable.toString().split(_os.EOL);
}

//# sourceMappingURL=mecab.js.map
