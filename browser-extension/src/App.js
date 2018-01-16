import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from './public/utils/rest';

import AddLead from './views/AddLead';
import Settings from './views/Settings';

import {
    setTokenAction,
    setCurrentTabInfoAction,
    tokenSelector,
} from './common/redux';

import {
    urlForTokenRefresh,
    createParamsForTokenRefresh,
} from './common/rest';

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setToken: params => dispatch(setTokenAction(params)),
});

const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
        refresh: PropTypes.string,
    }).isRequired,
    setCurrentTabInfo: PropTypes.func.isRequired,
    setToken: PropTypes.func.isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingTabInfo: true,
            pendingRefresh: undefined,
            authorized: false,
            currentView: 'add-lead',
        };

        this.fetchingToken = false;

        chrome.runtime.onMessage.addListener((request, sender) => {
            if (chrome.runtime.id === sender.id) {
                if (request.message === 'token') {
                    props.setToken({ token: request.token });
                }
            }
        });
    }

    componentWillMount() {
        this.getCurrentTabInfo();

        chrome.runtime.sendMessage({ message: 'token' }, (response) => {
            const { token } = response;
            const { setToken } = this.props;

            setToken({ token });

            if (token.refresh) {
                this.fetchingToken = true;
                this.tokenRefreshRequest = this.createRequestForTokenRefresh(token);
                this.tokenRefreshRequest.start();
            } else {
                this.setState({ authorized: false });
                const url = 'localhost:3000/browser-extension';
                chrome.tabs.create({
                    url,
                    active: false,
                });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const { token: newToken } = nextProps;
        const { token: oldToken } = this.props;

        if (!(this.fetchingToken || newToken.refresh === oldToken.refresh)) {
            if (newToken.refresh) {
                this.tokenRefreshRequest = this.createRequestForTokenRefresh(newToken);
                this.tokenRefreshRequest.start();
            } else {
                this.setState({ authorized: false });
            }
        }
    }

    componentWillUnmount() {
        if (this.tokenRefreshRequest) {
            this.tokenRefreshRequest.stop();
        }
    }

    getCurrentTabInfo = () => {
        const queryInfo = { active: true, currentWindow: true };
        const queryCallback = (tabs) => {
            const { setCurrentTabInfo } = this.props;

            const tab = tabs[0];
            const url = tab.url;
            const tabId = tab.url;

            setCurrentTabInfo({
                tabId,
                url,
            });

            this.setState({ pendingTabInfo: false });
        };

        chrome.tabs.query(queryInfo, queryCallback);
    }

    createRequestForTokenRefresh = (token) => {
        const tokenRefreshRequest = new FgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh(token))
            .preLoad(() => {
                this.fetchingToken = true;
                this.setState({
                    pendingRefresh: true,
                    authorized: false,
                });
            })
            .postLoad(() => {
                this.fetchingToken = false;
                this.setState({ pendingRefresh: false });
            })
            .success((response) => {
                const { setToken } = this.props;

                const params = {
                    token: {
                        ...token,
                        access: response.access,
                    },
                };

                setToken(params);
                this.setState({ authorized: true });
            })
            .build();
        return tokenRefreshRequest;
    }

    handleAddLeadSettingsButtonClick = () => {
        this.setState({
            currentView: 'settings',
        });
    }

    handleSettingsBackButtonClick = () => {
        this.setState({
            currentView: 'add-lead',
        });
    }

    render() {
        const {
            pendingTabInfo,
            pendingRefresh,
            authorized,
            currentView,
        } = this.state;

        const style = {
            height: '500px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };

        if (pendingTabInfo || pendingRefresh) {
            return (
                <div style={style}>
                    Loading...
                </div>
            );
        }

        if (currentView === 'settings') {
            return (
                <Settings
                    onBackButtonClick={this.handleSettingsBackButtonClick}
                />
            );
        }

        return (
            authorized ? (
                <AddLead
                    onSettingsButtonClick={this.handleAddLeadSettingsButtonClick}
                />
            ) : (
                <div style={style}>
                    You need to login to deep first
                </div>
            )
        );
    }
}

export default App;
