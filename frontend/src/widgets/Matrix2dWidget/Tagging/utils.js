const emptyObject = {};

export const createHighlightColor = (attribute, data) => {
    const selectedKey = Object.keys(attribute || emptyObject).find(d => (
        Object.keys(attribute[d]).find(s => (
            Object.keys(attribute[d][s]).length > 0
        ))
    ));

    if (selectedKey) {
        const { dimensions } = data;
        const dimension = dimensions && dimensions.find(d => d.id === selectedKey);
        return dimension && dimension.color;
    }

    return undefined;
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
