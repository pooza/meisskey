/**
 * AiScript
 */ "use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    funcDefs: function() {
        return funcDefs;
    },
    literalDefs: function() {
        return literalDefs;
    },
    blockDefs: function() {
        return blockDefs;
    },
    isFnBlock: function() {
        return isFnBlock;
    },
    envVarsDef: function() {
        return envVarsDef;
    },
    isLiteralBlock: function() {
        return isLiteralBlock;
    }
});
const _freesolidsvgicons = require("@fortawesome/free-solid-svg-icons");
const _freeregularsvgicons = require("@fortawesome/free-regular-svg-icons");
const funcDefs = {
    if: {
        in: [
            'boolean',
            0,
            0
        ],
        out: 0,
        category: 'flow',
        icon: _freesolidsvgicons.faShareAlt
    },
    for: {
        in: [
            'number',
            'function'
        ],
        out: null,
        category: 'flow',
        icon: _freesolidsvgicons.faRecycle
    },
    not: {
        in: [
            'boolean'
        ],
        out: 'boolean',
        category: 'logical',
        icon: _freeregularsvgicons.faFlag
    },
    or: {
        in: [
            'boolean',
            'boolean'
        ],
        out: 'boolean',
        category: 'logical',
        icon: _freeregularsvgicons.faFlag
    },
    and: {
        in: [
            'boolean',
            'boolean'
        ],
        out: 'boolean',
        category: 'logical',
        icon: _freeregularsvgicons.faFlag
    },
    add: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faPlus
    },
    subtract: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faMinus
    },
    multiply: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faTimes
    },
    divide: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faDivide
    },
    mod: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faDivide
    },
    round: {
        in: [
            'number'
        ],
        out: 'number',
        category: 'operation',
        icon: _freesolidsvgicons.faCalculator
    },
    eq: {
        in: [
            0,
            0
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faEquals
    },
    notEq: {
        in: [
            0,
            0
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faNotEqual
    },
    gt: {
        in: [
            'number',
            'number'
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faGreaterThan
    },
    lt: {
        in: [
            'number',
            'number'
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faLessThan
    },
    gtEq: {
        in: [
            'number',
            'number'
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faGreaterThanEqual
    },
    ltEq: {
        in: [
            'number',
            'number'
        ],
        out: 'boolean',
        category: 'comparison',
        icon: _freesolidsvgicons.faLessThanEqual
    },
    strLen: {
        in: [
            'string'
        ],
        out: 'number',
        category: 'text',
        icon: _freesolidsvgicons.faQuoteRight
    },
    strPick: {
        in: [
            'string',
            'number'
        ],
        out: 'string',
        category: 'text',
        icon: _freesolidsvgicons.faQuoteRight
    },
    strReplace: {
        in: [
            'string',
            'string',
            'string'
        ],
        out: 'string',
        category: 'text',
        icon: _freesolidsvgicons.faQuoteRight
    },
    strReverse: {
        in: [
            'string'
        ],
        out: 'string',
        category: 'text',
        icon: _freesolidsvgicons.faQuoteRight
    },
    join: {
        in: [
            'stringArray',
            'string'
        ],
        out: 'string',
        category: 'text',
        icon: _freesolidsvgicons.faQuoteRight
    },
    stringToNumber: {
        in: [
            'string'
        ],
        out: 'number',
        category: 'convert',
        icon: _freesolidsvgicons.faExchangeAlt
    },
    numberToString: {
        in: [
            'number'
        ],
        out: 'string',
        category: 'convert',
        icon: _freesolidsvgicons.faExchangeAlt
    },
    splitStrByLine: {
        in: [
            'string'
        ],
        out: 'stringArray',
        category: 'convert',
        icon: _freesolidsvgicons.faExchangeAlt
    },
    pick: {
        in: [
            null,
            'number'
        ],
        out: null,
        category: 'list',
        icon: _freesolidsvgicons.faIndent
    },
    listLen: {
        in: [
            null
        ],
        out: 'number',
        category: 'list',
        icon: _freesolidsvgicons.faIndent
    },
    rannum: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    dailyRannum: {
        in: [
            'number',
            'number'
        ],
        out: 'number',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    seedRannum: {
        in: [
            null,
            'number',
            'number'
        ],
        out: 'number',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    random: {
        in: [
            'number'
        ],
        out: 'boolean',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    dailyRandom: {
        in: [
            'number'
        ],
        out: 'boolean',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    seedRandom: {
        in: [
            null,
            'number'
        ],
        out: 'boolean',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    randomPick: {
        in: [
            0
        ],
        out: 0,
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    dailyRandomPick: {
        in: [
            0
        ],
        out: 0,
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    seedRandomPick: {
        in: [
            null,
            0
        ],
        out: 0,
        category: 'random',
        icon: _freesolidsvgicons.faDice
    },
    DRPWPM: {
        in: [
            'stringArray'
        ],
        out: 'string',
        category: 'random',
        icon: _freesolidsvgicons.faDice
    }
};
const literalDefs = {
    text: {
        out: 'string',
        category: 'value',
        icon: _freesolidsvgicons.faQuoteRight
    },
    multiLineText: {
        out: 'string',
        category: 'value',
        icon: _freesolidsvgicons.faAlignLeft
    },
    textList: {
        out: 'stringArray',
        category: 'value',
        icon: _freesolidsvgicons.faList
    },
    number: {
        out: 'number',
        category: 'value',
        icon: _freesolidsvgicons.faSortNumericUp
    },
    ref: {
        out: null,
        category: 'value',
        icon: _freesolidsvgicons.faMagic
    },
    fn: {
        out: 'function',
        category: 'value',
        icon: _freesolidsvgicons.faSquareRootAlt
    }
};
const blockDefs = [
    ...Object.entries(literalDefs).map(([k, v])=>({
            type: k,
            out: v.out,
            category: v.category,
            icon: v.icon
        })),
    ...Object.entries(funcDefs).map(([k, v])=>({
            type: k,
            out: v.out,
            category: v.category,
            icon: v.icon
        }))
];
function isFnBlock(block) {
    return block.type === 'fn';
}
const envVarsDef = {
    AI: 'string',
    URL: 'string',
    VERSION: 'string',
    LOGIN: 'boolean',
    NAME: 'string',
    USERNAME: 'string',
    USERID: 'string',
    NOTES_COUNT: 'number',
    FOLLOWERS_COUNT: 'number',
    FOLLOWING_COUNT: 'number',
    IS_CAT: 'boolean',
    MY_NOTES_COUNT: 'number',
    MY_FOLLOWERS_COUNT: 'number',
    MY_FOLLOWING_COUNT: 'number',
    SEED: null,
    YMD: 'string',
    YEAR: 'number',
    MON: 'number',
    DAY: 'number',
    HOUR: 'number',
    MIN: 'number',
    SEC: 'number',
    NULL: null
};
function isLiteralBlock(v) {
    if (v.type === null) return true;
    if (literalDefs[v.type]) return true;
    return false;
}

//# sourceMappingURL=index.js.map
