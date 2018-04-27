import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, {
    requiredCondition,
    urlCondition,
} from '../../../../vendor/react-store/components/Input/Faram';
import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import List from '../../../../vendor/react-store/components/View/List';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';

import ConnectorPatchRequest from '../../requests/ConnectorPatchRequest';

import {
    connectorDetailsSelector,
    connectorStringsSelector,
    connectorSourceSelector,
    notificationStringsSelector,

    changeUserConnectorDetailsAction,
    setErrorUserConnectorDetailsAction,
    setUserConnectorDetailsAction,
} from '../../../../redux';

import styles from './styles.scss';

const propTypes = {
    connectorId: PropTypes.number,
    connectorStrings: PropTypes.func.isRequired,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    changeUserConnectorDetails: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    setErrorUserConnectorDetails: PropTypes.func.isRequired,
    setUserConnectorDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    connectorDetails: {},
    connectorSource: {},
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    connectorStrings: connectorStringsSelector(state),
    connectorSource: connectorSourceSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    changeUserConnectorDetails: params => dispatch(changeUserConnectorDetailsAction(params)),
    setErrorUserConnectorDetails: params => dispatch(setErrorUserConnectorDetailsAction(params)),
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorDetailsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = s => s.key;
    static labelSelector = s => s.title;

    constructor(props) {
        super(props);

        this.state = {
            dataLoading: false,
            pending: false,
            schema: this.createSchema(props),
        };
    }

    componentWillReceiveProps(nextProps) {
        const { connectorSource: newConnectorSource } = nextProps;
        if (this.props.connectorSource !== newConnectorSource) {
            this.setState({
                schema: this.createSchema(newConnectorSource),
            });
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
    }

    createSchema = (props) => {
        const { connectorSource = {} } = props;
        const schema = {
            fields: {
                title: [requiredCondition],
                params: {},
            },
        };
        if ((connectorSource.options || emptyList).length === 0) {
            return schema;
        }
        const paramFields = {};
        connectorSource.options.forEach((o) => {
            const validation = [requiredCondition];
            if (o.fieldType === 'url') {
                validation.push(urlCondition);
            }
            paramFields[o.key] = validation;
        });
        schema.fields.params.fields = paramFields;
        return schema;
    }

    startConnectorPatchRequest = (connectorId, connectorDetails) => {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        const requestForConnectorPatch = new ConnectorPatchRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            notificationStrings: this.props.notificationStrings,
            connectorStrings: this.props.connectorStrings,
            connectorId: this.props.connectorId,
            setConnectorError: this.props.setErrorUserConnectorDetails,
        });

        this.requestForConnectorPatch = requestForConnectorPatch.create(
            connectorId,
            connectorDetails,
        );

        this.requestForConnectorPatch.start();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.props.changeUserConnectorDetails({
            faramValues,
            faramErrors,
            connectorId: this.props.connectorId,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.props.setErrorUserConnectorDetails({
            faramErrors,
            connectorId: this.props.connectorId,
        });
    };

    handleValidationSuccess = (connectorDetails) => {
        this.startConnectorPatchRequest(this.props.connectorId, connectorDetails);
    };

    renderParamInput = (key, data) => {
        if (data.fieldType === 'string' || data.fieldType === 'url') {
            return (
                <TextInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        }
        return null;
    }

    render() {
        const {
            schema,
            dataLoading,
            pending,
        } = this.state;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.props.connectorDetails;

        const {
            connectorSource,
            connectorStrings,
        } = this.props;

        const loading = dataLoading || pending;

        return (
            <Faram
                className={styles.connectorDetailsForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="title"
                    label={connectorStrings('connectorTitleLabel')}
                    placeholder="Relief Web"
                    autoFocus
                />
                <FaramGroup faramElementName="params">
                    <List
                        data={connectorSource.options}
                        modifier={this.renderParamInput}
                    />
                </FaramGroup>
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {connectorStrings('connectorDetailCancelLabel')}
                    </DangerButton>
                    <SuccessButton
                        type="submit"
                        disabled={loading || !pristine}
                    >
                        {connectorStrings('connectorDetailSaveLabel')}
                    </SuccessButton>
                </div>
            </Faram>
        );
    }
}
