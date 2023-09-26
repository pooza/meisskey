/**
 * 組み込みマップ定義
 *
 * データ値:
 * (スペース) ... マス無し
 * - ... マス
 * b ... 初期配置される黒石
 * w ... 初期配置される白石
 */ "use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    fourfour: function() {
        return fourfour;
    },
    sixsix: function() {
        return sixsix;
    },
    roundedSixsix: function() {
        return roundedSixsix;
    },
    roundedSixsix2: function() {
        return roundedSixsix2;
    },
    eighteight: function() {
        return eighteight;
    },
    eighteightH1: function() {
        return eighteightH1;
    },
    eighteightH2: function() {
        return eighteightH2;
    },
    eighteightH3: function() {
        return eighteightH3;
    },
    eighteightH4: function() {
        return eighteightH4;
    },
    eighteightH12: function() {
        return eighteightH12;
    },
    eighteightH16: function() {
        return eighteightH16;
    },
    eighteightH20: function() {
        return eighteightH20;
    },
    eighteightH28: function() {
        return eighteightH28;
    },
    roundedEighteight: function() {
        return roundedEighteight;
    },
    roundedEighteight2: function() {
        return roundedEighteight2;
    },
    roundedEighteight3: function() {
        return roundedEighteight3;
    },
    eighteightWithNotch: function() {
        return eighteightWithNotch;
    },
    eighteightWithSomeHoles: function() {
        return eighteightWithSomeHoles;
    },
    circle: function() {
        return circle;
    },
    smile: function() {
        return smile;
    },
    window: function() {
        return window;
    },
    reserved: function() {
        return reserved;
    },
    x: function() {
        return x;
    },
    parallel: function() {
        return parallel;
    },
    lackOfBlack: function() {
        return lackOfBlack;
    },
    squareParty: function() {
        return squareParty;
    },
    minesweeper: function() {
        return minesweeper;
    },
    tenthtenth: function() {
        return tenthtenth;
    },
    hole: function() {
        return hole;
    },
    grid: function() {
        return grid;
    },
    cross: function() {
        return cross;
    },
    charX: function() {
        return charX;
    },
    charY: function() {
        return charY;
    },
    walls: function() {
        return walls;
    },
    cpu: function() {
        return cpu;
    },
    checker: function() {
        return checker;
    },
    japaneseCurry: function() {
        return japaneseCurry;
    },
    mosaic: function() {
        return mosaic;
    },
    arena: function() {
        return arena;
    },
    reactor: function() {
        return reactor;
    },
    sixeight: function() {
        return sixeight;
    },
    spark: function() {
        return spark;
    },
    islands: function() {
        return islands;
    },
    galaxy: function() {
        return galaxy;
    },
    triangle: function() {
        return triangle;
    },
    iphonex: function() {
        return iphonex;
    },
    dealWithIt: function() {
        return dealWithIt;
    },
    experiment: function() {
        return experiment;
    },
    bigBoard: function() {
        return bigBoard;
    },
    twoBoard: function() {
        return twoBoard;
    },
    test1: function() {
        return test1;
    },
    test2: function() {
        return test2;
    },
    test3: function() {
        return test3;
    },
    test4: function() {
        return test4;
    },
    test5: function() {
        return test5;
    }
});
const fourfour = {
    name: '4x4',
    category: '4x4',
    data: [
        '----',
        '-wb-',
        '-bw-',
        '----'
    ]
};
const sixsix = {
    name: '6x6',
    category: '6x6',
    data: [
        '------',
        '------',
        '--wb--',
        '--bw--',
        '------',
        '------'
    ]
};
const roundedSixsix = {
    name: '6x6 rounded',
    category: '6x6',
    author: 'syuilo',
    data: [
        ' ---- ',
        '------',
        '--wb--',
        '--bw--',
        '------',
        ' ---- '
    ]
};
const roundedSixsix2 = {
    name: '6x6 rounded 2',
    category: '6x6',
    author: 'syuilo',
    data: [
        '  --  ',
        ' ---- ',
        '--wb--',
        '--bw--',
        ' ---- ',
        '  --  '
    ]
};
const eighteight = {
    name: '8x8',
    category: '8x8',
    data: [
        '--------',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        '--------'
    ]
};
const eighteightH1 = {
    name: '8x8 handicap 1',
    category: '8x8',
    data: [
        'b-------',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        '--------'
    ]
};
const eighteightH2 = {
    name: '8x8 handicap 2',
    category: '8x8',
    data: [
        'b-------',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        '-------b'
    ]
};
const eighteightH3 = {
    name: '8x8 handicap 3',
    category: '8x8',
    data: [
        'b------b',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        '-------b'
    ]
};
const eighteightH4 = {
    name: '8x8 handicap 4',
    category: '8x8',
    data: [
        'b------b',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        'b------b'
    ]
};
const eighteightH12 = {
    name: '8x8 handicap 12',
    category: '8x8',
    data: [
        'bb----bb',
        'b------b',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        'b------b',
        'bb----bb'
    ]
};
const eighteightH16 = {
    name: '8x8 handicap 16',
    category: '8x8',
    data: [
        'bbb---bb',
        'b------b',
        '-------b',
        '---wb---',
        '---bw---',
        'b-------',
        'b------b',
        'bb---bbb'
    ]
};
const eighteightH20 = {
    name: '8x8 handicap 20',
    category: '8x8',
    data: [
        'bbb--bbb',
        'b------b',
        'b------b',
        '---wb---',
        '---bw---',
        'b------b',
        'b------b',
        'bbb---bb'
    ]
};
const eighteightH28 = {
    name: '8x8 handicap 28',
    category: '8x8',
    data: [
        'bbbbbbbb',
        'b------b',
        'b------b',
        'b--wb--b',
        'b--bw--b',
        'b------b',
        'b------b',
        'bbbbbbbb'
    ]
};
const roundedEighteight = {
    name: '8x8 rounded',
    category: '8x8',
    author: 'syuilo',
    data: [
        ' ------ ',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        ' ------ '
    ]
};
const roundedEighteight2 = {
    name: '8x8 rounded 2',
    category: '8x8',
    author: 'syuilo',
    data: [
        '  ----  ',
        ' ------ ',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        ' ------ ',
        '  ----  '
    ]
};
const roundedEighteight3 = {
    name: '8x8 rounded 3',
    category: '8x8',
    author: 'syuilo',
    data: [
        '   --   ',
        '  ----  ',
        ' ------ ',
        '---wb---',
        '---bw---',
        ' ------ ',
        '  ----  ',
        '   --   '
    ]
};
const eighteightWithNotch = {
    name: '8x8 with notch',
    category: '8x8',
    author: 'syuilo',
    data: [
        '---  ---',
        '--------',
        '--------',
        ' --wb-- ',
        ' --bw-- ',
        '--------',
        '--------',
        '---  ---'
    ]
};
const eighteightWithSomeHoles = {
    name: '8x8 with some holes',
    category: '8x8',
    author: 'syuilo',
    data: [
        '--- ----',
        '----- --',
        '-- -----',
        '---wb---',
        '---bw- -',
        ' -------',
        '--- ----',
        '--------'
    ]
};
const circle = {
    name: 'Circle',
    category: '8x8',
    author: 'syuilo',
    data: [
        '   --   ',
        ' ------ ',
        ' ------ ',
        '---wb---',
        '---bw---',
        ' ------ ',
        ' ------ ',
        '   --   '
    ]
};
const smile = {
    name: 'Smile',
    category: '8x8',
    author: 'syuilo',
    data: [
        ' ------ ',
        '--------',
        '-- -- --',
        '---wb---',
        '-- bw --',
        '---  ---',
        '--------',
        ' ------ '
    ]
};
const window = {
    name: 'Window',
    category: '8x8',
    author: 'syuilo',
    data: [
        '--------',
        '-  --  -',
        '-  --  -',
        '---wb---',
        '---bw---',
        '-  --  -',
        '-  --  -',
        '--------'
    ]
};
const reserved = {
    name: 'Reserved',
    category: '8x8',
    author: 'Aya',
    data: [
        'w------b',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        'b------w'
    ]
};
const x = {
    name: 'X',
    category: '8x8',
    author: 'Aya',
    data: [
        'w------b',
        '-w----b-',
        '--w--b--',
        '---wb---',
        '---bw---',
        '--b--w--',
        '-b----w-',
        'b------w'
    ]
};
const parallel = {
    name: 'Parallel',
    category: '8x8',
    author: 'Aya',
    data: [
        '--------',
        '--------',
        '--------',
        '---bb---',
        '---ww---',
        '--------',
        '--------',
        '--------'
    ]
};
const lackOfBlack = {
    name: 'Lack of Black',
    category: '8x8',
    data: [
        '--------',
        '--------',
        '--------',
        '---w----',
        '---bw---',
        '--------',
        '--------',
        '--------'
    ]
};
const squareParty = {
    name: 'Square Party',
    category: '8x8',
    author: 'syuilo',
    data: [
        '--------',
        '-wwwbbb-',
        '-w-wb-b-',
        '-wwwbbb-',
        '-bbbwww-',
        '-b-bw-w-',
        '-bbbwww-',
        '--------'
    ]
};
const minesweeper = {
    name: 'Minesweeper',
    category: '8x8',
    author: 'syuilo',
    data: [
        'b-b--w-w',
        '-w-wb-b-',
        'w-b--w-b',
        '-b-wb-w-',
        '-w-bw-b-',
        'b-w--b-w',
        '-b-bw-w-',
        'w-w--b-b'
    ]
};
const tenthtenth = {
    name: '10x10',
    category: '10x10',
    data: [
        '----------',
        '----------',
        '----------',
        '----------',
        '----wb----',
        '----bw----',
        '----------',
        '----------',
        '----------',
        '----------'
    ]
};
const hole = {
    name: 'The Hole',
    category: '10x10',
    author: 'syuilo',
    data: [
        '----------',
        '----------',
        '--wb--wb--',
        '--bw--bw--',
        '----  ----',
        '----  ----',
        '--wb--wb--',
        '--bw--bw--',
        '----------',
        '----------'
    ]
};
const grid = {
    name: 'Grid',
    category: '10x10',
    author: 'syuilo',
    data: [
        '----------',
        '- - -- - -',
        '----------',
        '- - -- - -',
        '----wb----',
        '----bw----',
        '- - -- - -',
        '----------',
        '- - -- - -',
        '----------'
    ]
};
const cross = {
    name: 'Cross',
    category: '10x10',
    author: 'Aya',
    data: [
        '   ----   ',
        '   ----   ',
        '   ----   ',
        '----------',
        '----wb----',
        '----bw----',
        '----------',
        '   ----   ',
        '   ----   ',
        '   ----   '
    ]
};
const charX = {
    name: 'Char X',
    category: '10x10',
    author: 'syuilo',
    data: [
        '---    ---',
        '----  ----',
        '----------',
        ' -------- ',
        '  --wb--  ',
        '  --bw--  ',
        ' -------- ',
        '----------',
        '----  ----',
        '---    ---'
    ]
};
const charY = {
    name: 'Char Y',
    category: '10x10',
    author: 'syuilo',
    data: [
        '---    ---',
        '----  ----',
        '----------',
        ' -------- ',
        '  --wb--  ',
        '  --bw--  ',
        '  ------  ',
        '  ------  ',
        '  ------  ',
        '  ------  '
    ]
};
const walls = {
    name: 'Walls',
    category: '10x10',
    author: 'Aya',
    data: [
        ' bbbbbbbb ',
        'w--------w',
        'w--------w',
        'w--------w',
        'w---wb---w',
        'w---bw---w',
        'w--------w',
        'w--------w',
        'w--------w',
        ' bbbbbbbb '
    ]
};
const cpu = {
    name: 'CPU',
    category: '10x10',
    author: 'syuilo',
    data: [
        ' b b  b b ',
        'w--------w',
        ' -------- ',
        'w--------w',
        ' ---wb--- ',
        ' ---bw--- ',
        'w--------w',
        ' -------- ',
        'w--------w',
        ' b b  b b '
    ]
};
const checker = {
    name: 'Checker',
    category: '10x10',
    author: 'Aya',
    data: [
        '----------',
        '----------',
        '----------',
        '---wbwb---',
        '---bwbw---',
        '---wbwb---',
        '---bwbw---',
        '----------',
        '----------',
        '----------'
    ]
};
const japaneseCurry = {
    name: 'Japanese curry',
    category: '10x10',
    author: 'syuilo',
    data: [
        'w-b-b-b-b-',
        '-w-b-b-b-b',
        'w-w-b-b-b-',
        '-w-w-b-b-b',
        'w-w-wwb-b-',
        '-w-wbb-b-b',
        'w-w-w-b-b-',
        '-w-w-w-b-b',
        'w-w-w-w-b-',
        '-w-w-w-w-b'
    ]
};
const mosaic = {
    name: 'Mosaic',
    category: '10x10',
    author: 'syuilo',
    data: [
        '- - - - - ',
        ' - - - - -',
        '- - - - - ',
        ' - w w - -',
        '- - b b - ',
        ' - w w - -',
        '- - b b - ',
        ' - - - - -',
        '- - - - - ',
        ' - - - - -'
    ]
};
const arena = {
    name: 'Arena',
    category: '10x10',
    author: 'syuilo',
    data: [
        '- - -- - -',
        ' - -  - - ',
        '- ------ -',
        ' -------- ',
        '- --wb-- -',
        '- --bw-- -',
        ' -------- ',
        '- ------ -',
        ' - -  - - ',
        '- - -- - -'
    ]
};
const reactor = {
    name: 'Reactor',
    category: '10x10',
    author: 'syuilo',
    data: [
        '-w------b-',
        'b- -  - -w',
        '- --wb-- -',
        '---b  w---',
        '- b wb w -',
        '- w bw b -',
        '---w  b---',
        '- --bw-- -',
        'w- -  - -b',
        '-b------w-'
    ]
};
const sixeight = {
    name: '6x8',
    category: 'Special',
    data: [
        '------',
        '------',
        '------',
        '--wb--',
        '--bw--',
        '------',
        '------',
        '------'
    ]
};
const spark = {
    name: 'Spark',
    category: 'Special',
    author: 'syuilo',
    data: [
        ' -      - ',
        '----------',
        ' -------- ',
        ' -------- ',
        ' ---wb--- ',
        ' ---bw--- ',
        ' -------- ',
        ' -------- ',
        '----------',
        ' -      - '
    ]
};
const islands = {
    name: 'Islands',
    category: 'Special',
    author: 'syuilo',
    data: [
        '--------  ',
        '---wb---  ',
        '---bw---  ',
        '--------  ',
        '  -    -  ',
        '  -    -  ',
        '  --------',
        '  --------',
        '  --------',
        '  --------'
    ]
};
const galaxy = {
    name: 'Galaxy',
    category: 'Special',
    author: 'syuilo',
    data: [
        '   ------   ',
        '  --www---  ',
        ' ------w--- ',
        '---bbb--w---',
        '--b---b-w-b-',
        '-b--wwb-w-b-',
        '-b-w-bww--b-',
        '-b-w-b---b--',
        '---w--bbb---',
        ' ---w------ ',
        '  ---www--  ',
        '   ------   '
    ]
};
const triangle = {
    name: 'Triangle',
    category: 'Special',
    author: 'syuilo',
    data: [
        '    --    ',
        '    --    ',
        '   ----   ',
        '   ----   ',
        '  --wb--  ',
        '  --bw--  ',
        ' -------- ',
        ' -------- ',
        '----------',
        '----------'
    ]
};
const iphonex = {
    name: 'iPhone X',
    category: 'Special',
    author: 'syuilo',
    data: [
        ' --  -- ',
        '--------',
        '--------',
        '--------',
        '--------',
        '---wb---',
        '---bw---',
        '--------',
        '--------',
        '--------',
        '--------',
        ' ------ '
    ]
};
const dealWithIt = {
    name: 'Deal with it!',
    category: 'Special',
    author: 'syuilo',
    data: [
        '------------',
        '--w-b-------',
        ' --b-w------',
        '  --w-b---- ',
        '   -------  '
    ]
};
const experiment = {
    name: 'Let\'s experiment',
    category: 'Special',
    author: 'syuilo',
    data: [
        ' ------------ ',
        '------wb------',
        '------bw------',
        '--------------',
        '    -    -    ',
        '------  ------',
        'bbbbbb  wwwwww',
        'bbbbbb  wwwwww',
        'bbbbbb  wwwwww',
        'bbbbbb  wwwwww',
        'wwwwww  bbbbbb'
    ]
};
const bigBoard = {
    name: 'Big board',
    category: 'Special',
    data: [
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '-------wb-------',
        '-------bw-------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------',
        '----------------'
    ]
};
const twoBoard = {
    name: 'Two board',
    category: 'Special',
    author: 'Aya',
    data: [
        '-------- --------',
        '-------- --------',
        '-------- --------',
        '---wb--- ---wb---',
        '---bw--- ---bw---',
        '-------- --------',
        '-------- --------',
        '-------- --------'
    ]
};
const test1 = {
    name: 'Test1',
    category: 'Test',
    data: [
        '--------',
        '---wb---',
        '---bw---',
        '--------'
    ]
};
const test2 = {
    name: 'Test2',
    category: 'Test',
    data: [
        '------',
        '------',
        '-b--w-',
        '-w--b-',
        '-w--b-'
    ]
};
const test3 = {
    name: 'Test3',
    category: 'Test',
    data: [
        '-w-',
        '--w',
        'w--',
        '-w-',
        '--w',
        'w--',
        '-w-',
        '--w',
        'w--',
        '-w-',
        '---',
        'b--'
    ]
};
const test4 = {
    name: 'Test4',
    category: 'Test',
    data: [
        '-w--b-',
        '-w--b-',
        '------',
        '-w--b-',
        '-w--b-'
    ]
};
const test5 = {
    name: 'Test5',
    category: 'Test',
    data: [
        '--wwwwww--',
        '--wwwbwwww',
        '-bwwbwbwww',
        '-bwwwbwbww',
        '-bwwbwbwbw',
        '-bwbwbwb-w',
        'bwbwwbbb-w',
        'w-wbbbbb--',
        '--w-b-w---',
        '----------'
    ]
};

//# sourceMappingURL=maps.js.map
