import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class ScaleTaggingList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (value) => {
        const { api, id } = this.props;
        api.setEntryAttribute(id, {
            value,
        });
    }

    render() {
        const {
            attribute,
        } = this.props;
        console.log(attribute);

        return (
            <div styleName="number-list">
                asdasd
            </div>
        );
    }
}
