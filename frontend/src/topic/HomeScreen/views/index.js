import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../public/components/Button';
import styles from './styles.scss';
import { logoutAction } from '../../../common/action-creators/auth';
import {
    stopTokenRefreshAction,
} from '../../../common/middlewares/refreshAccessToken';


const mapStateToProps = state => ({
    // FIXME: where is this used
    // FIXME: don't access elements directly, use selectors
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    stopTokenRefresh: () => dispatch(stopTokenRefreshAction()),
});

const propTypes = {
    logout: PropTypes.func.isRequired,
    stopTokenRefresh: PropTypes.func.isRequired,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;

    handleLogoutButtonClick = () => {
        this.props.stopTokenRefresh();
        this.props.logout();
    }

    render() {
        return (
            <div styleName="home-screen">
                <p>
                    Hello
                </p>
                <Button onClick={this.handleLogoutButtonClick}>
                    Logout
                </Button>
            </div>
        );
    }
}
