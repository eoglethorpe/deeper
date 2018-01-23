export const createFilterData = attribute => ({
    values: attribute.selectedScale && [attribute.selectedScale],
    number: undefined,
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
        return;
    }

    if (filters && filters.length === 1 && exportable) {
        api.getEntryModifier(entryId)
            .setFilterData(filters[0].id, createFilterData(attribute, data))
            .setExportData(exportable.id, createExportData(attribute, data))
            .apply();
    }
};
