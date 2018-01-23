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

import { AccentButton } from './public-components/Action';

import {
    createUrlForTokenRefresh,
    createParamsForTokenRefresh,
    createUrlForBrowserExtensionPage,
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

// TODO: Move this to utils
export const transformResponseErrorToFormError = (errors) => {
    const { nonFieldErrors: formErrors = [], ...formFieldErrorList } = errors;

    const formFieldErrors = Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {},
    );
    return { formFieldErrors, formErrors };
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
            error: undefined,
            authorized: false,
            currentView: 'add-lead',
        };

        this.fetchingToken = false;

        chrome.runtime.onMessage.addListener(this.handleMessageReceive);
    }

    componentWillMount() {
        this.getCurrentTabInfo();
        chrome.runtime.sendMessage({ message: 'token' }, this.handleGetTokenMessageResponse);
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
        chrome.runtime.onMessage.removeListener(this.handleMessageReceive);
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
            .url(createUrlForTokenRefresh())
            .params(() => createParamsForTokenRefresh(token))
            .preLoad(() => {
                this.fetchingToken = true;
                this.setState({
                    pendingRefresh: true,
                    authorized: false,
                });
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
                this.fetchingToken = false;
                this.setState({
                    error: undefined,
                    pendingRefresh: false,
                    authorized: true,
                });
            })
            .failure((response) => {
                console.log(response);
                const { formErrors } = transformResponseErrorToFormError(response);
                this.fetchingToken = false;
                this.setState({
                    authorized: false,
                    pendingRefresh: false,
                    error: formErrors.join(', '),
                });
                this.fetchingToken = false;
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    authorized: false,
                    error: 'Oops, something went wrong',
                    pendingRefresh: false,
                });
                this.fetchingToken = false;
            })
            .build();
        return tokenRefreshRequest;
    }

    handleGetTokenMessageResponse = (response) => {
        const { token } = response;
        const { setToken } = this.props;

        // console.warn('FG: Received token', response);
        setToken({ token });

        // console.warn(response);
        if (token && token.refresh) {
            this.fetchingToken = true;
            this.tokenRefreshRequest = this.createRequestForTokenRefresh(token);
            this.tokenRefreshRequest.start();
        } else {
            this.setState({ authorized: false });
            chrome.tabs.create({
                url: createUrlForBrowserExtensionPage(),
                active: false,
            });
        }
    }

    handleMessageReceive = (request, sender) => {
        if (chrome.runtime.id === sender.id) {
            if (request.message === 'token') {
                const { setToken } = this.props;
                setToken({ token: request.token });
            }
        }
    }

    handleAddLeadSettingsButtonClick = () => {
        this.setState({
            currentView: 'settings',
        });
    }

    handleSettingsButtonClick = () => {
        this.setState({
            currentView: 'settings',
        });
    }

    handleSettingsBackButtonClick = () => {
        this.setState({
            currentView: 'add-lead',
        });
    }

    renderMessage = (p) => {
        const style = {
            height: '560px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        };

        return (
            <div style={style}>
                <p>{p.message}</p>
                <AccentButton
                    transparent
                    onClick={this.handleSettingsButtonClick}
                >
                    Settings
                </AccentButton>
            </div>
        );
    }

    render() {
        const {
            pendingTabInfo,
            pendingRefresh,
            authorized,
            currentView,
            error,
        } = this.state;

        const Message = this.renderMessage;

        if (currentView === 'settings') {
            return (
                <Settings
                    onBackButtonClick={this.handleSettingsBackButtonClick}
                />
            );
        }

        if (error) {
            return <Message message={error} />;
        }

        if (pendingTabInfo || pendingRefresh) {
            return <Message message="Loading..." />;
        }

        return (
            authorized ? (
                <AddLead
                    onSettingsButtonClick={this.handleAddLeadSettingsButtonClick}
                />
            ) : (
                <Message message="You need to login to deep first" />
            )
        );
    }
}

export default App;
