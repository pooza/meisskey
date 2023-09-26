"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const check = (x)=>x && x.length;
function visit(node) {
    switch(node.type){
        case 'search':
            {
                return node.props.query;
            }
        case 'codeBlock':
        case 'codeInline':
            {
                return [
                    node.props.lang,
                    node.props.code
                ].filter(check).join(' ');
            }
        case 'mathBlock':
        case 'mathInline':
            {
                return node.props.formula;
            }
        /*
		case 'mention': {
			return node.props.canonical;
		}
		*/ case 'hashtag':
            {
                return `#${node.props.hashtag}`;
            }
        case 'url':
            {
                return node.props.url;
            }
        case 'emoji':
            {
                return node.props.emoji || `:${node.props.name}:`;
            }
        case 'text':
            {
                return node.props.text;
            }
        default:
            {
                if (node.children.length) {
                    return node.children.map(visit).join(' ');
                }
                return '';
            }
    }
}
const _default = (nodes)=>(nodes || []).map(visit).join(' ');

//# sourceMappingURL=to-text.js.map
