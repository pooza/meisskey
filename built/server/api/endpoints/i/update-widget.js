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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _define = require("../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        id: {
            validator: _cafy.default.str
        },
        data: {
            validator: _cafy.default.obj()
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    if (ps.id == null && ps.data == null) throw new Error('you need to set id and data params if home param unset');
    let widget;
    //#region Desktop home
    if (widget == null && user.clientSettings.home) {
        const desktopHome = user.clientSettings.home;
        widget = desktopHome.find((w)=>w.id == ps.id);
        if (widget) {
            widget.data = ps.data;
            await _user.default.update(user._id, {
                $set: {
                    'clientSettings.home': desktopHome
                }
            });
        }
    }
    //#endregion
    //#region Mobile home
    if (widget == null && user.clientSettings.mobileHome) {
        const mobileHome = user.clientSettings.mobileHome;
        widget = mobileHome.find((w)=>w.id == ps.id);
        if (widget) {
            widget.data = ps.data;
            await _user.default.update(user._id, {
                $set: {
                    'clientSettings.mobileHome': mobileHome
                }
            });
        }
    }
    //#endregion
    //#region Deck
    if (widget == null && user.clientSettings.deck && user.clientSettings.deck.columns) {
        const deck = user.clientSettings.deck;
        for (const c of deck.columns.filter((c)=>c.type == 'widgets')){
            for (const w of c.widgets.filter((w)=>w.id == ps.id)){
                widget = w;
            }
        }
        if (widget) {
            widget.data = ps.data;
            await _user.default.update(user._id, {
                $set: {
                    'clientSettings.deck': deck
                }
            });
        }
    }
    //#endregion
    if (widget) {
        (0, _stream.publishMainStream)(user._id, 'widgetUpdated', {
            id: ps.id,
            data: ps.data
        });
        return;
    } else {
        throw new Error('widget not found');
    }
});

//# sourceMappingURL=update-widget.js.map
