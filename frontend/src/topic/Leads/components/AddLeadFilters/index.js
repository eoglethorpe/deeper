import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import SelectInput from '../../../../public/components/SelectInput';

import Form from '../../../../public/components/Form';


const propTypes = {
    className: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class FilterLeadsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        this.state = {
            formValues: {},
            stale: false,
        };

        this.statusFilterOptions = [
            { key: 'unsaved', label: 'Unsaved' },
            { key: 'saved', label: 'Saved' },
            { key: 'invalid', label: 'Invalid' },
        ];

        this.sourceFilterOptions = [
            { key: 'googleDrive', label: 'Google Drive' },
            { key: 'dropbox', label: 'Dropbox' },
            { key: 'other', label: 'Other' },
        ];

        this.leadTypeOptions = [
            { key: 'text', label: 'Text' },
            { key: 'url', label: 'URL' },
            { key: 'doc', label: 'Docx' },
            { key: 'PDF', label: 'PDF' },
            { key: 'image', label: 'Image' },
            { key: 'PPT', label: 'PPT' },
        ];

        this.formElements = [
            'leadType',
            'status',
        ];
    }

    handleChange = (values) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            stale: true,
        });
    }

    handleSubmit = (values) => {
        this.setState({
            stale: false,
        });
        this.props.onSubmit(values);
    }

    render() {
        const {
            className,
        } = this.props;

        return (
            <Form
                styleName="filters"
                className={className}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    formname="leadType"
                    options={this.leadTypeOptions}
                    placeholder="Lead Type"
                    styleName="filter"
                    multiple
                />
                <SelectInput
                    formname="source"
                    options={this.sourceFilterOptions}
                    placeholder="Source"
                    styleName="filter"
                    multiple
                />
                <SelectInput
                    formname="status"
                    options={this.statusFilterOptions}
                    placeholder="Status"
                    styleName="filter"
                />
            </Form>
        );
    }
}
