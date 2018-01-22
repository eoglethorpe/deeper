import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import loadScript from 'load-script';

import { Button } from '../../../public/components/Action';
import {
    commonStrings,
} from '../../../common/constants';
import styles from './styles.scss';

import { DROPBOX_SDK_URL, SCRIPT_ID } from '../../../common/config/dropbox';

let scriptLoadingStarted = false;

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    appKey: PropTypes.string.isRequired,
    success: PropTypes.func.isRequired,
    cancel: PropTypes.func,
    onClick: PropTypes.func,
    linkType: PropTypes.oneOf(['preview', 'direct']),
    multiselect: PropTypes.bool,
    extensions: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    // Callback when api is loaded successfully and ready to use
    onApiLoad: PropTypes.func,
    // Api load delay and limit
    retryDelay: PropTypes.number, // in miliseconds
    retryLimit: PropTypes.number,
};

const defaultProps = {
    className: 'dropbox-btn',
    cancel: () => {},
    linkType: 'direct',
    multiselect: false,
    disabled: false,
    children: undefined,
    extensions: undefined,
    onClick: undefined,
    onApiLoad: undefined,
    retryDelay: 3000,
    retryLimit: 10,
};

// read more
// https://www.dropbox.com/developers/chooser
@CSSModules(styles, { allowMultiple: true })
export default class DropboxChooser extends React.Component {
    static propTypes = propTypes ;
    static defaultProps = defaultProps ;

    constructor(props) {
        super(props);

        this.onChoose = this.onChoose.bind(this);
        this.retry = 0;
    }

    componentDidMount() {
        this.loadDropboxApi();
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
        const {
            retryLimit,
            retryDelay,
            onApiLoad,
        } = this.props;

        if (!this.isDropboxReady()) {
            if (this.retry <= retryLimit) {
                this.apiLoadTimeOut = setTimeout(
                    () => {
                        this.retry += 1;
                        scriptLoadingStarted = false;
                        this.loadDropboxApi();
                    },
                    retryDelay,
                );
            } else {
                scriptLoadingStarted = false;
            }
        } else if (this.isDropboxReady && onApiLoad) {
            // call func when dropbox is ready to be used
            onApiLoad();
        }
    }

    onChoose() {
        const {
            success,
            disabled,
            cancel,
            linkType,
            multiselect,
            extensions,
            onClick,
        } = this.props;

        if (!this.isDropboxReady() || disabled) {
            return;
        }

        window.Dropbox.choose({
            success,
            cancel,
            linkType,
            multiselect,
            extensions,
        });

        if (onClick) {
            onClick();
        }
    }

    loadDropboxApi = () => {
        const { appKey } = this.props;
        if (!this.isDropboxReady() && !scriptLoadingStarted) {
            scriptLoadingStarted = true;
            loadScript(
                DROPBOX_SDK_URL,
                {
                    attrs: {
                        id: SCRIPT_ID,
                        'data-app-key': appKey,
                    },
                },
                this.onApiLoad,
            );
        }
    }

    isDropboxReady = () => (!!window.Dropbox)

    render() {
        const { className, disabled, children } = this.props;
        return (
            <Button
                className={className}
                styleName="dropbox-btn"
                onClick={this.onChoose}
                disabled={disabled}
                transparent
            >
                {
                    children ||
                    <button>
                        {commonStrings.openDropboxChooserText}
                    </button>
                }
            </Button>
        );
    }
}
