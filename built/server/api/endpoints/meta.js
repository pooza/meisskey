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
const _config = require("../../../config");
const _define = require("../define");
const _buildmeta = require("../../../misc/build-meta");
const _fetchmeta = require("../../../misc/fetch-meta");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': 'インスタンス情報を取得します。',
        'en-US': 'Get the information of this instance.'
    },
    tags: [
        'meta'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {
        detail: {
            validator: _cafy.default.optional.boolean,
            default: true
        }
    },
    res: {
        type: 'object',
        properties: {
            version: {
                type: 'string',
                description: 'The version of Misskey of this instance.',
                example: _config.default.version
            },
            name: {
                type: 'string',
                description: 'The name of this instance.'
            },
            description: {
                type: 'string',
                description: 'The description of this instance.'
            },
            announcements: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The title of the announcement.'
                        },
                        text: {
                            type: 'string',
                            description: 'The text of the announcement. (can be HTML)'
                        }
                    }
                },
                description: 'The announcements of this instance.'
            },
            disableRegistration: {
                type: 'boolean',
                description: 'Whether disabled open registration.'
            },
            disableLocalTimeline: {
                type: 'boolean',
                description: 'Whether disabled LTL and STL.'
            },
            disableGlobalTimeline: {
                type: 'boolean',
                description: 'Whether disabled GTL.'
            },
            enableEmojiReaction: {
                type: 'boolean',
                description: 'Whether enabled emoji reaction.'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const instance = await (0, _fetchmeta.default)();
    const response = await (0, _buildmeta.buildMeta)(instance, ps.detail);
    return response;
});

//# sourceMappingURL=meta.js.map
