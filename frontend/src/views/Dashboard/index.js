import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import GeoReferencedMap from '../../vendor/react-store/components/Visualization/GeoReferencedMap';
import styles from './styles.scss';

import {
    currentUserActiveProjectSelector,
} from '../../redux';
import BoundError from '../../components/BoundError';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state, props),
});

@BoundError
@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { currentUserActiveProject } = this.props;

        return (
            <div styleName="dashboard">
                <GeoReferencedMap
                    styleName="dashboard-map"
                />
            </div>
        );
    }
}
