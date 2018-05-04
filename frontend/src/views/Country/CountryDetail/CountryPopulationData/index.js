import React from 'react';

import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Form from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';

import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
};
const defaultProps = {
};

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
                source: [],
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

        const khatriNoob = true;

        const underConstructionText = 'Under construction';
        const populationDataLabel = 'Population data';

        return (
            khatriNoob ? (
                <div className={styles.khatriNoob}>
                    <div>
                        {populationDataLabel}
                    </div>
                    <div className={styles.underConstruction}>
                        {underConstructionText}
                    </div>
                </div>
            ) : (
                <Form
                    className={styles.countryPopulation}
                    schema={this.schema}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    successCallback={this.successCallback}
                    formErrors={formErrors}
                    fieldErrors={formFieldErrors}
                    disabled={pending}
                >
                    { pending && <LoadingAnimation large /> }
                    <NonFieldErrors formerror="" />
                    <div className={styles.actionButtons}>
                        <DangerButton onClick={this.handleFormCancel}>
                            {_ts('countries', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            disabled={pending || !pristine}
                            type="submit"
                        >
                            {_ts('countries', 'saveChangesButtonLabel')}
                        </PrimaryButton>
                    </div>
                    <div className={styles.populationContainer}>
                        <TextInput
                            label={_ts('countries', 'totalPopulationLabel')}
                            className={styles.population}
                            placeholder={_ts('countries', 'totalPopulationPlaceholder')}
                            formname="population"
                        />
                        <TextInput
                            label={_ts('countries', 'sourceLabel')}
                            className={styles.source}
                            formname="source"
                            placeholder={_ts('countries', 'sourcePlaceholder')}
                        />
                    </div>
                </Form>
            )
        );
    }
}
