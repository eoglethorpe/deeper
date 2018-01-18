const emptyObject = {};
const emptyList = [];

export const createExportData = (attribute, data) => {
    const excelValues = [];

    (data.rowHeaders || emptyList).forEach((rowHeader) => {
        const rowValues = [];
        (data.columnHeaders || emptyList).forEach((columnHeader) => {
            const value = (attribute[rowHeader.key] || emptyObject)[columnHeader.key];

            if (value !== undefined) {
                excelValues.push(`${value}`);
                rowValues.push(value);
            } else {
                excelValues.push('');
            }
        });

        const isSame = rowValues.length === 0 || (new Set(rowValues).size === 1);
        excelValues.push(isSame ? 'True' : 'False');
    });

    return {
        excel: {
            values: excelValues,
        },
    };
};

export const updateAttribute = ({ entryId, api, attribute, data, exportable }) => {
    if (!attribute || !data) {
        return;
    }

    api.getEntryModifier(entryId)
        .setExportData(exportable.id, createExportData(attribute, data))
        .apply();
};
