"use strict";
Object.defineProperty(exports, "normalize", {
    enumerable: true,
    get: function() {
        return normalize;
    }
});
const _array = require("../prelude/array");
const _utils = require("./utils");
function isEmptyTextNode(node) {
    return node.type == 'text' && node.props.text === '';
}
function concatTextNodes(nodes) {
    return (0, _utils.createMfmNode)('text', {
        text: nodes.map((node)=>node.props.text).join('')
    });
}
function concatIfTextNodes(nodes) {
    return nodes[0].type === 'text' ? [
        concatTextNodes(nodes)
    ] : nodes;
}
function concatConsecutiveTextTrees(nodes) {
    const us = (0, _array.concat)(groupOn((node)=>node.type, nodes).map(concatIfTextNodes));
    return us.map((node)=>(0, _utils.createMfmNode)(node.type, node.props, concatConsecutiveTextTrees(node.children)));
}
function removeEmptyTextNodes(nodes) {
    return nodes.filter((node)=>!isEmptyTextNode(node)).map((node)=>(0, _utils.createMfmNode)(node.type, node.props, removeEmptyTextNodes(node.children)));
}
function normalize(nodes) {
    return removeEmptyTextNodes(concatConsecutiveTextTrees(nodes));
}
/**
 * Splits an array based on the equivalence relation.
 * The concatenation of the result is equal to the argument.
 */ function _groupBy(f, xs) {
    const groups = [];
    for (const x of xs){
        if (groups.length !== 0 && f(groups[groups.length - 1][0], x)) {
            groups[groups.length - 1].push(x);
        } else {
            groups.push([
                x
            ]);
        }
    }
    return groups;
}
/**
 * Splits an array based on the equivalence relation induced by the function.
 * The concatenation of the result is equal to the argument.
 */ function groupOn(f, xs) {
    return _groupBy((a, b)=>f(a) === f(b), xs);
}

//# sourceMappingURL=normalize.js.map
