import PropTypes from 'prop-types';
import React from 'react';


const propTypes = {
    text: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number,
        length: PropTypes.number,
        item: PropTypes.object,
    })).isRequired,
    modifier: PropTypes.func,
};

const defaultProps = {
    modifier: text => text,
};


export default class HighlightedText extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            highlights,
            text,
            modifier,
        } = this.props;

        const splits = [];
        let lastString = text;
        let lastPosition = 0;
        highlights.filter(h => h.start >= 0)
            .sort((h1, h2) => h1.start - h2.start)
            .forEach((h) => {
                const diff = h.start - lastPosition;
                const index = Math.max(0, diff);
                const length = Math.max(0, diff < 0 ? h.length + diff : h.length);

                if (length > 0) {
                    splits.push({
                        key: `split-${h.start}`,
                        text: lastString.slice(0, index),
                    });
                    splits.push({
                        key: `split-${h.start + h.length}`,
                        text: lastString.slice(index, index + length),
                        item: h.item,
                    });

                    lastString = lastString.slice(index + length);
                    lastPosition = h.start + h.length;
                }
            });

        splits.push({
            key: 'last-split',
            text: lastString,
        });

        return (
            <pre>
                {splits.map(split => (
                    <span key={split.key}>
                        {split.item ? modifier(split.item, split.text) : split.text}
                    </span>
                ))}
            </pre>
        );
    }
}
