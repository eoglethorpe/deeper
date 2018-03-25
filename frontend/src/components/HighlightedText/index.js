import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
        item: PropTypes.object,
    })).isRequired,
    modifier: PropTypes.func,
};

const defaultProps = {
    className: '',
    modifier: text => text,
};


export default class HighlightedText extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createNestedSplits = (splits = []) => {
        const parents = [];
        for (let i = 0; i < splits.length; i += 1) {
            const parent = splits[i];
            if (parent.added) {
                continue; // eslint-disable-line
            }
            parent.children = [];
            parent.added = true;

            for (let j = i + 1; j < splits.length; j += 1) {
                const child = splits[j];
                if (
                    child.start < parent.end &&
                    child.end < parent.end
                ) {
                    child.start -= parent.start;
                    child.end -= parent.start;
                    parent.children.push(child);
                }
            }

            parent.children = HighlightedText.createNestedSplits(parent.children);
            parents.push(parent);
        }

        return parents;
    }

    renderSplits = (text, splits, level = 1) => {
        const result = [];
        let index = 0;
        splits.forEach((split) => {
            const splitIndex = Math.max(index, split.start);
            if (index < splitIndex) {
                result.push(
                    <span key={`split-${level}-${split.start}-0`}>
                        { text.substr(index, splitIndex - index) }
                    </span>,
                );
            }

            const actualStr = text.substr(split.start, split.end - split.start);
            const splitStr = text.substr(splitIndex, split.end - splitIndex);
            const key = `split-${level}-${split.start}-1`;

            if (split.children.length > 0) {
                result.push(
                    <span key={key}>
                        { this.props.modifier(
                            split.item,
                            this.renderSplits(splitStr, split.children, level + 1),
                            actualStr,
                        ) }
                    </span>,
                );
            } else {
                result.push(
                    <span key={key}>{ this.props.modifier(split.item, splitStr, actualStr) }</span>,
                );
            }

            index = split.end;
        });

        if (index < text.length) {
            result.push(
                <span key={`split-${level}-2`}>{ text.substr(index) }</span>,
            );
        }

        return result;
    }

    render() {
        const {
            className,
            highlights,
            text,
        } = this.props;

        const highlightsCopy = highlights.map(h => ({ ...h }))
            .filter(h => h.start >= 0)
            .sort((h1, h2) => h1.start - h2.start);

        return (
            <p className={className}>
                {this.renderSplits(
                    text,
                    HighlightedText.createNestedSplits(highlightsCopy),
                )}
            </p>
        );
    }
}
