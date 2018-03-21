import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '../../vendor/react-store/components/Action/Button';

import { SCRIPT_ID } from '../../config/dropbox';
import { commonStringsSelector } from '../../redux';

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
    // Api load delay and limit
    commonStrings: PropTypes.func.isRequired,
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

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

// read more
// https://www.dropbox.com/developers/chooser
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class DropboxChooser extends React.Component {
    static propTypes = propTypes ;
    static defaultProps = defaultProps ;

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

    onApiLoad = () => {
        // only call when api is loaded,
        this.setState({ ready: true });
        window.Dropbox.init({ appKey: this.props.appKey, id: SCRIPT_ID });
        if (this.props.onApiLoad) {
            this.props.onApiLoad();
        }
    }

    onChoose = () => {
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

    pollForReadyState = () => {
        if (DropboxChooser.isDropboxReady()) {
            this.onApiLoad();
        } else {
            this.readyCheck = setTimeout(this.pollForReadyState, 3000);
        }
    };

    render() {
        const {
            className,
            disabled,
            children,
            commonStrings,
        } = this.props;
        const { ready } = this.state;

        return (
            <Button
                className={`${className} ${styles.dropboxBtn}`}
                onClick={this.onChoose}
                disabled={disabled || !ready}
                transparent
            >
                {
                    children || commonStrings('openDropboxChooserText')
                }
            </Button>
        );
    }
}
