import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Button from '../../../../public/components/Button';
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

    constructor(props) {
        super(props);

        this.state = {
            formValues: {},
            stale: false,
        };

        this.options = [
            { key: 'opt1', label: 'Option 1' },
            { key: 'opt2', label: 'Something else' },
        ];

        this.confidentialityOptions = [
            { key: 'unprotected', label: 'Unprotected' },
            { key: 'protected', label: 'Protected' },
            { key: 'restricted', label: 'Restricted' },
            { key: 'confidential', label: 'Confidential' },
        ];

        this.statusOptions = [
            { key: 'pending', label: 'Pending' },
            { key: 'processed', label: 'Processed' },
        ];

        this.formElements = [
            'assigned_to',
            'created_at',
            'published_on',
            'confidentiality',
            'status',
        ];
    }

    handleChange = () => {
        this.setState({
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
        return (
            <Form
                styleName="filters"
                className={this.props.className}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    formname="assigned_to"
                    options={this.options}
                    placeholder="Assigned to"
                    styleName="filter"
                />
                <SelectInput
                    formname="created_at"
                    options={this.options}
                    placeholder="Created on"
                    styleName="filter"
                />
                <SelectInput
                    formname="published_on"
                    options={this.options}
                    placeholder="Published on"
                    styleName="filter"
                />
                <SelectInput
                    formname="confidentiality"
                    options={this.confidentialityOptions}
                    placeholder="Confidentiality"
                    styleName="filter"
                />
                <SelectInput
                    formname="status"
                    options={this.statusOptions}
                    placeholder="Status"
                    styleName="filter"
                />
                <Button
                    styleName="apply-filter-btn"
                    disabled={!this.state.stale}
                >
                    Apply Filter
                </Button>
            </Form>
        );
    }
}
