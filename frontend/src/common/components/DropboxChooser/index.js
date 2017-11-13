import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import loadScript from 'load-script';

import { TransparentButton } from '../../../public/components/Action';

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
    }

    componentDidMount() {
        if (!this.isDropboxReady() && !scriptLoadingStarted) {
            scriptLoadingStarted = true;
            loadScript(DROPBOX_SDK_URL, {
                attrs: {
                    id: SCRIPT_ID,
                    'data-app-key': this.props.appKey,
                },
            });
        }
    }

    onChoose() {
        if (!this.isDropboxReady() || this.props.disabled) {
            return;
        }

        const {
            success,
            cancel,
            linkType,
            multiselect,
            extensions,
        } = this.props;

        window.Dropbox.choose({
            success,
            cancel,
            linkType,
            multiselect,
            extensions,
        });

        if (this.props.onClick) { this.props.onClick(); }
    }

    isDropboxReady = () => (!!window.Dropbox)

    render() {
        return (
            <TransparentButton
                className={this.props.className}
                styleName="dropbox-btn"
                onClick={this.onChoose}
                disabled={this.props.disabled}
            >
                {
                    this.props.children ?
                        this.props.children :
                        <button>Open dropbox chooser</button>
                }
            </TransparentButton>
        );
    }
}
