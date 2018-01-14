import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Form,
    TextInput,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import {
    countriesString,
} from '../../../../common/constants';


@CSSModules(styles, { allowMultiple: true })
export default class CountryPopulationData extends React.PureComponent {
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
            >
                { pending && <LoadingAnimation /> }
                <div styleName="action-buttons">
                    <DangerButton
                        type="button"
                        onClick={this.handleFormCancel}
                        disabled={pending}
                    >
                        {countriesString.cancelButtonLabel}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {countriesString.saveChangesButtonLabel}
                    </PrimaryButton>
                </div>
                <div styleName="population-container">
                    <TextInput
                        label={countriesString.totalPopulationLabel}
                        styleName="population"
                        placeholder={countriesString.totalPopulationPlaceholder}
                        formname="population"
                    />
                    <TextInput
                        label={countriesString.sourceLabel}
                        styleName="source"
                        formname="source"
                        placeholder={countriesString.sourcePlaceholder}
                    />
                </div>
            </Form>
        );
    }
}
