import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    currentUserProjectsSelector,
} from '../../../common/redux';

import DocumentView from './DocumentView';
import Categories from '../components/Categories';
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
                <DocumentView className="left" />
                <Categories className="right" />
            </div>
        );
    }
}
