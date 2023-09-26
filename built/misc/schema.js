"use strict";
Object.defineProperty(exports, "convertOpenApiSchema", {
    enumerable: true,
    get: function() {
        return convertOpenApiSchema;
    }
});
function convertOpenApiSchema(schema) {
    const x = JSON.parse(JSON.stringify(schema)); // copy
    if (![
        'string',
        'number',
        'boolean',
        'array',
        'object'
    ].includes(x.type)) {
        x['$ref'] = `#/components/schemas/${x.type}`;
    }
    if (x.type === 'array' && x.items) {
        x.items = convertOpenApiSchema(x.items);
    }
    if (x.type === 'object' && x.properties) {
        x.required = Object.entries(x.properties).filter(([k, v])=>!v.isOptional).map(([k, v])=>k);
        for (const k of Object.keys(x.properties)){
            x.properties[k] = convertOpenApiSchema(x.properties[k]);
        }
    }
    return x;
}

//# sourceMappingURL=schema.js.map
