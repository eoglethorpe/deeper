export const createFilterData = attribute => ({
    values: undefined,
    number: attribute.value,
});

export const createExportData = attribute => ({
    excel: {
        value: `${attribute.value}`,
    },
});

export const updateAttribute = ({ entryId, api, attribute, data, filters, exportable }) => {
    if (!attribute) {
        return;
    }

    api.getEntryModifier(entryId)
        .setFilterData(filters[0].id, createFilterData(attribute, data))
        .setExportData(exportable.id, createExportData(attribute, data))
        .apply();
};
