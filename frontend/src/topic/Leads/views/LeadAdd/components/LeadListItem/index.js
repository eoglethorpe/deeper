import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool,

    className: PropTypes.string,

    onClick: PropTypes.func.isRequired,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadKey: PropTypes.string.isRequired,

    upload: PropTypes.shape({
        dummy: PropTypes.string,
    }),
};

const defaultProps = {
    active: false,
    className: '',
    upload: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class LeadListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.leadTypeToIconClassMap = {
            drive: 'ion-social-google',
            dropbox: 'ion-social-dropbox',
            file: 'ion-android-upload',
            website: 'ion-earth',
            text: 'ion-clipboard',
        };
    }

    getIconClassName(type) {
        return this.leadTypeToIconClassMap[type];
    }

    handleClick = () => {
        this.props.onClick(this.props.leadKey);
    }

    renderIcon = () => {
        const { upload, lead } = this.props;
        const { serverId } = lead;
        const { type } = lead.data;
        const {
            error,
            stale,
            pending,
            ready,
        } = lead.uiState;

        if (type === 'file' && !upload && (!ready || error)) {
            // no way to resume this upload
            return (
                <span
                    styleName="warning"
                    className="ion-alert-circled"
                />
            );
        } else if (pending || !ready) {
            return (
                <span
                    styleName="pending"
                    className="ion-load-c"
                />
            );
        } else if (error) {
            return (
                <span
                    styleName="error"
                    className="ion-android-alert"
                />
            );
        } else if (stale) {
            return (
                <span
                    styleName="stale"
                    className="ion-code-working"
                />
            );
        } else if (serverId) {
            return (
                <span
                    styleName="complete"
                    className="ion-checkmark-circled"
                />
            );
        }
        return null;
    }

    render() {
        const {
            active,
            className,
            lead,
            upload,
        } = this.props;
        const { type } = lead.data;
        const { title } = lead.form.values;

        return (
            <button
                styleName={`add-lead-list-item ${active ? 'active' : ''}`}
                className={className}
                onClick={this.handleClick}
            >
                <span
                    styleName="icon"
                    className={this.getIconClassName(type)}
                />
                <span styleName="title" >
                    { title }
                </span>
                { this.renderIcon() }
                {
                    upload && !upload.errorMsg && (
                        <span
                            styleName={`
                                progress-bar
                                ${upload.progress >= 100 ? 'completed' : ''}
                            `}
                        >
                            <span
                                styleName="progress"
                                style={{
                                    width: `${upload.progress}%`,
                                }}
                            />
                        </span>
                    )
                }
            </button>
        );
    }
}
