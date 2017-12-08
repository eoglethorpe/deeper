import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import schema from '../../../common/schema';
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

import {
    transformResponseErrorToFormError,
    createParamsForRegionPatch,
    createUrlForRegion,
} from '../../../common/rest';
import {
    regionDetailForRegionSelector,
    setRegionDetailsAction,
    tokenSelector,
} from '../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }),
    token: PropTypes.object.isRequired, // eslint-disable-line
    setRegionDetails: PropTypes.func.isRequired,
    dataLoading: PropTypes.bool,
};

const defaultProps = {
    className: '',
    regionDetail: {},
    dataLoading: false,
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailForRegionSelector(state, props),
    token: tokenSelector(state),
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
            stale: false,
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
            stale: false,
        });
    }

    createRequestForRegionDetailPatch = (regionId, data) => {
        const urlForRegion = createUrlForRegion(regionId);
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(urlForRegion)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForRegionPatch(
                    { access }, data);
            })
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
                    });
                    this.setState({ stale: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to save region detail.'],
                    pending: false,
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
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: false,
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
        // TODO: use prompt
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
            stale,
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
                { (pending || dataLoading) && <LoadingAnimation /> }
                <header styleName="header">
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            type="button"
                            onClick={this.handleFormCancel}
                            disabled={pending || !stale}
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
                    <TextInput
                        error={formFieldErrors.countryCode}
                        formname="countryCode"
                        label="Country code"
                        placeholder="NPL"
                        styleName="text-input"
                        value={formValues.countryCode}
                    />
                    <TextInput
                        error={formFieldErrors.countryName}
                        formname="countryName"
                        label="Name"
                        placeholder="Nepal"
                        styleName="text-input"
                        value={formValues.countryName}
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
