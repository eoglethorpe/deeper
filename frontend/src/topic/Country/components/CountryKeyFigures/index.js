import CSSModules from 'react-css-modules';
import React from 'react';

import {
    Form,
    TextInput,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class CountryKeyFigures extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            stale: false,
            pending: false,
        };
        this.elements = [
            'index',
            'geo-rank',
            'geo-score',
            'geo-score-u5m',
            'rank',
            'u5m',
            'number-of-refugees',
            'percentage-uprooted-people',
            'geo-score-uprooted',
            'number-idp',
            'number-returned-refugees',
            'risk-class',
            'hazard-and-exposure',
            'vulnerability',
            'inform-risk-index',
            'lack-of-coping-capacity',
        ];
    }

    // FORM RELATED

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

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

    successCallback = (values) => {
        this.setState({ pending: true });
        console.log(values);
    };

    handleFormCancel = (e) => {
        e.preventDefault();
        this.props.onCancel();
    };
    render() {
        const {
            stale,
            pending,
        } = this.state;
        return (
            <Form
                styleName="key-figures"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
            >
                {
                    pending &&
                    <div styleName="pending-overlay">
                        <i
                            className="ion-load-c"
                            styleName="loading-icon"
                        />
                    </div>
                }
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.handleFormCancel}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save changes
                    </PrimaryButton>
                </div>
                <div styleName="hdi">
                    <h3>
                     Human Development Index
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="INDEX"
                        styleName="index"
                        type="number"
                        step="any"
                        min="0"
                        max="1"
                        formname="index"
                    />
                    <TextInput
                        label="GEO-RANK"
                        styleName="geo-rank"
                        readOnly
                        formname="geo-rank"
                    />
                    <TextInput
                        label="GEO-SCORE"
                        styleName="geo-score"
                        readOnly
                        formname="geo-score"
                    />
                    <TextInput
                        label="RANK"
                        styleName="rank"
                        formname="rank"
                    />
                </div>
                <div styleName="under-five-mortality-rate">
                    <h3>
                     UNDER FIVE MORTALITY RATE (per 1.000 live births)
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="U5M"
                        styleName="u5m"
                        formname="u5m"
                        type="number"
                    />
                    <TextInput
                        label="GEO SCORE"
                        styleName="geo-score-u5m"
                        readOnly
                        formname="geo-score-u5m"
                    />
                </div>
                <div styleName="uprooted-people">
                    <h3>
                     UPROOTED PEOPLE (refugees + IDPs + returned refugees)
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="Number of Refugees"
                        styleName="number-of-refugees"
                        formname="number-of-refugees"
                    />
                    <TextInput
                        label="Percentage of Uprooted People"
                        styleName="percentage-uprooted-people"
                        readOnly
                        formname="percentage-uprooted-people"
                    />
                    <TextInput
                        label="GEO-SCORE"
                        styleName="geo-score-uprooted"
                        readOnly
                        formname="geo-score-uprooted"
                    />
                    <TextInput
                        label="Number of IDPs"
                        styleName="number-idp"
                        formname="number-idp"
                    />
                    <TextInput
                        label="Number of returned refugees"
                        styleName="number-returned-refugees"
                        formname="number-returned-refugees"
                    />
                </div>
                <div styleName="inform-score">
                    <h3>
                    Inform Score
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="Risk Calss"
                        styleName="risk-class"
                        formname="risk-class"
                    />
                    <TextInput
                        label="Inform Risk Index"
                        styleName="inform-risk-index"
                        formname="inform-risk-index"
                    />
                    <TextInput
                        label="Hazard and Exposure"
                        styleName="hazard-and-exposure"
                        formname="hazard-and-exposure"
                    />
                    <TextInput
                        label="Vulnerability"
                        styleName="vulnerability"
                        formname="vulnerability"
                    />
                    <TextInput
                        label="Lack of Coping Capacity"
                        styleName="lack-of-coping-capacity"
                        formname="lack-of-coping-capacity"
                    />
                </div>
            </Form>
        );
    }
}
