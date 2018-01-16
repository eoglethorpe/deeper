import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from './public/utils/rest';

import AddLead from './views/AddLead';

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
            pendingRefresh: true,
        };

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
        const { token } = this.props;

        if (token.refresh) {
            this.tokenRefreshRequest = this.createRequestForTokenRefresh(token);
            this.tokenRefreshRequest.start();
        } else {
            const url = 'localhost:3000/browser-extension';
            chrome.tabs.create({
                url,
                active: false,
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const { token: newToken } = nextProps;
        const { token: oldToken } = this.props;

        if (newToken.refresh !== oldToken.refresh) {
            this.tokenRefreshRequest = this.createRequestForTokenRefresh(newToken);
            this.tokenRefreshRequest.start();
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
            .success((response) => {
                const { setToken } = this.props;

                const params = {
                    token: { access: response.access },
                };

                setToken(params);
                this.setState({ pendingRefresh: false });
            })
            .build();
        return tokenRefreshRequest;
    }

    render() {
        const {
            pendingTabInfo,
            pendingRefresh,
        } = this.state;

        if (pendingTabInfo || pendingRefresh) {
            return (
                <div>Loading...</div>
            );
        }
        return (
            <AddLead />
        );
    }
}

export default App;
