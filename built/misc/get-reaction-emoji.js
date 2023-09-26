"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _default(reaction) {
    switch(reaction){
        case 'like':
            return '👍';
        case 'love':
            return '❤️';
        case 'laugh':
            return '😆';
        case 'hmm':
            return '🤔';
        case 'surprise':
            return '😮';
        case 'congrats':
            return '🎉';
        case 'angry':
            return '💢';
        case 'confused':
            return '😥';
        case 'rip':
            return '😇';
        case 'pudding':
            return '🍮';
        case 'star':
            return '⭐';
        default:
            return reaction;
    }
}

//# sourceMappingURL=get-reaction-emoji.js.map
