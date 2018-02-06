import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TextArea from '../../../../../public/components/Input/TextArea';
import AccentButton from '../../../../../public/components/Action/Button/AccentButton';

import { formatPdfText } from '../../../../../public/utils/common';
import { iconNames } from '../../../../../common/constants';
import { afStringsSelector } from '../../../../../common/redux';
import BoundError from '../../../../../common/components/BoundError';

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
@CSSModules(styles)
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

    render() {
        const { dragOver } = this.state;

        const attribute = this.getAttribute();
        if (!attribute) {
            return null;
        }

        return (
            <div
                styleName="excerpt-overview"
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
            >
                {dragOver &&
                    <div
                        onDrop={this.handleExcerptDrop}
                        onDragOver={this.handleChildDragOver}
                        styleName="drop-here-container"
                    >
                        Drop excerpt here
                    </div>
                }
                {!dragOver &&
                    (
                        (attribute.type === IMAGE) ? (
                            <img
                                styleName="image"
                                src={attribute.image}
                                alt={this.props.afStrings('altEntryLabel')}
                            />
                        ) : (
                            <TextArea
                                onChange={this.handleExcerptChange}
                                styleName="textarea"
                                showLabel={false}
                                showHintAndError={false}
                                value={attribute.excerpt}
                            />
                        )
                    )
                }
                { !dragOver && attribute.type !== IMAGE && this.props.entryId &&
                    <AccentButton
                        // TODO: Write title
                        onClick={this.handleFormatText}
                        styleName="format-button"
                        iconName={iconNames.textFormat}
                        transparent
                    />
                }
            </div>
        );
    }
}
