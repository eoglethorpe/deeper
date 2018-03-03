import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Form from '../../../../vendor/react-store/components/Input/Form';
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
        };
        this.elements = [
            'population',
            'population-source',

        ];
    }
    // FORM RELATED

    onSubmit = () => {
        this.form.onSubmit();
    }

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        this.setState({ pending: true });
        console.log(values);
    };

    handleFormCancel = () => {
        // TODO: do something later
        console.log('Form cancel');
    };

    render() {
        const {
            pristine,
            pending,
        } = this.state;
        return (
            <Form
                styleName="country-population"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
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
