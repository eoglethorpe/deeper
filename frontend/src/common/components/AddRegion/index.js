import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

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
    DangerButton,
    PrimaryButton,
} from '../../../public/components/Action';

import { FgRestBuilder } from '../../../public/utils/rest';

import { pathNames } from '../../../common/constants';
import { reverseRoute } from '../../../public/utils/common';

import {
    transformResponseErrorToFormError,
    createParamsForRegionCreate,
    urlForRegionCreate,
} from '../../rest';
import {
    addNewRegionAction,
    countriesStringsSelector,
    notificationStringsSelector,
    projectStringsSelector,
} from '../../redux';
import notify from '../../notify';
import schema from '../../schema';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewRegion: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    onRegionAdd: PropTypes.func,
    countriesStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionAdd: undefined,
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddRegion extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,

            redirectTo: undefined,
        };

        this.elements = [
            'title',
            'code',
        ];
        this.validations = {
            name: [requiredCondition],
            code: [requiredCondition],
        };
    }

    componentWillUnmount() {
        if (this.regionCreateRequest) {
            this.regionCreateRequest.stop();
        }
    }

    createRequestForRegionCreate = ({ title, code }) => {
        const { projectId } = this.props;

        let paramsBody = {
            title,
            code,
            public: true,
        };

        if (projectId) {
            paramsBody = {
                title,
                code,
                public: false,
                project: projectId,
            };
        }

        const regionCreateRequest = new FgRestBuilder()
            .url(urlForRegionCreate)
            .params(() => createParamsForRegionCreate(paramsBody))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'regionCreateResponse');
                    if (projectId) {
                        this.props.addNewRegion({
                            regionDetail: response,
                            projectId,
                        });
                        this.props.onModalClose();
                        if (this.props.onRegionAdd) {
                            this.props.onRegionAdd(response.id);
                        }
                    } else {
                        this.props.addNewRegion({
                            regionDetail: response,
                        });
                        this.props.onModalClose();
                        this.setState({
                            redirectTo: reverseRoute(
                                pathNames.countries, { countryId: response.id },
                            ),
                        });
                    }
                    notify.send({
                        title: this.props.notificationStrings('countryCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('countryCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('countryCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryCreateFailure'),
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
                    title: this.props.notificationStrings('countryCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save region.'],
                });
            })
            .build();
        return regionCreateRequest;
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
        });
    };

    successCallback = (data) => {
        // Stop old post request
        if (this.regionCreateRequest) {
            this.regionCreateRequest.stop();
        }

        // Create new post request
        this.regionCreateRequest = this.createRequestForRegionCreate(data);
        this.regionCreateRequest.start();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            pristine,
        } = this.state;

        const {
            className,
        } = this.props;

        if (this.state.redirectTo) {
            return (
                <Redirect
                    to={this.state.redirectTo}
                    push
                />
            );
        }

        return (
            <Form
                className={className}
                styleName="add-region-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
                value={formValues}
                error={formFieldErrors}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={this.props.projectStrings('addRegionTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addRegionTitlePlaceholder')}
                    autoFocus
                />
                <TextInput
                    label={this.props.projectStrings('addRegionCodeLabel')}
                    formname="code"
                    placeholder={this.props.projectStrings('addRegionCodePlaceholder')}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        {this.props.countriesStrings('cancelButtonLabel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {this.props.countriesStrings('addRegionButtonLabel')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
