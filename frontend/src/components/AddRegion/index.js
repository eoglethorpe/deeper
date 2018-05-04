import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import Faram, { requiredCondition } from '../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';

import { pathNames } from '../../constants';

import {
    alterResponseErrorToFaramError,
    createParamsForRegionCreate,
    urlForRegionCreate,
} from '../../rest';
import {
    addNewRegionAction,
} from '../../redux';
import notify from '../../notify';
import schema from '../../schema';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewRegion: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    onRegionAdd: PropTypes.func,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionAdd: undefined,
};

const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddRegion extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,

            redirectTo: undefined,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                code: [requiredCondition],
            },
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
                        title: _ts('notification', 'countryCreate'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'countryCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: _ts('notification', 'countryCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'countryCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'countryCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'countryCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    faramErrors: { $internal: ['Error while trying to save region.'] },
                });
            })
            .build();
        return regionCreateRequest;
    }

    // FORM RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (data) => {
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
            faramErrors,
            faramValues,
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
            <Faram
                className={`${className} ${styles.addRegionForm}`}

                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}

                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('project', 'addRegionTitleLabel')}
                    faramElementName="title"
                    placeholder={_ts('project', 'addRegionTitlePlaceholder')}
                    autoFocus
                />
                <TextInput
                    label={_ts('project', 'addRegionCodeLabel')}
                    faramElementName="code"
                    placeholder={_ts('project', 'addRegionCodePlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('countries', 'cancelButtonLabel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={pending || !pristine}
                    >
                        {_ts('countries', 'addRegionButtonLabel')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
