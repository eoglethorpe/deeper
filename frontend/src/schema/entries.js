import { isFalsy } from '../vendor/ravl/common';
import { RavlError } from '../vendor/ravl/error';

const entrySchema = [];

{
    const name = 'entryExport';
    const schema = {
        doc: {
            name: 'entryExport',
            description: 'Export data for entry',
        },
        fields: {
            id: { type: 'uint' },
            data: { type: 'object' },
            exportable: { type: 'uint', required: true },
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
            analysisFramework: { type: 'uint', required: true },

            image: { type: 'string' },
            excerpt: { type: 'string' },
            lead: { type: 'uint', required: true },
            entryType: { type: 'string', required: true },
            informationDate: { type: 'string' },
            exportData: { type: 'array.entryExport', required: true },
            filterData: { type: 'array.entryFilter', required: true },
            attributes: { type: 'array.entryAttributes', required: true },
            order: { type: 'uint', required: true },
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
    const name = 'miniLead';
    const schema = {
        doc: {
            name: 'miniLead',
            description: 'Object of subset of lead',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            id: { type: 'uint', required: true },
            source: { type: 'string' },
            title: { type: 'string' },
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'leadsEntriesObject';
    const schema = {
        doc: {
            name: 'LeadsEntriesObject',
            description: 'Object of array of leads and entries',
        },
        fields: {
            leads: { type: 'array.miniLead', required: true },
            entries: { type: 'array.entry', required: true },
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
            results: { type: 'leadsEntriesObject', required: true },
        },
    };
    entrySchema.push({ name, schema });
}

export default entrySchema;
