import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    stale: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    upload: PropTypes.shape({
        progress: PropTypes.number,
    }),
};

const defaultProps = {
    active: false,
    className: '',
    upload: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadListItem extends React.PureComponent {
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

    getStatusIconClassName = (props) => {
        const {
            stale,
        } = props;

        let iconClassName = '';

        if (stale) {
            iconClassName = 'ion-android-alert';
        }

        return iconClassName;
    }

    render() {
        const {
            active,
            className,
            onClick,
            error,
            stale,
            type,
            title,
            upload,
        } = this.props;

        return (
            <button
                styleName={`add-lead-list-item ${active ? 'active' : ''}`}
                className={className}
                onClick={onClick}
            >
                <span
                    styleName="icon"
                    className={this.getIconClassName(type)}
                />
                <span
                    styleName="title"
                >
                    { title }
                </span>
                {
                    error && (
                        <span
                            styleName="error"
                            className="ion-android-alert"
                        />
                    )
                }
                {
                    !error && stale && (
                        <span
                            styleName="stale"
                            className="ion-code-working"
                        />
                    )
                }
                {
                    upload &&
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
                }
            </button>
        );
    }
}
