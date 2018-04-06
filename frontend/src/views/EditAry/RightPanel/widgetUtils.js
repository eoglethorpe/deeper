import React from 'react';
import MultiSelectInput from '../../../vendor/react-store/components/Input/MultiSelectInput';
import DateInput from '../../../vendor/react-store/components/Input/DateInput';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    multiselect: MultiSelectInput,
    select: SelectInput,
};

// eslint-disable-next-line import/prefer-default-export
export const renderWidget = (data) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
    } = data;

    const id = String(key);
    const commonProps = {
        formname: id,
        key: id,
        label: title,
        options,
        placeholder,
    };
    const typeSpecificProps = {
        number: {
            separator: ' ',
        },
    };

    const Component = widgets[fieldType];

    if (!Component) {
        console.error('Unidentified fieldType', fieldType);
        return null;
    }

    return (
        <Component
            {...commonProps}
            {...typeSpecificProps[fieldType]}
        />
    );
};