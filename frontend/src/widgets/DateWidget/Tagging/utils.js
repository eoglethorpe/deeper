import FormattedDate from '../../../vendor/react-store/components/View/FormattedDate';

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
        return;
    }

    if (filters && filters.length === 1 && exportable) {
        api.getEntryModifier(entryId)
            .setFilterData(filters[0].id, createFilterData(attribute, data))
            .setExportData(exportable.id, createExportData(attribute, data))
            .apply();
    }
};
