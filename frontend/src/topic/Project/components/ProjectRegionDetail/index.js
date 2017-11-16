import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';

const propTypes = {
    regionId: PropTypes.number.isRequired,
};

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(null, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { regionId } = this.props;

        return (
            <div>{regionId}</div>
        );
    }
}
