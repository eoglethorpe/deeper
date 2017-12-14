import { isFalsy } from '../../vendor/ravl/common';
import { RavlError } from '../../vendor/ravl/error';

const entrySchema = [];

{
    const name = 'entryExport';
    const schema = {
        doc: {
            name: 'entryExport',
            description: 'Export data for entry',
        },
        fields: {
            entry: { type: 'uint', required: true },
            id: { type: 'uint' },
            data: { type: 'object' },
            exportable: { type: 'boolean', required: true },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entryFilter';
    const schema = {
        doc: {
            name: 'entryFilter',
            description: 'Filter data for entry',
        },
        fields: {
            number: { type: 'uint' },
            entry: { type: 'uint', required: true },
            id: { type: 'uint' },
            values: { type: 'array.string' },
            filter: { type: 'uint', required: true },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entryAttributes';
    const schema = {
        doc: {
            name: 'entryAttributes',
            description: 'Attributes data for entry',
        },
        fields: {
            entry: { type: 'uint', required: true },
            widget: { type: 'uint', required: true },
            id: { type: 'uint' },
            data: { type: 'object' },
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'entry';
    const schema = {
        doc: {
            name: 'entry',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            image: { type: 'uint' },
            analysisFramework: { type: 'uint', required: true },

            excerpt: { type: 'string' },
            lead: { type: 'uint', required: true },

            exportData: { type: 'array.entryExport', required: true },
            filterData: { type: 'array.entryFilter', required: true },
            attributes: { type: 'array.entryAttributes', required: true },
        },
        validator: (self, context) => {
            if (isFalsy(self.excerpt) && isFalsy(self.image)) {
                throw new RavlError('image or excerpt is required', context);
            }
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'entriesGetResponse';
    const schema = {
        doc: {
            name: 'Entries',
            description: 'List of entry',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.entry', required: true },
        },
    };
    entrySchema.push({ name, schema });
}

export default entrySchema;
