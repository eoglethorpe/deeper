import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DangerButton,
    SuccessButton,
} from '../../../public/components/Action';
import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    pending: PropTypes.bool,
    stale: PropTypes.bool.isRequired,
    regionDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    className: '',
    pending: false,
    stale: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class RegionDetailForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
        };
        this.elements = [
            'countryCode',
            'countryName',
            'wbRegion',
            'wbIncomeRegion',
            'ochaRegion',
            'echoRegion',
            'unGeoRegion',
            'unGeoSubregion',
        ];
        this.validations = {
            countryCode: [requiredCondition],
            countryName: [requiredCondition],
            wbRegion: [requiredCondition],
            wbIncomeRegion: [requiredCondition],
            ochaRegion: [requiredCondition],
            echoRegion: [requiredCondition],
            unGeoRegion: [requiredCondition],
            unGeoSubregion: [requiredCondition],
        };
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
    };

    render() {
        const {
            regionDetail,
            pending,
            stale,
            className,
        } = this.props;

        const {
            formErrors,
            formFieldErrors,
            formValues,
        } = this.state;

        return (
            <Form
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                onSubmit={this.handleSubmit}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                className={className}
                styleName="region-detail-form"
            >
                { pending && <LoadingAnimation /> }
                <header styleName="header">
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            disabled={pending}
                        >
                            Cancel
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !stale}
                        >
                            Save
                        </SuccessButton>
                    </div>
                </header>
                <div styleName="input-container">
                    {
                        regionDetail.code &&
                            <TextInput
                                disabled
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                                value={regionDetail.code}
                            />
                    }
                    {
                        !regionDetail.code &&
                            <TextInput
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                    }
                    <TextInput
                        error={formFieldErrors.countryName}
                        formname="countryName"
                        label="Name"
                        placeholder="Nepal"
                        styleName="text-input"
                        value={regionDetail.title}
                    />
                    <TextInput
                        error={formFieldErrors.wbRegion}
                        formname="wbRegion"
                        label="WB Region"
                        placeholder="Enter WB Region"
                        styleName="text-input"
                        value={formValues.wbRegion}
                    />
                    <TextInput
                        error={formFieldErrors.wbIncomeRegion}
                        formname="wbIncomeRegion"
                        label="WB Income Region"
                        placeholder="Enter WB Income Region"
                        styleName="text-input"
                        value={formValues.wbIncomeRegion}
                    />
                    <TextInput
                        error={formFieldErrors.ochaRegion}
                        formname="ochaRegion"
                        label="OCHA Region"
                        placeholder="Enter OCHA Region"
                        styleName="text-input"
                        value={formValues.ochaRegion}
                    />
                    <TextInput
                        error={formFieldErrors.echoRegion}
                        formname="echoRegion"
                        label="ECHO Region"
                        placeholder="Enter ECHO Region"
                        styleName="text-input"
                        value={formValues.echoRegion}
                    />
                    <TextInput
                        error={formFieldErrors.unGeoRegion}
                        formname="unGeoRegion"
                        label="UN Geographical Region"
                        placeholder="Enter UN Geographical Region"
                        styleName="text-input"
                        value={formValues.unGeoRegion}
                    />
                    <TextInput
                        error={formFieldErrors.unGeoSubregion}
                        formname="unGeoSubregion"
                        label="UN Geographical Sub Region"
                        placeholder="Enter UN Geographical Sub Region"
                        styleName="text-input"
                        value={formValues.unGeoSubregion}
                    />
                </div>
            </Form>
        );
    }
}
