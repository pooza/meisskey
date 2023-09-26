"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const _messagingmessage = require("../../../../../models/messaging-message");
const _drivefile = require("../../../../../models/drive-file");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const _create = require("../../../../../services/messages/create");
const _user = require("../../../../../models/user");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーへMessagingのメッセージを送信します。',
        'en-US': 'Create a message of messaging.'
    },
    tags: [
        'messaging'
    ],
    requireCredential: true,
    kind: [
        'write:messaging',
        'messaging-write'
    ],
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        text: {
            validator: _cafy.default.optional.str.pipe(_messagingmessage.isValidText)
        },
        fileId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    res: {
        type: 'MessagingMessage'
    },
    errors: {
        recipientIsYourself: {
            message: 'You can not send a message to yourself.',
            code: 'RECIPIENT_IS_YOURSELF',
            id: '17e2ba79-e22a-4cbc-bf91-d327643f4a7e'
        },
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '11795c64-40ea-4198-b06e-3c873ed9039d'
        },
        remoteNotSupported: {
            message: 'Remote not supported.',
            code: 'REMOTE_NOT_SUPPORTED',
            id: '02a6703e-fa13-449b-b792-5512ccc0ece0'
        },
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: '4372b8e2-185d-4146-8749-2f68864a3e5f'
        },
        contentRequired: {
            message: 'Content required. You need to set text or fileId.',
            code: 'CONTENT_REQUIRED',
            id: '25587321-b0e6-449c-9239-f8925092942c'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Myself
    if (ps.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.recipientIsYourself);
    }
    // Fetch recipient
    const recipient = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Remote
    if ((0, _user.isRemoteUser)(recipient)) {
        throw new _error.ApiError(meta.errors.remoteNotSupported);
    }
    let file = null;
    if (ps.fileId != null) {
        file = await _drivefile.default.findOne({
            _id: ps.fileId,
            'metadata.userId': user._id
        });
        if (file === null) {
            throw new _error.ApiError(meta.errors.noSuchFile);
        }
    }
    // テキストが無いかつ添付ファイルも無かったらエラー
    if (ps.text == null && file == null) {
        throw new _error.ApiError(meta.errors.contentRequired);
    }
    return await (0, _create.createMessage)(user, recipient, ps.text, file);
});

//# sourceMappingURL=create.js.map
