const getSelectedNodes = (node, activeKeys) => {
    const selected = node.organs.reduce((acc, o) => (
        acc.concat(getSelectedNodes(o, activeKeys))
    ), []);

    if (selected.length > 0 || activeKeys.indexOf(node.key) >= 0) {
        selected.push(node.key);
    }

    return selected;
};

export const createFilterData = (attribute, data) => ({
    values: getSelectedNodes(data, attribute.values.map(v => v.id)),
    number: undefined,
});

export const createExportData = attribute => ({
    excel: {
        type: 'list',
        value: attribute.values.map(v => v.name),
    },
});

export const updateAttribute = ({ entryId, api, attribute, data, filters, exportable }) => {
    if (!attribute || !attribute.values || !data) {
        return;
    }

    api.getEntryModifier(entryId)
        .setFilterData(filters[0].id, createFilterData(attribute, data))
        .setExportData(exportable.id, createExportData(attribute, data))
        .apply();
};
