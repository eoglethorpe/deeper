import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import BoundError from '../../../components/BoundError';
import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError
@CSSModules(styles)
export default class OrganigramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { attribute: { values = [] } = {} } = this.props;

        return (
            <div
                styleName="organigram-list"
            >
                <ul>
                    {
                        values.map(value => (
                            <li key={value.id}>
                                {value.name}
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}
