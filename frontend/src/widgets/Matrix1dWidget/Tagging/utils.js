const emptyObject = {};

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
    Object.keys(attribute || emptyObject).forEach((key) => {
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


export const updateAttribute = ({ id, entryId, api, attribute, data, filters, exportable }) => {
    if (!attribute || !data) {
        api.getEntryModifier(entryId)
            .setHighlightColor(id, undefined)
            .apply();
        return;
    }

    const modifier = api.getEntryModifier(entryId)
        .setHighlightColor(id, createHighlightColor(attribute, data));

    // if (filters && filters.length === 1) {
    //     modifier.setFilterData(filters[0].id, createFilterData(attribute, data));
    // }

    // if (exportable) {
    //     modifier.setExportData(exportable.id, createExportData(attribute, data));
    // }

    modifier.apply();
};
