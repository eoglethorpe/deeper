import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    currentUserProjectsSelector,
} from '../../../common/redux';
import { pageTitles } from '../../../common/constants';

import DocumentView from './DocumentView';
import CategoryView from './CategoryView';
import styles from './styles.scss';

const propTypes = {
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div styleName="overview">
                <Helmet>
                    <title>
                        { pageTitles.categoryEditor }
                    </title>
                </Helmet>
                <DocumentView className="left" />
                <CategoryView className="right" />
            </div>
        );
    }
}
