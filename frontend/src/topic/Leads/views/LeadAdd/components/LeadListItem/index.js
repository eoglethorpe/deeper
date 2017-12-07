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

    choice: PropTypes.string.isRequired,
    upload: PropTypes.object, // eslint-disable-line
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

    renderIcon = (choice) => {
        switch (choice) {
            case 'warning':
                return (
                    <span
                        styleName="warning"
                        className="ion-alert-circled"
                    />
                );
            case 'requesting':
            case 'uploading':
                return (
                    <span
                        styleName="pending"
                        className="ion-load-c"
                    />
                );
            case 'invalid':
                return (
                    <span
                        styleName="error"
                        className="ion-android-alert"
                    />
                );
            case 'nonstale':
                return (
                    <span
                        styleName="stale"
                        className="ion-code-working"
                    />
                );
            case 'complete':
                return (
                    <span
                        styleName="complete"
                        className="ion-checkmark-circled"
                    />
                );
            default:
                return null;
        }
    }

    renderUploadProgress = (choice, upload) => {
        if (choice !== 'uploading') {
            return null;
        }
        return (
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
        );
    }

    render() {
        console.log('Rendering LeadListItem');

        const { active, className } = this.props;

        const { choice, upload, lead } = this.props;
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
                { this.renderIcon(choice) }
                { this.renderUploadProgress(choice, upload) }
            </button>
        );
    }
}
