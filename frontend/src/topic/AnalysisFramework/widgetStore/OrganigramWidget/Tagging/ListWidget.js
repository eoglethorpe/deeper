import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
    data: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    data: undefined,
    attribute: undefined,
};

@CSSModules(styles)
export default class Organigram extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (value) => {
        const { api, id } = this.props;
        api.setEntryAttribute(id, {
            value,
        });
    }

    render() {
        return (
            <div styleName="organigram-list">
                Oraganigram List
            </div>
        );
    }
}
