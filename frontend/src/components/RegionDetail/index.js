import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../vendor/react-store/components/Action/Button/SuccessButton';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForRegionPatch,
    createUrlForRegion,
} from '../../rest';
import {
    regionDetailForRegionSelector,
    setRegionDetailsAction,
    countriesStringsSelector,
    notificationStringsSelector,
} from '../../redux';
import schema from '../../schema';

import notify from '../../notify';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }),
    setRegionDetails: PropTypes.func.isRequired,
    dataLoading: PropTypes.bool,
    projectId: PropTypes.number,
    countriesStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    regionDetail: {},
    dataLoading: false,
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailForRegionSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class RegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { regionDetail } = this.props;

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {
                ...regionDetail.regionalGroups,
                countryCode: regionDetail.code,
                countryName: regionDetail.title,
            },
            pending: false,
            pristine: false,
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
            wbRegion: [],
            wbIncomeRegion: [],
            ochaRegion: [],
            echoRegion: [],
            unGeoRegion: [],
            unGeoSubregion: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        this.resetForm(nextProps);
    }

    resetForm = (props) => {
        const { regionDetail } = props;

        this.setState({
            formErrors: [],
            formFieldErrors: {},
            formValues: {
                ...regionDetail.regionalGroups,
                countryCode: regionDetail.code,
                countryName: regionDetail.title,
            },
            pending: false,
            pristine: false,
        });
    }

    createRequestForRegionDetailPatch = (regionId, data) => {
        const { projectId } = this.props;
        const urlForRegion = createUrlForRegion(regionId);
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(urlForRegion)
            .params(() => createParamsForRegionPatch(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'regionPatchResponse');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                        projectId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('regionDetail'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('regionDetailSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.setState({ pristine: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('regionDetail'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('regionDetailFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('regionDetail'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('regionDetailFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save region detail.'],
                });
            })
            .build();
        return regionDetailPatchRequest;
    }

    // FORM RELATED

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
            pristine: false,
        });
    };

    successCallback = (values) => {
        console.log(values);
        // Stop old patch request
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }

        // Create data for patch
        const data = {
            code: values.countryCode,
            title: values.countryName,
            regionalGroups: {
                wbRegion: values.wbRegion,
                wbIncomeRegion: values.wbIncomeRegion,
                ochaRegion: values.ochaRegion,
                echoRegion: values.echoRegion,
                unGeoRegion: values.unGeoRegion,
                unGeoSubregion: values.unGeoSubregion,
            },
        };

        // Create new patch request
        this.regionDetailPatchRequest =
            this.createRequestForRegionDetailPatch(this.props.regionDetail.id, data);
        this.regionDetailPatchRequest.start();
    };

    handleFormCancel = () => {
        // TODO: use user prompt
        this.resetForm(this.props);
    }

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        const {
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            pristine,
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
                error={formFieldErrors}
                value={formValues}
                disabled={pending}
            >
                { (pending || dataLoading) && <LoadingAnimation /> }
                <header styleName="header">
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            type="button"
                            onClick={this.handleFormCancel}
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('saveButtonLabel')}
                        </SuccessButton>
                    </div>
                </header>
                <div styleName="input-container">
                    <TextInput
                        formname="countryCode"
                        label={this.props.countriesStrings('countryCodeLabel')}
                        placeholder={this.props.countriesStrings('countryCodePlaceholder')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="countryName"
                        label={this.props.countriesStrings('countryNameLabel')}
                        placeholder={this.props.countriesStrings('countryNamePlaceholder')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="wbRegion"
                        label={this.props.countriesStrings('wbRegionLabel')}
                        placeholder={this.props.countriesStrings('wbRegionPlaceholer')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="wbIncomeRegion"
                        label={this.props.countriesStrings('wbIncomeRegionLabel')}
                        placeholder={this.props.countriesStrings('wbIncomeRegionPlaceholder')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="ochaRegion"
                        label={this.props.countriesStrings('ochaRegionLabel')}
                        placeholder={this.props.countriesStrings('ochaRegionPlaceholder')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="echoRegion"
                        label={this.props.countriesStrings('echoRegionLabel')}
                        placeholder={this.props.countriesStrings('echoRegionPlaceholder')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="unGeoRegion"
                        label={this.props.countriesStrings('unGeoRegionLabel')}
                        placeholder={this.props.countriesStrings('unGeoRegionPlaceholer')}
                        styleName="text-input"
                    />
                    <TextInput
                        formname="unGeoSubregion"
                        label={this.props.countriesStrings('unGeoSubregionLabel')}
                        placeholder={this.props.countriesStrings('unGeoSubregionPlaceholer')}
                        styleName="text-input"
                    />
                </div>
            </Form>
        );
    }
}
