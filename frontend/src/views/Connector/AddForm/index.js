import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Faram, {
    requiredCondition,
} from '../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';

import _ts from '../../../ts';
import {
    connectorSourcesListSelector,
    addUserConnectorAction,
} from '../../../redux';

import ConnectorCreateRequest from '../requests/ConnectorCreateRequest';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    addUserConnector: PropTypes.func.isRequired,
    connectorSourcesList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
    connectorSourcesList: connectorSourcesListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addUserConnector: params => dispatch(addUserConnectorAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorAddForm extends React.PureComponent {
    static propTypes = propTypes;
    static keySelector = s => s.key;
    static labelSelector = s => s.title;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            success: false,
            dataLoading: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                source: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.requestForConnectorCreate) {
            this.requestForConnectorCreate.stop();
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    startConnectorCreateRequest = (newConnector) => {
        if (this.requestForConnectorCreate) {
            this.requestForConnectorCreate.stop();
        }
        const requestForConnectorCreate = new ConnectorCreateRequest({
            setState: v => this.setState(v),
            handleModalClose: this.handleModalClose,
            addUserConnector: this.props.addUserConnector,
        });
        this.requestForConnectorCreate = requestForConnectorCreate.create(newConnector);
        this.requestForConnectorCreate.start();
    }

    handleValidationSuccess = (values) => {
        this.startConnectorCreateRequest(values);
    };

    // BUTTONS
    handleModalClose = () => {
        this.props.onModalClose();
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
            redirectTo,
            dataLoading,
        } = this.state;

        const {
            connectorSourcesList = [],
        } = this.props;

        const loading = pending || dataLoading;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        return (
            <Faram
                className={styles.connectorAddForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { loading && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="title"
                    label={_ts('connector', 'addConnectorModalTitleLabel')}
                    placeholder={_ts('connector', 'addConnectorModalTitlePlaceholder')}
                    autoFocus
                />
                <SelectInput
                    faramElementName="source"
                    label={_ts('connector', 'addConnectorModalSourceLabel')}
                    options={connectorSourcesList}
                    keySelector={ConnectorAddForm.keySelector}
                    labelSelector={ConnectorAddForm.labelSelector}
                    placeholder={_ts('connector', 'addConnectorModalSourcePlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {_ts('connector', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={loading || !pristine}
                    >
                        {_ts('connector', 'modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
