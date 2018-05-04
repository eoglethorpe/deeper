import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import {
    connectorsListSelector,
    connectorIdFromRouteSelector,
    connectorDetailsSelector,
    connectorSourceSelector,

    setUserConnectorDetailsAction,
} from '../../../redux';
import _ts from '../../../ts';

import ConnectorDetailsGetRequest from '../requests/ConnectorDetailsGetRequest';

import DetailsForm from './Form';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    connectorId: PropTypes.number,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setUserConnectorDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    connectorDetails: {},
    connectorSource: {},
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    connectorSource: connectorSourceSelector(state),
    connectorsList: connectorsListSelector(state),
    connectorId: connectorIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = d => d;

    constructor(props) {
        super(props);

        this.state = {
            connectorDataLoading: true,
            requestFailure: false,
        };
    }

    componentDidMount() {
        if (this.props.connectorId) {
            this.startConnectorDetailsRequest(
                this.props.connectorId,
                this.props.connectorDetails,
            );
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            connectorId: nextConnectorId,
            connectorDetails: nextConnectorDetails,
        } = nextProps;

        const {
            connectorId: prevConnectorId,
        } = this.props;

        if (nextConnectorId && nextConnectorId !== prevConnectorId) {
            this.setState({ connectorDataLoading: true });
            this.startConnectorDetailsRequest(
                nextConnectorId,
                nextConnectorDetails,
            );
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
    }

    getClassName = () => {
        const { className } = this.props;
        return `
            ${className}
            ${styles.details}
        `;
    }

    startConnectorDetailsRequest = (connectorId, connectorDetails) => {
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
        const requestForConnectorDetails = new ConnectorDetailsGetRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            connectorDetails,
            isBeingCancelled: false,
        });
        this.requestForConnectorDetails = requestForConnectorDetails.create(connectorId);
        this.requestForConnectorDetails.start();
    }

    renderDetails = () => {
        const {
            requestFailure,
        } = this.state;

        const { faramValues: connectorDetails = {} } = this.props.connectorDetails;
        const { connectorId } = this.props;

        if (requestFailure) {
            return (
                <div className={styles.noConnectorFound} >
                    {_ts('connector', 'noConnectorFoundLabel')}
                </div>
            );
        }

        return (
            <Fragment>
                <header className={styles.header} >
                    <h3 className={styles.heading} >
                        {connectorDetails.title}
                    </h3>
                </header>
                <DetailsForm connectorId={connectorId} />
            </Fragment>
        );
    }


    render() {
        const { connectorDataLoading } = this.state;
        const { connectorDetails } = this.props;

        const className = this.getClassName();
        const Details = this.renderDetails;

        return (
            <div className={className}>
                <Prompt
                    when={connectorDetails.pristine === true}
                    message={_ts('common', 'youHaveUnsavedChanges')}
                />
                {
                    connectorDataLoading ? (
                        <LoadingAnimation large />
                    ) : (
                        <Details />
                    )
                }
            </div>
        );
    }
}
