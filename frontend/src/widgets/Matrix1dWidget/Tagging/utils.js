const emptyObject = {};

export const createHighlightColor = (attribute, { rows }) => {
    let color;
    Object.keys(attribute || emptyObject).forEach((key) => {
        const row = attribute[key];

        const rowExists = Object.keys(row).reduce((acc, k) => acc || row[k], false);
        if (rowExists) {
            color = rows.find(d => d.key === key).color;
        }
    });

    return color;
};

export const updateAttribute = ({ id, entryId, api, attribute, data }) => {
    if (!attribute || !data) {
        api.getEntryModifier(entryId)
            .setHighlightColor(id, undefined)
            .apply();
        return;
    }

    api.getEntryModifier(entryId)
        .setHighlightColor(id, createHighlightColor(attribute, data))
        .apply();
};
