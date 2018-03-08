import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Form from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';

import { countriesStringsSelector } from '../../../../redux';

import styles from './styles.scss';

const propTypes = {
    countriesStrings: PropTypes.func.isRequired,
};
const defaultProps = {
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryPopulationData extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pristine: false,
            pending: false,
            formValues: {},
        };

        this.schema = {
            fields: {
                population: [],
                'population-source': [],
            },
        };
    }
    // FORM RELATED

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        this.setState({ pending: true });
        console.log(values);
    };

    handleFormCancel = () => {
        console.log('Form cancel');
    };

    render() {
        const {
            pristine,
            pending,
            formErrors,
            formFieldErrors,
        } = this.state;

        return (
            <Form
                styleName="country-population"
                schema={this.schema}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <div styleName="action-buttons">
                    <DangerButton
                        type="button"
                        onClick={this.handleFormCancel}
                    >
                        {this.props.countriesStrings('cancelButtonLabel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {this.props.countriesStrings('saveChangesButtonLabel')}
                    </PrimaryButton>
                </div>
                <div styleName="population-container">
                    <TextInput
                        label={this.props.countriesStrings('totalPopulationLabel')}
                        styleName="population"
                        placeholder={this.props.countriesStrings('totalPopulationPlaceholder')}
                        formname="population"
                    />
                    <TextInput
                        label={this.props.countriesStrings('sourceLabel')}
                        styleName="source"
                        formname="source"
                        placeholder={this.props.countriesStrings('sourcePlaceholder')}
                    />
                </div>
            </Form>
        );
    }
}
