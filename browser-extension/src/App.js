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
    serverAddressSelector,
} from './common/redux';

import { AccentButton } from './public-components/Action';

import {
    createUrlForTokenRefresh,
    createParamsForTokenRefresh,
    createUrlForBrowserExtensionPage,
} from './common/rest';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    serverAddress: serverAddressSelector(state),
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
    serverAddress: PropTypes.string.isRequired,
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

// TODO: Move this to utils
const getWebsiteFromUrl = (url) => {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const website = `${protocol}//${host}`;
    return website;
};


const ADD_LEAD_VIEW = 'add-lead';
const SETTINGS_VIEW = 'settings-view';

@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            authenticated: false,
            errorMessage: undefined,
            currentView: ADD_LEAD_VIEW,
        };
    }

    componentWillMount() {
        chrome.runtime.onMessage.addListener(this.handleMessageReceive);

        this.getCurrentTabInfo();

        const { serverAddress } = this.props;
        if (serverAddress) {
            this.getTokenFromBackground(serverAddress);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { serverAddress: newServerAddress } = nextProps;
        const { serverAddress: oldServerAddress } = this.props;

        if (oldServerAddress !== newServerAddress) {
            this.getTokenFromBackground(newServerAddress);
        } else {
            const { token: newToken } = nextProps;
            const { token: oldToken } = this.props;

            if (newToken.refresh !== oldToken.refresh) {
                if (newToken.refresh) {
                    this.tokenRefreshRequest = this.createRequestForTokenRefresh(newToken);
                    this.tokenRefreshRequest.start();
                } else {
                    this.setState({ authenticated: false });
                }
            }
        }
    }

    componentWillUnmount() {
        if (this.tokenRefreshRequest) {
            this.tokenRefreshRequest.stop();
        }
        chrome.runtime.onMessage.removeListener(this.handleMessageReceive);
    }

    getTokenFromBackground = (serverAddress) => {
        const EXTENSION_GET_TOKEN = 'get-token';

        const serverWebsite = getWebsiteFromUrl(serverAddress);
        chrome.runtime.sendMessage({
            message: EXTENSION_GET_TOKEN,
            website: serverWebsite,
        }, this.handleGetTokenMessageResponse);
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
                this.setState({
                    pending: true,
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
                this.setState({
                    pending: false,
                    errorMessage: undefined,
                    authenticated: true,
                });
            })
            .failure((response) => {
                console.error(response);
                const { formErrors } = transformResponseErrorToFormError(response);
                this.setState({
                    pending: false,
                    errorMessage: formErrors.join(', '),
                    authenticated: false,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Oops, something went wrong',
                    authenticated: false,
                });
            })
            .build();
        return tokenRefreshRequest;
    }

    handleGetTokenMessageResponse = (response = {}) => {
        const token = response;
        const { setToken } = this.props;

        setToken({ token });

        if (token && token.refresh) {
            console.info('Got token from bg', token);
            this.tokenRefreshRequest = this.createRequestForTokenRefresh(token);
            this.tokenRefreshRequest.start();
        } else {
            this.setState({
                authenticated: false,
            });

            chrome.tabs.create({
                url: createUrlForBrowserExtensionPage(),
                active: false,
            });
        }
    }

    handleMessageReceive = (request, sender) => {
        const EXTENSION_SET_TOKEN_FG = 'set-token-fg';

        if (chrome.runtime.id === sender.id) {
            if (request.message === EXTENSION_SET_TOKEN_FG) {
                const {
                    setToken,
                    serverAddress,
                } = this.props;

                const serverWebsite = getWebsiteFromUrl(serverAddress);
                if (request.sender === serverWebsite) {
                    console.info('Got token from site', request.token);
                    setToken({ token: request.token });
                }
            }
        }
    }

    handleAddLeadSettingsButtonClick = () => {
        this.setState({
            currentView: SETTINGS_VIEW,
        });
    }

    handleSettingsButtonClick = () => {
        this.setState({
            currentView: SETTINGS_VIEW,
        });
    }

    handleSettingsBackButtonClick = () => {
        this.setState({
            currentView: ADD_LEAD_VIEW,
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
            pending,
            authenticated,
            currentView,
            errorMessage,
        } = this.state;

        const Message = this.renderMessage;

        if (currentView === SETTINGS_VIEW) {
            return (
                <Settings
                    onBackButtonClick={this.handleSettingsBackButtonClick}
                />
            );
        }

        if (errorMessage) {
            return <Message message={errorMessage} />;
        }

        if (pending) {
            return <Message message="Loading..." />;
        }

        return (
            authenticated ? (
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
