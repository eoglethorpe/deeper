import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { SelectInput } from '../../../../public/components/Input';

import styles from './styles.scss';

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
            { key: 'invalid', label: 'Invalid' },
            { key: 'saved', label: 'Saved' },
            { key: 'unsaved', label: 'Unsaved' },
        ];

        this.sourceFilterOptions = [
            { key: 'dropbox', label: 'Dropbox' },
            { key: 'googleDrive', label: 'Google Drive' },
            { key: 'other', label: 'Other' },
        ];

        this.leadTypeOptions = [
            { key: 'doc', label: 'Docx' },
            { key: 'image', label: 'Image' },
            { key: 'pdf', label: 'PDF' },
            { key: 'ppt', label: 'PPT' },
            { key: 'text', label: 'Text' },
            { key: 'url', label: 'URL' },
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
            <div
                className={className}
                styleName="filters"
            >
                <SelectInput
                    options={this.leadTypeOptions}
                    placeholder="Lead Type"
                    styleName="filter"
                    multiple
                />
                <SelectInput
                    options={this.sourceFilterOptions}
                    placeholder="Source"
                    styleName="filter"
                    multiple
                />
                <SelectInput
                    options={this.statusFilterOptions}
                    placeholder="Status"
                    styleName="filter"
                />
            </div>
        );
    }
}
