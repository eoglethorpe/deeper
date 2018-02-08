import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TextInput,
    Form,
    requiredCondition,
    urlCondition,
} from '../public-components/Input';

import {
    AccentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    setSettingsAction,
    serverAddressSelector,
    apiAddressSelector,
} from '../common/redux';

import { DEV } from '../common/config/rest';

import styles from '../stylesheets/settings.scss';

const mapStateToProps = state => ({
    serverAddress: serverAddressSelector(state),
    apiAddress: apiAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSettings: params => dispatch(setSettingsAction(params)),
});

const propTypes = {
    serverAddress: PropTypes.string.isRequired,
    apiAddress: PropTypes.string.isRequired,
    onBackButtonClick: PropTypes.func.isRequired,
    setSettings: PropTypes.func.isRequired,
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
            inputValues: {
                serverAddress: props.serverAddress,
                apiAddress: props.apiAddress,
            },
            formFieldErrors: {},
        };

        this.formElements = [
            'serverAddress',
            'apiAddress',
        ];

        this.validations = {
            serverAddress: DEV ? [requiredCondition] : [requiredCondition, urlCondition],
            apiAddress: DEV ? [requiredCondition] : [requiredCondition, urlCondition],
        };
        this.validations = {
            serverAddress: [requiredCondition],
            apiAddress: [requiredCondition],
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            inputValues: {
                serverAddress: nextProps.serverAddress,
                apiAddress: nextProps.apiAddress,
            },
            formFieldErrors: {},
        });
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    // STATUS

    removeSaveStatus = () => {
        this.setState({ saveStatus: undefined });
    }

    showSaveStatus = () => {
        this.setState({ saveStatus: 'Successfully saved' });

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.removeSaveStatus, 5000);
    }

    // FORM

    handleFormChange = (value, { formFieldErrors }) => {
        this.setState({
            formFieldErrors: {
                ...this.state.formFieldErrors,
                ...formFieldErrors,
            },
            inputValues: {
                ...this.state.inputValues,
                ...value,
            },
        });
    }

    handleFormFailure = ({ formFieldErrors }) => {
        this.setState({
            formFieldErrors: {
                ...this.state.formFieldErrors,
                ...formFieldErrors,
            },
        });
    }

    handleFormSuccess = (values) => {
        const { setSettings } = this.props;
        setSettings(values);
        this.showSaveStatus();
    }

    render() {
        const { onBackButtonClick } = this.props;
        const {
            inputValues,
            formFieldErrors,
            saveStatus,
        } = this.state;

        return (
            <div styleName="settings">
                <Form
                    successCallback={this.handleFormSuccess}
                    failureCallback={this.handleFormFailure}
                    changeCallback={this.handleFormChange}
                    elements={this.formElements}
                    validations={this.validations}
                >
                    <header styleName="header">
                        <h1>
                            Settings
                        </h1>
                        <AccentButton
                            transparent
                            onClick={onBackButtonClick}
                        >
                            Back
                        </AccentButton>
                    </header>
                    <div styleName="content">
                        <TextInput
                            formname="serverAddress"
                            label="Server address"
                            placeholder="eg: https://thedeep.io"
                            value={inputValues.serverAddress}
                            error={formFieldErrors.serverAddress}
                        />
                        <TextInput
                            formname="apiAddress"
                            label="Api address"
                            placeholder="eg: https://api.thedeep.io"
                            value={inputValues.apiAddress}
                            error={formFieldErrors.apiAddress}
                        />
                    </div>
                    <footer styleName="footer">
                        <div styleName="save-status">
                            { saveStatus }
                        </div>
                        <PrimaryButton>
                            Save
                        </PrimaryButton>
                    </footer>
                </Form>
            </div>
        );
    }
}
