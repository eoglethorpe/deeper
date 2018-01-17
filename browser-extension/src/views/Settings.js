import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TextInput,
    // urlCondition,
} from '../public-components/Input';

import {
    TransparentAccentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    setServerAddressAction,
    serverAddressSelector,
} from '../common/redux';

import styles from '../stylesheets/settings.scss';

const mapStateToProps = state => ({
    serverAddress: serverAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setServerAddress: params => dispatch(setServerAddressAction(params)),
});

const propTypes = {
    serverAddress: PropTypes.string.isRequired,
    onBackButtonClick: PropTypes.func.isRequired,
    setServerAddress: PropTypes.func.isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Settings extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            serverAddress: props.serverAddress,
            error: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            serverAddress: nextProps.serverAddress,
            error: undefined,
        });
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    setSaveStatus = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.setState({
            saveStatus: 'Successfully saved',
        });

        this.timeout = setTimeout(this.removeSaveStatus, 5000);
    }

    removeSaveStatus = () => {
        this.setState({
            saveStatus: undefined,
        });
    }

    handleSaveButtonClick = () => {
        const { setServerAddress } = this.props;
        const { serverAddress } = this.state;

        // temporarily disabled because http://localhost:8000 is not valid url
        // if (serverAddress && urlCondition.truth(serverAddress)) {
        if (serverAddress) {
            this.setSaveStatus();
            setServerAddress({ serverAddress });
        } else {
            this.setState({
                error: 'Server address must be filled and a valid url',
            });
        }
    }

    handleServerAddressInputChange = (serverAddress) => {
        this.setState({
            serverAddress,
            error: undefined,
        });
    }

    render() {
        const { onBackButtonClick } = this.props;
        const {
            serverAddress,
            error,
            saveStatus,
        } = this.state;

        return (
            <div styleName="settings">
                <header styleName="header">
                    <h1>Settings</h1>
                    <TransparentAccentButton onClick={onBackButtonClick}>
                        Back
                    </TransparentAccentButton>
                </header>
                <div styleName="content">
                    <TextInput
                        label="Server address"
                        placeholder="eg: https://thedeep.io"
                        value={serverAddress}
                        onChange={this.handleServerAddressInputChange}
                        error={error}
                    />
                </div>
                <footer styleName="footer">
                    <div styleName="save-status">
                        { saveStatus }
                    </div>
                    <PrimaryButton
                        onClick={this.handleSaveButtonClick}
                    >
                        Save
                    </PrimaryButton>
                </footer>
            </div>
        );
    }
}
