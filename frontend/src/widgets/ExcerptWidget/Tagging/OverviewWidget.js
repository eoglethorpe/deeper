import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TextArea from '../../../vendor/react-store/components/Input/TextArea';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';

import { formatPdfText } from '../../../vendor/react-store/utils/common';
import { iconNames } from '../../../constants';
import { afStringsSelector } from '../../../redux';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const IMAGE = 'image';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    attribute: undefined,
    entryId: undefined,
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { dragOver: false };
    }

    getAttribute = () => {
        const { api, attribute } = this.props;
        if (!attribute) {
            return {
                type: api.getEntryType(),
                excerpt: api.getEntryExcerpt(),
                image: api.getEntryImage(),
            };
        }
        return attribute;
    }

    handleExcerptChange = (value) => {
        const { id, entryId, api } = this.props;
        const attribute = this.getAttribute();
        if (entryId !== undefined) {
            api.getEntryModifier(entryId)
                .setExcerpt(value)
                .setAttribute(id, { ...attribute, excerpt: value })
                .apply();
        } else {
            const newAttribute = {
                type: 'excerpt',
                excerpt: value,
            };

            api.getEntryBuilder()
                .setExcerpt(value)
                .addAttribute(id, newAttribute)
                .apply();
        }
    }

    handleFormatText = () => {
        const { id, entryId, api } = this.props;
        const attribute = this.getAttribute();
        const value = attribute.excerpt && formatPdfText(attribute.excerpt);
        api.getEntryModifier(entryId)
            .setExcerpt(value)
            .setAttribute(id, { ...attribute, excerpt: value })
            .apply();
    }

    handleExcerptDrop = (e) => {
        const data = e.dataTransfer.getData('text');
        let formattedData;

        try {
            formattedData = JSON.parse(data);
        } catch (ex) {
            formattedData = {
                type: 'excerpt',
                data,
            };
        }

        const {
            api,
            id,
        } = this.props;
        const existing = api.getEntryForData(formattedData);

        if (existing) {
            api.selectEntry(existing.data.id);
        } else {
            const attribute = {
                type: formattedData.type,
                excerpt: formattedData.data,
                image: formattedData.data,
            };

            api.getEntryBuilder()
                .setData(formattedData)
                .addAttribute(id, attribute)
                .apply();
        }
        this.setState({ dragOver: false });
    }

    handleDragEnter = () => {
        this.setState({ dragOver: true });
    }

    handleDragExit = () => {
        this.setState({ dragOver: false });
    }

    handleChildDragOver = (e) => {
        e.preventDefault();
    }

    renderDropContainer = () => {
        const { dragOver } = this.state;

        if (!dragOver) {
            return null;
        }

        // FIXME: use strings
        const contentText = 'Drop image here';
        return (
            <div
                className={styles['drop-container']}
                onDragOver={this.handleChildDragOver}
                onDrop={this.handleExcerptDrop}
            >
                { contentText }
            </div>
        );
    }

    renderExcerptContent = (p) => {
        const { dragOver } = this.state;
        const { afStrings } = this.props;

        if (dragOver) {
            return null;
        }

        const { attribute } = p;

        if (attribute.type === IMAGE) {
            return (
                <img
                    className={styles.image}
                    src={attribute.image}
                    alt={afStrings('altEntryLabel')}
                />
            );
        }

        return (
            <TextArea
                onChange={this.handleExcerptChange}
                className={styles.textarea}
                showLabel={false}
                showHintAndError={false}
                value={attribute.excerpt}
            />
        );
    }

    renderFormatButton = (p) => {
        const { attribute } = p;
        const { dragOver } = this.state;
        const { entryId, afStrings } = this.props;

        if (dragOver || attribute.type === IMAGE || !entryId) {
            return null;
        }

        const buttonTitle = afStrings('formatExcerpt');
        return (
            <AccentButton
                className={styles['format-button']}
                iconName={iconNames.textFormat}
                onClick={this.handleFormatText}
                title={buttonTitle}
                transparent
            />
        );
    }

    render() {
        const attribute = this.getAttribute();
        if (!attribute) {
            return null;
        }

        const DropContainer = this.renderDropContainer;
        const ExcerptContent = this.renderExcerptContent;
        const FormatButton = this.renderFormatButton;

        return (
            <div
                className={styles['excerpt-overview']}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
            >
                <DropContainer />
                <ExcerptContent attribute={attribute} />
                <FormatButton attribute={attribute} />
            </div>
        );
    }
}
