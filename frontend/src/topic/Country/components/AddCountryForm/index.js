import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import browserHistory from '../../../../common/browserHistory';
import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import {
    createParamsForRegionCreate,
    urlForRegionCreate,
} from '../../../../common/rest';
import {
    tokenSelector,

    addNewCountryAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    token: PropTypes.object.isRequired, // eslint-disable-line
    addNewCountry: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewCountry: params => dispatch(addNewCountryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddCountry extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
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
        const regionCreateRequest = new RestBuilder()
            .url(urlForRegionCreate)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForRegionCreate(
                    { access },
                    { title, code, public: true });
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
                    this.props.addNewCountry({
                        countryDetail: {
                            code: response.code,
                            id: response.id,
                            title: response.title,
                        },
                    });
                    this.props.onModalClose();
                    browserHistory.push(`/countrypanel/${response.id}`);
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
        console.log(data);
        // Stop old post request
        if (this.regionCreateRequest) {
            this.regionCreateRequest.stop();
        }

        // Create new post request
        this.regionCreateRequest = this.createRequestForRegionCreate(data);
        this.regionCreateRequest.start();
        this.props.onModalClose();
    };

    render() {
        const {
            formErrors = [],
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
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                {
                    pending &&
                        <div>
                            <i
                                className="ion-load-c"
                            />
                        </div>
                }
                <div>
                    {
                        formErrors.map(err => (
                            <div
                                key={err}
                            >
                                {err}
                            </div>
                        ))
                    }
                    { formErrors.length <= 0 &&
                        <div>
                            -
                        </div>
                    }
                </div>
                <TextInput
                    label="Country Title"
                    formname="title"
                    placeholder="Nepal"
                    value={formValues.name}
                    error={formFieldErrors.name}
                />
                <TextInput
                    label="Code"
                    formname="code"
                    placeholder="NPL"
                    value={formValues.code}
                    error={formFieldErrors.code}
                />
                <div>
                    <DangerButton
                        onClick={this.props.onModalClose}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save changes
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
