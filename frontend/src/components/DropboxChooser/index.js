import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../vendor/react-store/components/Action/Button';

import _ts from '../../ts';
import { SCRIPT_ID } from '../../config/dropbox';

import styles from './styles.scss';

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
};

const defaultProps = {
    className: '',
    cancel: () => {},
    linkType: 'direct',
    multiselect: false,
    disabled: false,
    children: undefined,
    extensions: undefined,
    onClick: undefined,
    onApiLoad: undefined,
};

// read more
// https://www.dropbox.com/developers/chooser
export default class DropboxChooser extends React.Component {
    static propTypes = propTypes ;
    static defaultProps = defaultProps ;

    static POLL_TIME = 3000
    static isDropboxReady = () => (!!window.Dropbox)

    constructor(props) {
        super(props);
        this.state = { ready: false };
    }

    componentWillMount() {
        this.pollForReadyState();
    }

    componentWillUnmount() {
        clearTimeout(this.readyCheck);
    }

    pollForReadyState = () => {
        if (DropboxChooser.isDropboxReady()) {
            this.handleApiLoad();
        } else {
            this.readyCheck = setTimeout(this.pollForReadyState, DropboxChooser.POLL_TIME);
        }
    };

    handleApiLoad = () => {
        const {
            appKey,
            onApiLoad,
        } = this.props;
        // only call when api is loaded,
        this.setState({ ready: true });
        window.Dropbox.init({ appKey, id: SCRIPT_ID });
        if (onApiLoad) {
            onApiLoad();
        }
    }

    handleClick = () => {
        const {
            success,
            disabled,
            cancel,
            linkType,
            multiselect,
            extensions,
            onClick,
        } = this.props;
        const { ready } = this.state;

        if (!DropboxChooser.isDropboxReady() || disabled || !ready) {
            console.warn('Dropbox is not ready');
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

    render() {
        const {
            className,
            disabled,
            children,
        } = this.props;
        const { ready } = this.state;

        return (
            <Button
                className={`${className} ${styles.dropboxBtn}`}
                onClick={this.handleClick}
                disabled={disabled || !ready}
                transparent
            >
                {
                    children || _ts('common', 'openDropboxChooserText')
                }
            </Button>
        );
    }
}
