import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import loadScript from 'load-script';
import { connect } from 'react-redux';

import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import { commonStringsSelector } from '../../redux';
import { GOOGLE_SDK_URL } from '../../config/google-drive';

import styles from './styles.scss';

let scriptLoadingStarted = false;

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    clientId: PropTypes.string.isRequired,
    developerKey: PropTypes.string.isRequired,
    scope: PropTypes.arrayOf(PropTypes.string),
    viewId: PropTypes.string,
    authImmediate: PropTypes.bool,
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
    retryDelay: PropTypes.number, // in miliseconds
    retryLimit: PropTypes.number,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: 'google-picker-btn',
    children: undefined,
    onChange: () => {},
    onAuthenticate: () => {},
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    viewId: 'DOCS',
    authImmediate: false,
    multiselect: false,
    navHidden: false,
    disabled: false,
    createPicker: undefined,
    mimeTypes: undefined,
    origin: undefined,
    onApiLoad: undefined,
    retryDelay: 3000,
    retryLimit: 10,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class GooglePicker extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.retry = 0;
        this.onApiLoad = this.onApiLoad.bind(this);
        this.onChoose = this.onChoose.bind(this);
    }

    componentDidMount() {
        this.loadGoogleApi();
    }

    componentWillUnmount() {
        if (this.apiLoadTimeOut) {
            clearTimeout(this.apiLoadTimeOut);
            scriptLoadingStarted = false;
        }
    }

    onApiLoad = () => {
        // make sure api is loaded,
        // called by loadScript after loading is success or failure
        // if the api is not loaded, try to load in retry delay
        if (!this.isGoogleReady()) {
            if (this.retry <= this.props.retryLimit) {
                this.apiLoadTimeOut = setTimeout(() => {
                    this.retry += 1;
                    scriptLoadingStarted = false;
                    this.loadGoogleApi();
                }, this.props.retryDelay);
            } else {
                scriptLoadingStarted = false;
            }
        } else if (this.isGoogleReady()) {
            // call func when google drive is ready to be used
            if (this.props.onApiLoad) {
                this.props.onApiLoad();
            }

            window.gapi.load('auth');
            window.gapi.load('picker');
        }
    }

    onChoose() {
        if (!this.isGoogleReady() || !this.isGoogleAuthReady() ||
            !this.isGooglePickerReady() || this.props.disabled) {
            return;
        }

        const token = window.gapi.auth.getToken();
        const oauthToken = token && token.access_token;

        if (oauthToken) {
            this.createPicker(oauthToken);
        } else {
            this.doAuth(({ access_token }) => this.createPicker(access_token));
        }
    }

    loadGoogleApi = () => {
        if (this.isGoogleReady()) {
            // google api is already exists
            // init immediately
            this.onApiLoad();
        } else if (!scriptLoadingStarted) {
            // load google api and the init
            scriptLoadingStarted = true;
            loadScript(GOOGLE_SDK_URL, this.onApiLoad);
        } else {
            // is loading
        }
    }


    doAuth(callback) {
        window.gapi.auth.authorize({
            client_id: this.props.clientId,
            scope: this.props.scope,
            immediate: this.props.authImmediate,
        }, callback,
        );
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
            throw new Error('Can\'t find view by viewId');
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

    isGoogleReady = () => (!!window.gapi)

    isGoogleAuthReady = () => (!!window.gapi.auth)

    isGooglePickerReady = () => (!!window.google.picker)

    render() {
        return (
            <PrimaryButton
                className={this.props.className}
                styleName="google-picker-btn"
                onClick={this.onChoose}
                disabled={this.props.disabled}
                transparent
            >
                {
                    this.props.children ? (
                        this.props.children
                    ) : (
                        <button>
                            {this.props.commonStrings('openGoogleChooserText')}
                        </button>
                    )
                }
            </PrimaryButton>
        );
    }
}
