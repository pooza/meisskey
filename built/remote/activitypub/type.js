"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getApIds: function() {
        return getApIds;
    },
    getOneApId: function() {
        return getOneApId;
    },
    getApId: function() {
        return getApId;
    },
    getApType: function() {
        return getApType;
    },
    getOneApHrefNullable: function() {
        return getOneApHrefNullable;
    },
    getApHrefNullable: function() {
        return getApHrefNullable;
    },
    validPost: function() {
        return validPost;
    },
    isPost: function() {
        return isPost;
    },
    isTombstone: function() {
        return isTombstone;
    },
    isQuestion: function() {
        return isQuestion;
    },
    isDocument: function() {
        return isDocument;
    },
    isImage: function() {
        return isImage;
    },
    isPropertyValue: function() {
        return isPropertyValue;
    },
    isMention: function() {
        return isMention;
    },
    isHashtag: function() {
        return isHashtag;
    },
    validActor: function() {
        return validActor;
    },
    isActor: function() {
        return isActor;
    },
    isEmoji: function() {
        return isEmoji;
    },
    isCollection: function() {
        return isCollection;
    },
    isOrderedCollection: function() {
        return isOrderedCollection;
    },
    isCollectionPage: function() {
        return isCollectionPage;
    },
    isOrderedCollectionPage: function() {
        return isOrderedCollectionPage;
    },
    isCollectionOrOrderedCollection: function() {
        return isCollectionOrOrderedCollection;
    },
    isCreate: function() {
        return isCreate;
    },
    isDelete: function() {
        return isDelete;
    },
    isUpdate: function() {
        return isUpdate;
    },
    isRead: function() {
        return isRead;
    },
    isUndo: function() {
        return isUndo;
    },
    isFollow: function() {
        return isFollow;
    },
    isAccept: function() {
        return isAccept;
    },
    isReject: function() {
        return isReject;
    },
    isAdd: function() {
        return isAdd;
    },
    isRemove: function() {
        return isRemove;
    },
    isLike: function() {
        return isLike;
    },
    isAnnounce: function() {
        return isAnnounce;
    },
    isBlock: function() {
        return isBlock;
    },
    isFlag: function() {
        return isFlag;
    }
});
const _array = require("../../prelude/array");
function getApIds(value) {
    if (value == null) return [];
    const array = (0, _array.toArray)(value);
    return array.map((x)=>getApId(x));
}
function getOneApId(value) {
    const firstOne = (0, _array.toSingle)(value);
    return getApId(firstOne);
}
function getApId(value) {
    var _value;
    if (typeof value === 'string') return value;
    if (typeof ((_value = value) === null || _value === void 0 ? void 0 : _value.id) === 'string') return value.id;
    throw new Error(`cannot detemine id`);
}
function getApType(value) {
    if (typeof value.type === 'string') return value.type;
    if (Array.isArray(value.type) && typeof value.type[0] === 'string') return value.type[0];
    throw new Error(`cannot detect type`);
}
function getOneApHrefNullable(value) {
    const firstOne = Array.isArray(value) ? value[0] : value;
    return getApHrefNullable(firstOne);
}
function getApHrefNullable(value) {
    var _value;
    if (typeof value === 'string') return value;
    if (typeof ((_value = value) === null || _value === void 0 ? void 0 : _value.href) === 'string') return value.href;
    return undefined;
}
const validPost = [
    'Note',
    'Question',
    'Article',
    'Audio',
    'Document',
    'Image',
    'Page',
    'Video',
    'Event'
];
const isPost = (object)=>validPost.includes(getApType(object));
const isTombstone = (object)=>getApType(object) === 'Tombstone';
const isQuestion = (object)=>getApType(object) === 'Note' || getApType(object) === 'Question';
const isDocument = (object)=>[
        'Audio',
        'Document',
        'Image',
        'Page',
        'Video'
    ].includes(getApType(object));
const isImage = (object)=>getApType(object) === 'Image';
const isPropertyValue = (object)=>object && getApType(object) === 'PropertyValue' && typeof object.name === 'string' && typeof object.value === 'string';
const isMention = (object)=>getApType(object) === 'Mention' && typeof object.href === 'string';
const isHashtag = (object)=>getApType(object) === 'Hashtag' && typeof object.name === 'string';
const validActor = [
    'Person',
    'Service',
    'Group',
    'Organization',
    'Application'
];
const isActor = (object)=>validActor.includes(getApType(object));
const isEmoji = (object)=>getApType(object) === 'Emoji' && typeof object.name === 'string' && object.icon != null;
const isCollection = (object)=>getApType(object) === 'Collection';
const isOrderedCollection = (object)=>getApType(object) === 'OrderedCollection';
const isCollectionPage = (object)=>getApType(object) === 'CollectionPage';
const isOrderedCollectionPage = (object)=>getApType(object) === 'OrderedCollectionPage';
const isCollectionOrOrderedCollection = (object)=>isCollection(object) || isOrderedCollection(object);
const isCreate = (object)=>getApType(object) === 'Create';
const isDelete = (object)=>getApType(object) === 'Delete';
const isUpdate = (object)=>getApType(object) === 'Update';
const isRead = (object)=>getApType(object) === 'Read';
const isUndo = (object)=>getApType(object) === 'Undo';
const isFollow = (object)=>getApType(object) === 'Follow';
const isAccept = (object)=>getApType(object) === 'Accept';
const isReject = (object)=>getApType(object) === 'Reject';
const isAdd = (object)=>getApType(object) === 'Add';
const isRemove = (object)=>getApType(object) === 'Remove';
const isLike = (object)=>getApType(object) === 'Like' || getApType(object) === 'Dislike' || getApType(object) === 'EmojiReaction' || getApType(object) === 'EmojiReact';
const isAnnounce = (object)=>getApType(object) === 'Announce';
const isBlock = (object)=>getApType(object) === 'Block';
const isFlag = (object)=>getApType(object) === 'Flag';

//# sourceMappingURL=type.js.map
