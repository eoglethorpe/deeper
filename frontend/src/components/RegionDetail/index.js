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
    regionDetailSelector,
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
    regionDetail: regionDetailSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                countryCode: [requiredCondition],
                countryName: [requiredCondition],
                wbRegion: [],
                wbIncomeRegion: [],
                ochaRegion: [],
                echoRegion: [],
                unGeoRegion: [],
                unGeoSubregion: [],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        this.resetForm(nextProps);
    }

    resetForm = (props) => {
        const { regionDetail } = props;

        this.setState({
            formErrors: {},
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
                        regionDetails: {
                            ...response,
                            pristine: false,
                        },
                        regionId,
                        projectId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('regionDetail'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('regionDetailSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
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
                    formErrors: { errors: ['Error while trying to save region detail.'] },
                });
            })
            .build();
        return regionDetailPatchRequest;
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
            pristine: false,
        });
    };

    successCallback = (values) => {
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

        // FIXME: use strings
        const headingText = 'Region details';
        return (
            <Form
                className={`${className} ${styles.regionDetailForm}`}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                onSubmit={this.handleSubmit}
                successCallback={this.successCallback}
                schema={this.schema}
                fieldErrors={formFieldErrors}
                formErrors={formErrors}
                value={formValues}
                disabled={pending}
            >
                { (pending || dataLoading) && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h4 className={styles.heading} >
                        { headingText }
                    </h4>
                    <div className={styles.actionButtons}>
                        <DangerButton
                            onClick={this.handleFormCancel}
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <SuccessButton
                            type="submit"
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('saveButtonLabel')}
                        </SuccessButton>
                    </div>
                </header>
                <NonFieldErrors
                    formerror=""
                    className={styles.nonFieldErrors}
                />
                <div className={styles.inputContainer}>
                    <TextInput
                        formname="countryCode"
                        label={this.props.countriesStrings('countryCodeLabel')}
                        placeholder={this.props.countriesStrings('countryCodePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="countryName"
                        label={this.props.countriesStrings('countryNameLabel')}
                        placeholder={this.props.countriesStrings('countryNamePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="wbRegion"
                        label={this.props.countriesStrings('wbRegionLabel')}
                        placeholder={this.props.countriesStrings('wbRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="wbIncomeRegion"
                        label={this.props.countriesStrings('wbIncomeRegionLabel')}
                        placeholder={this.props.countriesStrings('wbIncomeRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="ochaRegion"
                        label={this.props.countriesStrings('ochaRegionLabel')}
                        placeholder={this.props.countriesStrings('ochaRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="echoRegion"
                        label={this.props.countriesStrings('echoRegionLabel')}
                        placeholder={this.props.countriesStrings('echoRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="unGeoRegion"
                        label={this.props.countriesStrings('unGeoRegionLabel')}
                        placeholder={this.props.countriesStrings('unGeoRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="unGeoSubregion"
                        label={this.props.countriesStrings('unGeoSubregionLabel')}
                        placeholder={this.props.countriesStrings('unGeoSubregionPlaceholer')}
                        className={styles.textInput}
                    />
                </div>
            </Form>
        );
    }
}
