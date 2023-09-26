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
const _define = require("../../define");
const _room = require("../../../../models/room");
const meta = {
    tags: [
        'room'
    ],
    requireCredential: true,
    params: {
        room: {
            validator: _cafy.default.obj({
                furnitures: _cafy.default.arr(_cafy.default.obj({
                    id: _cafy.default.str,
                    type: _cafy.default.str,
                    position: _cafy.default.obj({
                        x: _cafy.default.num,
                        y: _cafy.default.num,
                        z: _cafy.default.num
                    }),
                    rotation: _cafy.default.obj({
                        x: _cafy.default.num,
                        y: _cafy.default.num,
                        z: _cafy.default.num
                    }),
                    props: _cafy.default.optional.nullable.obj()
                })),
                roomType: _cafy.default.str,
                carpetColor: _cafy.default.str
            })
        },
        floor: {
            validator: _cafy.default.optional.num.int().min(-999).max(999),
            default: 0,
            desc: {
                'ja-JP': '階数',
                'en-US': 'Number of floors'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const exists = await _room.default.findOne({
        userId: user._id,
        floor: ps.floor
    });
    if (exists) {
        const set = {
            data: ps.room
        };
        await _room.default.update({
            userId: user._id,
            floor: ps.floor
        }, {
            $set: set
        });
    } else {
        await _room.default.insert({
            userId: user._id,
            floor: ps.floor,
            data: ps.room
        });
    }
});

//# sourceMappingURL=update.js.map
