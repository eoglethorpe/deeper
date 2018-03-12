import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import GeoReferencedMap from '../../vendor/react-store/components/Visualization/GeoReferencedMap';

import { currentUserActiveProjectSelector } from '../../redux';
import BoundError from '../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state, props),
});

@BoundError
@connect(mapStateToProps, undefined)
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { currentUserActiveProject } = this.props;

        return (
            <div className={styles.dashboard}>
                <p className={styles.header}>
                    { currentUserActiveProject.title }
                </p>
                <GeoReferencedMap className={styles.dashboardMap} />
            </div>
        );
    }
}
