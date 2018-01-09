export const createFilterData = attribute => ({
    values: attribute.values.map(v => v.key),
    number: undefined,
});

export const createExportData = attribute => ({
    excel: {
        values: attribute.values.map(v => v.key),
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
