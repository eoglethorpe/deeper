import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Button from '../../../../public/components/Button';
import SelectInput from '../../../../public/components/SelectInput';
import Form from '../../../../public/utils/Form';

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

        const form = new Form();
        const elements = [
            'assigned_to',
            'created_at',
            'published_on',
            'confidentiality',
            'status',
        ];

        const updateValues = (data) => {
            this.setState({
                formValues: {
                    ...this.state.formValues,
                    ...data,
                },
            });
        };

        const updateErrors = (data) => {
            this.setState({
                formErrors: data,
            });
        };

        const okay = (data) => {
            this.props.onSubmit(data);
        };

        form.setElements(elements);

        // new state
        form.setCallbackForChange(updateValues);

        // calls with success and error
        form.setCallbackForSuccessAndFailure(okay, updateErrors);

        this.form = form;

        this.state = {
            formErrors: {},
            formValues: {},
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
    }

    handleApplyFilter = () => {
        this.form.onSubmit();
    }

    render() {
        return (
            <div
                styleName="filters"
                className={this.props.className}
            >
                <SelectInput
                    ref={this.form.updateRef('assigned_to')}
                    options={this.options}
                    placeholder="Assigned to"
                    styleName="filter"
                />
                <SelectInput
                    ref={this.form.updateRef('created_at')}
                    options={this.options}
                    placeholder="Created on"
                    styleName="filter"
                />
                <SelectInput
                    ref={this.form.updateRef('published_on')}
                    options={this.options}
                    placeholder="Published on"
                    styleName="filter"
                />
                <SelectInput
                    ref={this.form.updateRef('confidentiality')}
                    options={this.confidentialityOptions}
                    placeholder="Confidentiality"
                    styleName="filter"
                />
                <SelectInput
                    ref={this.form.updateRef('status')}
                    options={this.statusOptions}
                    placeholder="Status"
                    styleName="filter"
                />
                <Button
                    styleName="apply-filter-btn"
                    onClick={this.handleApplyFilter}
                >
                    Apply filter
                </Button>
            </div>
        );
    }
}
