import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    Form,
    TextInput,
    createValidation,
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import { tokenSelector } from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    token: PropTypes.object.isRequired, // eslint-disable-line
    onCancel: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddCountry extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        };

        this.elements = [
            'name',
            'code',
        ];
        this.validations = {
            name: [requiredCondition],
            code: [requiredCondition],
        };
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (data) => {
        console.log(data);
        this.props.onCancel();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
        } = this.state;

        return (
            <Form
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                {
                    pending &&
                        <div>
                            <i
                                className="ion-load-c"
                            />
                        </div>
                }
                <div>
                    {
                        formErrors.map(err => (
                            <div
                                key={err}
                            >
                                {err}
                            </div>
                        ))
                    }
                    { formErrors.length <= 0 &&
                        <div>
                            -
                        </div>
                    }
                </div>
                <TextInput
                    label="Country Name"
                    formname="name"
                    placeholder="Enter county name"
                    value={formValues.name}
                    error={formFieldErrors.name}
                />
                <TextInput
                    label="Code"
                    formname="code"
                    placeholder="Enter country code"
                    value={formValues.code}
                    error={formFieldErrors.code}
                />
                <div>
                    <DangerButton
                        onClick={this.props.onCancel}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save changes
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
