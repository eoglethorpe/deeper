const emptyList = [];
const emptyObject = {};

export const createFilterData = attribute => ({
    values: attribute.value,
    number: undefined,
});

export const createExportData = (attribute, data) => ({
    excel: {
        type: 'list',
        value: attribute.value.map(key =>
            ((data || emptyObject).options || emptyList).find(d => d.key === key).label),
    },
});

export const updateAttribute = ({ entryId, api, attribute, data, filters, exportable }) => {
    if (!attribute || !data) {
        api.getEntryModifier(entryId)
            .setFilterData(filters[0].id, undefined)
            .setExportData(exportable.id, undefined)
            .apply();
        return;
    }

    api.getEntryModifier(entryId)
        .setFilterData(filters[0].id, createFilterData(attribute, data))
        .setExportData(exportable.id, createExportData(attribute, data))
        .apply();
};
