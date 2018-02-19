export const createHighlightColor = (attribute, data) => {
    const selectedKey = Object.keys(attribute || {}).find(d => (
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

export const createDimensionFilterData = (attribute) => {
    const filterValues = [];
    Object.keys(attribute).forEach((key) => {
        const dimension = attribute[key];
        let dimensionExists = false;

        Object.keys(dimension).forEach((subKey) => {
            if (Object.values(dimension[subKey].length > 0)) {
                filterValues.push(subKey);
                dimensionExists = true;
            }
        });

        if (dimensionExists) {
            filterValues.push(key);
        }
    });


    return {
        values: filterValues,
        number: undefined,
    };
};

export const createSectorFilterData = (attribute) => {
    const filterValues = [];
    Object.keys(attribute).forEach((key) => {
        const dimension = attribute[key];

        Object.keys(dimension).forEach((subKey) => {
            const subdimension = dimension[subKey];

            Object.keys(subdimension).forEach((sectorKey) => {
                const subsectors = subdimension[sectorKey];
                if (subsectors) {
                    if (filterValues.indexOf(sectorKey) === -1) {
                        filterValues.push(sectorKey);
                    }

                    filterValues.push(...subsectors);
                }
            });
        });
    });

    return {
        values: filterValues,
        number: undefined,
    };
};

export const createExportData = (attribute, data) => {
    const excelValues = [];
    const reportValues = [];

    Object.keys(attribute).forEach((key) => {
        const dimension = attribute[key];
        const dimensionData = data.dimensions.find(d => d.id === key);
        if (!dimensionData) {
            return;
        }

        Object.keys(dimension).forEach((subKey) => {
            const subdimension = dimension[subKey];
            const subdimensionData = dimensionData.subdimensions.find(d => d.id === subKey);

            Object.keys(subdimension).forEach((sectorKey) => {
                const sectorData = data.sectors.find(s => s.id === sectorKey);
                const subsectors = subdimension[sectorKey];

                if (subsectors) {
                    excelValues.push([
                        dimensionData.title,
                        subdimensionData.title,
                        sectorData.title,
                        subsectors.map(ss => sectorData.subsectors.find(sd => sd.id === ss).title).join(','),
                    ]);
                    reportValues.push(`${sectorKey}-${key}-${subKey}`);
                }
            });
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

    // if (filters && filters.length === 2) {
    //     modifier.setFilterData(filters[0].id, createDimensionFilterData(attribute, data))
    //         .setFilterData(filters[1].id, createSectorFilterData(attribute, data));
    // }

    // if (exportable) {
    //     modifier.setExportData(exportable.id, createExportData(attribute, data));
    // }

    modifier.apply();
};
