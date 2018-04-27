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

import {
    connectorDetailsSelector,
    connectorStringsSelector,
    connectorSourceSelector,

    changeUserConnectorDetailsAction,
    setErrorUserConnectorDetailsAction,
} from '../../../../redux';

import styles from './styles.scss';

const propTypes = {
    connectorId: PropTypes.number,
    connectorStrings: PropTypes.func.isRequired,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    changeUserConnectorDetails: PropTypes.func.isRequired,
    setErrorUserConnectorDetails: PropTypes.func.isRequired,
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
});

const mapDispatchToProps = dispatch => ({
    changeUserConnectorDetails: params => dispatch(changeUserConnectorDetailsAction(params)),
    setErrorUserConnectorDetails: params => dispatch(setErrorUserConnectorDetailsAction(params)),
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
            paramFields[o.title] = validation;
        });
        schema.fields.params.fields = paramFields;
        return schema;
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

    handleValidationSuccess = (values) => {
        console.warn(values);
    };

    renderParamInput = (key, data) => {
        if (data.fieldType === 'string' || data.fieldType === 'url') {
            return (
                <TextInput
                    key={data.key}
                    faramElementName={data.title}
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

        const loading = dataLoading;

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
