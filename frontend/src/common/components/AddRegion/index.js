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

import { RestBuilder } from '../../../public/utils/rest';


import { pathNames } from '../../../common/constants';
import { reverseRoute } from '../../../public/utils/common';

import {
    createParamsForRegionCreate,
    urlForRegionCreate,
} from '../../rest';
import {
    tokenSelector,

    addNewRegionAction,
} from '../../redux';

import schema from '../../schema';
import styles from './styles.scss';

const propTypes = {
    addNewRegion: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    projectId: undefined,
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
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
            stale: false,

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

        const regionCreateRequest = new RestBuilder()
            .url(urlForRegionCreate)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForRegionCreate(
                    { access },
                    paramsBody);
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .preLoad(() => {
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
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);

                const { errors } = response;
                const formFieldErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formFieldErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({
                    formFieldErrors,
                    formErrors: nonFieldErrors,
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
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
            stale: true,
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
            stale,
        } = this.state;

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
                styleName="add-region-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Region Title"
                    formname="title"
                    placeholder="Nepal"
                    value={formValues.title}
                    error={formFieldErrors.name}
                />
                <TextInput
                    label="Code"
                    formname="code"
                    placeholder="NPL"
                    value={formValues.code}
                    error={formFieldErrors.code}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Add Region
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
