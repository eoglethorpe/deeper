import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/redux';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class FourHundredFour extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.props.setNavbarState({
            visible: false,
            activeLink: undefined,
            validLinks: undefined,
        });
    }

    render() {
        return (
            <div>
                <Helmet>
                    <title>{ pageTitles.fourHundredFour }</title>
                </Helmet>
                { pageTitles.fourHundredFour }
            </div>
        );
    }
}
