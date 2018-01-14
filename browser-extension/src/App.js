import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from './public/utils/rest';

import AddLead from './views/AddLead';

import {
    updateInputValueAction,
    setTokenAction,
    setProjectListAction,
    setCurrentTabInfoAction,
    inputValuesForTabSelector,
    currentTabIdSelector,
    tokenSelector,
    projectListSelector,
} from './common/redux';

import {
    urlForTokenRefresh,
    createParamsForTokenRefresh,
    createUrlForProjectList,
    createParamsForProjectList,
} from './common/rest';

const mapStateToProps = state => ({
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
    token: tokenSelector(state),
    projects: projectListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValue: params => dispatch(updateInputValueAction(params)),
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setToken: params => dispatch(setTokenAction(params)),
    setProjectList: params => dispatch(setProjectListAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            pendingTabInfo: true,
            pendingRefresh: true,
        };
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
            const tabId = tab.id;

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
