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
const _cafyid = require("../../../../misc/cafy-id");
const _userfilter = require("../../../../models/user-filter");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'ユーザーフィルター一覧を取得します。',
        'en-US': 'Get user filters'
    },
    tags: [
        'user-filter',
        'account'
    ],
    requireCredential: true,
    kind: [
        'read:account',
        'account-read',
        'account/read'
    ],
    params: {
        type: {
            validator: _cafy.default.optional.str.or([
                'hideRenote'
            ]),
            desc: {
                'ja-JP': '種類'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 30
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    /*
	const suspended = await User.find({
		isSuspended: true
	}, {
		fields: {
			_id: true
		}
	});
	*/ const query = {
        ownerId: me._id
    };
    if (ps.type === 'hideRenote') {
        query.hideRenote = true;
    }
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    const filters = await _userfilter.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _userfilter.packUserFilterMany)(filters, me);
});

//# sourceMappingURL=list.js.map
