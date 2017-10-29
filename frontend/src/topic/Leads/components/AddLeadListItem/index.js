import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    upload: PropTypes.shape({
        progress: PropTypes.number,
    }),
    /*
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,
    */
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

    /*
    componentDidMount() {
        if (this.props.active && this.container) {
            this.container.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }

    componentDidUpdate() {
        if (this.props.active && this.container) {
            this.container.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }
    */

    getIconClassName(type) {
        return this.leadTypeToIconClassMap[type];
    }

    render() {
        const {
            active,
            className,
            onClick,
            type,
            title,
            upload,
        } = this.props;

        return (
            <button
                ref={(el) => { this.container = el; }}
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
