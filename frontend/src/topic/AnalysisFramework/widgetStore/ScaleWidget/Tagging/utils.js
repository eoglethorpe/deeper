export const createFilterData = (attribute, data) => ({
    values: undefined,
    number: attribute.selectedScale && (
        data.scaleUnits.findIndex(s => s.key === attribute.selectedScale) + 1
    ),
});

export const createExportData = (attribute, data) => {
    const scale = attribute.selectedScale && (
        data.scaleUnits.find(s => s.key === attribute.selectedScale)
    );
    return {
        excel: {
            value: scale ? scale.title : '',
        },
    };
};

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
