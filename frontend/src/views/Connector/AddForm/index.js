import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, {
    requiredCondition,
} from '../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    connectorStringsSelector,
    notificationStringsSelector,
    connectorSourcesListSelector,

    setConnectorSourcesAction,
} from '../../../redux';

import ConnectorCreateRequest from '../requests/ConnectorCreateRequest';
import ConnectorSourcesGetRequest from '../requests/ConnectorSourcesGetRequest';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    connectorStrings: PropTypes.func.isRequired,
    setConnectorSources: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    connectorSourcesList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    userGroups: [],
    onProjectAdded: undefined,
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    connectorSourcesList: connectorSourcesListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setConnectorSources: params => dispatch(setConnectorSourcesAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorAddForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = s => s.key;
    static labelSelector = s => s.title;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
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

    componentWillMount() {
        this.startConnectorSourcesGetRequest();
    }

    componentWillUnmount() {
        if (this.requestForConnectorCreate) {
            this.requestForConnectorCreate.stop();
        }
        if (this.requestForConnectorSources) {
            this.requestForConnectorSources.stop();
        }
    }

    // FORM RELATED

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

    startConnectorSourcesGetRequest = () => {
        if (this.requestForConnectorSources) {
            this.requestForConnectorSources.stop();
        }
        const requestForConnectorSources = new ConnectorSourcesGetRequest({
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            setConnectorSources: this.props.setConnectorSources,
        });
        this.requestForConnectorSources = requestForConnectorSources.create();
        this.requestForConnectorSources.start();
    }

    startConnectorCreateRequest = (newConnector) => {
        if (this.requestForConnectorCreate) {
            this.requestForConnectorCreate.stop();
        }
        const requestForConnectorCreate = new ConnectorCreateRequest({
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            handleModalClose: this.handleModalClose,
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
            dataLoading,
        } = this.state;

        const {
            connectorStrings,
            connectorSourcesList = [],
        } = this.props;

        const loading = pending || dataLoading;

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
                    label={connectorStrings('addConnectorModalTitleLabel')}
                    placeholder={connectorStrings('addConnectorModalTitlePlaceholder')}
                    autoFocus
                />
                <SelectInput
                    faramElementName="source"
                    label={connectorStrings('addConnectorModalSourceLabel')}
                    options={connectorSourcesList}
                    keySelector={ConnectorAddForm.keySelector}
                    labelSelector={ConnectorAddForm.labelSelector}
                    placeholder={connectorStrings('addConnectorModalSourcePlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {connectorStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={loading || !pristine}
                    >
                        {connectorStrings('modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
