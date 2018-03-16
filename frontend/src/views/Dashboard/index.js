import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import { currentUserActiveProjectSelector } from '../../redux';
import logo from '../../resources/img/deep-logo.svg';
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

        // FIXME: Use strings
        return (
            <div className={styles.dashboard}>
                <p className={styles.header}>
                    { currentUserActiveProject.title }
                </p>
                <div className={styles.content}>
                    <ReactSVG
                        className={styles.deepLogo}
                        path={logo}
                    />
                    <div className={styles.deepText} >
                        DEEP Beta
                    </div>
                </div>
            </div>
        );
    }
}
