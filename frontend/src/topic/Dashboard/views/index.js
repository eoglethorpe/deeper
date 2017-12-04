import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { pageTitles } from '../../../common/constants';
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
        const projectName = currentUserActiveProject.title;
        return (
            <div styleName="dashboard">
                <Helmet>
                    <title>
                        { pageTitles.dashboard } | { projectName}
                    </title>
                </Helmet>
                <p>
                    Dashboard
                </p>
            </div>
        );
    }
}
