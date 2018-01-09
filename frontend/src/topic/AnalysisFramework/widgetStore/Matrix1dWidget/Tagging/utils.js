export const createFilterData = (attribute) => {
    const filterValues = [];

    Object.keys(attribute).forEach((key) => {
        const row = attribute[key];

        let rowExists = false;
        Object.keys(row).forEach((cellKey) => {
            if (row[cellKey]) {
                rowExists = true;
                filterValues.push(cellKey);
            }
        });

        if (rowExists) {
            filterValues.push(key);
        }
    });

    return {
        values: filterValues,
        number: undefined,
    };
};

export const createHighlightColor = (attribute, { rows }) => {
    let color;
    Object.keys(attribute || {}).forEach((key) => {
        const row = attribute[key];

        const rowExists = Object.keys(row).reduce((acc, k) => acc || row[k], false);
        if (rowExists) {
            color = rows.find(d => d.key === key).color;
        }
    });

    return color;
};

export const createExportData = (attribute, { rows }) => {
    const excelValues = [];
    const reportValues = [];

    Object.keys(attribute).forEach((key) => {
        const row = attribute[key];
        const rowData = rows.find(r => r.key === key);

        Object.keys(row).forEach((cellKey) => {
            if (row[cellKey]) {
                const cellData = rowData.cells.find(c => c.key === cellKey);

                excelValues.push([rowData.title, cellData.value]);
                reportValues.push(`${key}-${cellKey}`);
            }
        });
    });

    return {
        excel: {
            type: 'lists',
            values: excelValues,
        },
        report: {
            keys: reportValues,
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
        .setHighlightColor(createHighlightColor(attribute, data))
        .setFilterData(filters[0].id, createFilterData(attribute, data))
        .setExportData(exportable.id, createExportData(attribute, data))
        .apply();
};
