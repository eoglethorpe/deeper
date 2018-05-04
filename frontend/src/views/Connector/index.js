import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Modal from '../../vendor/react-store/components/View/Modal';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import BoundError from '../../vendor/react-store/components/General/BoundError';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ListView from '../../../src/vendor/react-store/components/View/List/ListView';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../vendor/react-store/utils/common';

import AppError from '../../components/AppError';
import {
    connectorsListSelector,
    connectorIdFromRouteSelector,

    setConnectorSourcesAction,
    setUserConnectorsAction,
} from '../../redux';
import {
    iconNames,
    pathNames,
} from '../../constants';
import _ts from '../../ts';

import ConnectorsGetRequest from './requests/ConnectorsGetRequest';
import ConnectorSourcesGetRequest from './requests/ConnectorSourcesGetRequest';
import AddConnectorForm from './AddForm';
import ConnectorDetails from './Details';

import styles from './styles.scss';

const propTypes = {
    connectorId: PropTypes.number,
    setUserConnectors: PropTypes.func.isRequired,
    setConnectorSources: PropTypes.func.isRequired,
    connectorsList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorsList: connectorsListSelector(state),
    connectorId: connectorIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserConnectors: params => dispatch(setUserConnectorsAction(params)),
    setConnectorSources: params => dispatch(setConnectorSourcesAction(params)),
});

const emptyObject = {};
const emptyList = [];

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Connector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static connectorKeySelector = c => c.id;

    constructor(props) {
        super(props);
        this.state = {
            searchInputValue: '',
            displayConnectorsList: props.connectorsList || emptyList,
            showAddConnectorModal: false,
        };
    }

    componentWillMount() {
        this.startConnectorsRequest();
        this.startConnectorSourcesGetRequest();
    }

    componentWillReceiveProps(nextProps) {
        const { connectorsList } = nextProps;
        const { searchInputValue } = this.state;

        if (this.props.connectorsList !== connectorsList) {
            const displayConnectorsList = connectorsList.filter(
                c => caseInsensitiveSubmatch(
                    (c.faramValues || emptyObject).title,
                    searchInputValue,
                ),
            );
            this.setState({ displayConnectorsList });
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
        if (this.requestForConnectorSources) {
            this.requestForConnectorSources.stop();
        }
    }

    getStyleName = (connectorId) => {
        const { connectorId: connectorIdFromUrl } = this.props;

        const styleNames = [];
        styleNames.push(styles.listItem);
        if (connectorId === connectorIdFromUrl) {
            styleNames.push(styles.active);
        }
        return styleNames.join(' ');
    }

    startConnectorsRequest = () => {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
        const requestForConnectors = new ConnectorsGetRequest({
            setState: v => this.setState(v),
            setUserConnectors: this.props.setUserConnectors,
        });
        this.requestForConnectors = requestForConnectors.create();
        this.requestForConnectors.start();
    }

    startConnectorSourcesGetRequest = () => {
        if (this.requestForConnectorSources) {
            this.requestForConnectorSources.stop();
        }
        const requestForConnectorSources = new ConnectorSourcesGetRequest({
            setState: v => this.setState(v),
            setConnectorSources: this.props.setConnectorSources,
        });
        this.requestForConnectorSources = requestForConnectorSources.create();
        this.requestForConnectorSources.start();
    }

    handleSearchInputChange = (searchInputValue) => {
        const displayConnectorsList = this.props.connectorsList.filter(
            c => caseInsensitiveSubmatch(
                (c.faramValues || emptyObject).title,
                searchInputValue,
            ),
        );

        this.setState({
            displayConnectorsList,
            searchInputValue,
        });
    };

    handleAddConnectorClick = () => {
        this.setState({ showAddConnectorModal: true });
    }

    handleAddConnectorModalClose = () => {
        this.setState({ showAddConnectorModal: false });
    }

    renderConnectorListItem = (key, data = {}) => (
        <div
            key={key}
            className={this.getStyleName(data.id)}
        >
            <Link
                to={reverseRoute(pathNames.connectors, { connectorId: data.id })}
                className={styles.link}
            >
                {data.title}
            </Link>
        </div>
    )

    renderHeader = () => {
        const { searchInputValue } = this.state;

        const AddModal = this.renderAddModal;

        return (
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {_ts('connector', 'headerConnectors')}
                </h3>
                <PrimaryButton
                    onClick={this.handleAddConnectorClick}
                    iconName={iconNames.add}
                >
                    {_ts('connector', 'addConnectorButtonLabel')}
                </PrimaryButton>
                <SearchInput
                    onChange={this.handleSearchInputChange}
                    placeholder={_ts('connector', 'searchConnectorPlaceholder')}
                    className={styles.searchInput}
                    value={searchInputValue}
                    showLabel={false}
                    showHintAndError={false}
                />
                <AddModal />
            </header>
        );
    }

    renderAddModal = () => {
        const { showAddConnectorModal } = this.state;

        if (!showAddConnectorModal) {
            return null;
        }

        return (
            <Modal>
                <ModalHeader
                    title={_ts('connector', 'addConnectorModalTitle')}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleAddConnectorModalClose}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </PrimaryButton>
                    }
                />
                <ModalBody>
                    <AddConnectorForm
                        onModalClose={this.handleAddConnectorModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    renderDetails = () => {
        const {
            connectorId,
        } = this.props;

        const { displayConnectorsList } = this.state;

        if (displayConnectorsList.length === 0) {
            return (
                <p className={styles.noConnector}>
                    {_ts('connector', 'noConnectorsLabel')}
                </p>
            );
        }

        if (!connectorId) {
            return (
                <p className={styles.noConnector}>
                    {_ts('connector', 'noConnectorSelectedTitle')}
                </p>
            );
        }
        return (
            <ConnectorDetails
                className={styles.connectorDetails}
                connectorId={connectorId}
            />
        );
    }

    render() {
        const { displayConnectorsList } = this.state;

        const Header = this.renderHeader;
        const Details = this.renderDetails;

        return (
            <div className={styles.connectors}>
                <div className={styles.sidebar}>
                    <Header />
                    <ListView
                        className={styles.connectorsList}
                        data={displayConnectorsList}
                        keyExtractor={Connector.connectorKeySelector}
                        modifier={this.renderConnectorListItem}
                    />
                </div>
                <Details />
            </div>
        );
    }
}
