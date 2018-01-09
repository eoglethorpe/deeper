import {
    FormattedDate,
} from '../../../../../public/components/View';

const ONE_DAY = 24 * 60 * 60 * 1000;

export const createFilterData = attribute => ({
    values: undefined,
    number: attribute.value && (
        Math.round(new Date(attribute.value).getTime() / ONE_DAY)
    ),
});

export const createExportData = attribute => ({
    excel: {
        value: attribute.value && (FormattedDate.format(
            new Date(attribute.value),
            'dd-MM-yyyy',
        )),
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