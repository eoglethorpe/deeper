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
} from '../../../redux';

import ConnectorCreateRequest from '../requests/ConnectorCreateRequest';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    connectorStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    userGroups: [],
    onProjectAdded: undefined,
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

@connect(mapStateToProps, null)
export default class ConnectorAddForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.requestForConnectorCreate) {
            this.requestForConnectorCreate.stop();
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
        this.startConnectorCreateRequest({
            ...values,
            source: 'rss-feed',
        });
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
        } = this.state;

        const { connectorStrings } = this.props;

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
                { pending && <LoadingAnimation /> }
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
                    placeholder={connectorStrings('addConnectorModalSourcePlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {connectorStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={pending || !pristine}
                    >
                        {connectorStrings('modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
