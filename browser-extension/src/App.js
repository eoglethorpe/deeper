import React from 'react';
import { connect } from 'react-redux';

import AddLead from './views/AddLead';

import {
    updateInputValueAction,
    setCurrentTabInfoAction,
    inputValuesForTabSelector,
    currentTabIdSelector,
} from './common/redux';

const mapStateToProps = state => ({
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValue: params => dispatch(updateInputValueAction(params)),
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            pending: true,
        };

        this.getCurrentTabInfo();
    }

    getCurrentTabInfo = () => {
        const queryInfo = { active: true, currentWindow: true };
        chrome.tabs.query(queryInfo, (tabs) => {
            const {
                setCurrentTabInfo,
            } = this.props;

            const tab = tabs[0];
            const url = tab.url;
            const tabId = tab.id;

            setCurrentTabInfo({
                tabId,
                url,
            });

            this.setState({
                pending: false,
            });
        });
    }

    handleInputValueChange = (id, value) => {
        const {
            currentTabId,
            updateInputValue,
        } = this.props;

        updateInputValue({
            tabId: currentTabId,
            id,
            value,
        });
    }

    render() {
        const {
            pending,
        } = this.state;

        if (pending) {
            return (
                <div>Loading...</div>
            );
        }

        const {
            inputValues,
        } = this.props;

        return (
            <AddLead
                inputValues={inputValues}
                onChange={this.handleInputValueChange}
            />
        );
    }
}

export default App;
