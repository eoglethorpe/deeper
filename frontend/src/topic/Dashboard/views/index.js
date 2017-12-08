import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    currentUserActiveProjectSelector,
} from '../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state),
});

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { currentUserActiveProject } = this.props;
        return (
            <div styleName="dashboard">
                <p>
                    Dashboard of {currentUserActiveProject.title}
                </p>
            </div>
        );
    }
}
