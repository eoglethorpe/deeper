import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import ListView from '../../../../src/vendor/react-store/components/View/List/ListView';
import LoadingAnimation from '../../../../src/vendor/react-store/components/View/LoadingAnimation';
import ListItem from '../../../../src/vendor/react-store/components/View/List/ListItem';
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';
import { caseInsensitiveSubmatch } from '../../../vendor/react-store/utils/common';
import ConnectorsGetRequest from '../requests/ConnectorsGetRequest';

import {
    addLeadViewConnectorsListSelector,
    projectIdFromRouteSelector,

    addLeadViewSetConnectorsAction,
} from '../../../redux';

import { iconNames } from '../../../constants';
import ConnectorContent from './Content';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    connectorsList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorsOfProject: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    connectorsList: addLeadViewConnectorsListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setConnectorsOfProject: params => dispatch(addLeadViewSetConnectorsAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorSelectModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static connectorKeySelector = c => c.id;

    constructor(props) {
        super(props);
        const { connectorsList = emptyList } = props;
        const displayConnectorsList = connectorsList;
        const selectedConnector = displayConnectorsList.length > 0 ?
            displayConnectorsList[0].id : 0;

        this.state = {
            searchInputValue: '',
            showAddConnectorModal: false,
            dataLoading: true,
            displayConnectorsList,
            selectedConnector,
        };

        this.views = this.getContentViews(connectorsList);
    }

    componentWillMount() {
        if (this.props.projectId) {
            this.startConnectorsRequest(this.props.projectId);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { connectorsList: newConnectorsList } = nextProps;
        const { connectorsList: oldConnectorsList } = this.props;
        const { searchInputValue } = this.state;

        if (newConnectorsList !== oldConnectorsList) {
            this.views = this.getContentViews(newConnectorsList);
            const displayConnectorsList = newConnectorsList.filter(
                c => caseInsensitiveSubmatch(c.title, searchInputValue),
            );
            this.setState({ displayConnectorsList });
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
    }

    getContentViews = (connectors) => {
        const views = {};
        connectors.forEach((c) => {
            const view = {
                component: () => {
                    const { selectedConnector } = this.state;
                    return (
                        <ConnectorContent
                            connectorId={selectedConnector}
                            className={styles.content}
                        />
                    );
                },
                mount: true,
                lazyMount: true,
                wrapContainer: true,
            };
            views[c.id] = view;
        });
        return views;
    }

    startConnectorsRequest = (projectId) => {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
        const requestForConnectors = new ConnectorsGetRequest({
            setState: v => this.setState(v),
            setConnectorsOfProject: this.props.setConnectorsOfProject,
        });
        this.requestForConnectors = requestForConnectors.create(projectId);
        this.requestForConnectors.start();
    }

    handleSearchInputChange = (searchInputValue) => {
        const displayConnectorsList = this.props.connectorsList.filter(
            c => caseInsensitiveSubmatch(c.title, searchInputValue),
        );

        this.setState({
            displayConnectorsList,
            searchInputValue,
        });
    };

    handleConnectorSelectModalClose = () => this.props.onModalClose();

    handleConnectorClick = (selectedConnector) => {
        this.setState({ selectedConnector });
    }

    renderConnectorListItem = (key, connector) => {
        const { selectedConnector } = this.state;
        const isActive = connector.id === selectedConnector;

        return (
            <ListItem
                active={isActive}
                key={connector.id}
                onClick={() => this.handleConnectorClick(connector.id)}
            >
                {connector.title}
            </ListItem>
        );
    }

    renderSidebar = () => {
        const {
            displayConnectorsList,
            searchInputValue,
        } = this.state;

        return (
            <div className={styles.sidebar}>
                <header className={styles.header}>
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('leads', 'searchConnectorPlaceholder')}
                        className={styles.searchInput}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                    />
                </header>
                <ListView
                    className={styles.connectorsList}
                    data={displayConnectorsList}
                    keyExtractor={ConnectorSelectModal.connectorKeySelector}
                    modifier={this.renderConnectorListItem}
                />
            </div>
        );
    }

    renderConnectorContent = () => {
        const { selectedConnector } = this.state;
        const {
            connectorsList,
        } = this.props;

        if (connectorsList.length <= 0) {
            return (
                <div className={styles.empty}>
                    { _ts('leads', 'noConnectorsLabel') }
                </div>
            );
        }

        return (
            <MultiViewContainer
                active={selectedConnector}
                views={this.views}
                containerClassName={styles.content}
            />
        );
    }

    render() {
        const { dataLoading } = this.state;

        const Sidebar = this.renderSidebar;
        const Content = this.renderConnectorContent;

        return (
            <Modal className={styles.modal} >
                <ModalHeader
                    title={_ts('leads', 'connectorsLabel')}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleConnectorSelectModalClose}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </PrimaryButton>
                    }
                />
                <ModalBody className={styles.modalBody} >
                    { dataLoading && <LoadingAnimation large /> }
                    <Sidebar />
                    <Content />
                </ModalBody>
            </Modal>
        );
    }
}
