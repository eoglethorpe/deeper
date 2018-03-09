import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import { commonStringsSelector } from '../../redux';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    clientId: PropTypes.string.isRequired,
    developerKey: PropTypes.string.isRequired,
    scope: PropTypes.string,
    viewId: PropTypes.string,
    origin: PropTypes.string,
    onChange: PropTypes.func,
    onAuthenticate: PropTypes.func,
    createPicker: PropTypes.func,
    multiselect: PropTypes.bool,
    navHidden: PropTypes.bool,
    disabled: PropTypes.bool,
    mimeTypes: PropTypes.arrayOf(PropTypes.string),
    // Callback when api is loaded successfully and ready to use
    onApiLoad: PropTypes.func,
    // Api load delay and limit
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    children: undefined,
    onChange: () => {},
    onAuthenticate: () => {},
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    viewId: 'DOCS',
    multiselect: false,
    navHidden: false,
    disabled: false,
    createPicker: undefined,
    mimeTypes: undefined,
    origin: window.location.origin,
    onApiLoad: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class GooglePicker extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isGoogleReady = () => (!!window.gapi)
    static isGoogleAuthReady = () => !!(window.gapi && window.gapi.auth2)
    static isGooglePickerReady = () => !!(window.google && window.google.picker)
    static isReady = () => (
        GooglePicker.isGoogleReady() &&
        GooglePicker.isGoogleAuthReady() && GooglePicker.isGooglePickerReady()
    )

    constructor(props) {
        super(props);

        this.state = {
            authApiReady: false,
            pickerApiReady: false,
        };
    }

    componentWillMount() {
        this.pollForReadyState();
    }

    componentWillUnmount() {
        clearTimeout(this.readyCheck);
    }

    onAuthApiLoad = () => {
        this.setState({ authApiReady: true });
    }

    onPickerApiLoad = () => {
        this.setState({ pickerApiReady: true });
    }

    onApiLoad = () => {
        // only call when api is loaded,
        if (this.props.onApiLoad) {
            this.props.onApiLoad();
        }
        window.gapi.load('auth2', this.onAuthApiLoad);
        window.gapi.load('picker', this.onPickerApiLoad);
    }

    onChoose = () => {
        if (!GooglePicker.isReady() || this.props.disabled) {
            console.warn('GooglePicker api is not loaded');
            return;
        }
        this.doAuth(({ access_token: accessToken, error }) => {
            if (accessToken) {
                this.createPicker(accessToken);
            } else {
                console.warn('Google Auth Response:', error);
                this.props.onAuthenticate(undefined);
            }
        },
        );
    }

    pollForReadyState = () => {
        if (GooglePicker.isGoogleReady()) {
            this.onApiLoad();
        } else {
            this.readyCheck = setTimeout(this.pollForReadyState, 3000);
        }
    };

    doAuth(callback) {
        window.gapi.auth2.authorize({
            client_id: this.props.clientId,
            scope: this.props.scope,
        }, callback);
    }

    createPicker(oauthToken) {
        this.props.onAuthenticate(oauthToken);
        if (this.props.createPicker) {
            return this.props.createPicker(window.google, oauthToken);
        }

        const googleViewId = window.google.picker.ViewId[this.props.viewId];
        const view = new window.google.picker.View(googleViewId);

        if (this.props.mimeTypes) {
            view.setMimeTypes(this.props.mimeTypes.join(','));
        }

        if (!view) {
            console.warn('Can\'t find view by viewId');
            return undefined;
        }

        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(this.props.developerKey)
            .setCallback(this.props.onChange);

        if (this.props.origin) {
            picker.setOrigin(this.props.origin);
        }
        if (this.props.navHidden) {
            picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN);
        }
        if (this.props.multiselect) {
            picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        }

        picker.build()
            .setVisible(true);
        return picker;
    }

    render() {
        const {
            className,
            disabled,
            children,
        } = this.props;

        const {
            authApiReady,
            pickerApiReady,
        } = this.state;

        const ready = authApiReady && pickerApiReady;

        return (
            <PrimaryButton
                className={className}
                onClick={this.onChoose}
                disabled={disabled || !ready}
                transparent
            >
                {
                    children || this.props.commonStrings('openGoogleChooserText')
                }
            </PrimaryButton>
        );
    }
}
