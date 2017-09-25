import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../public/components/Button';
import styles from './styles.scss';
import { logout } from '../../../common/action-creators/auth';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logout()),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = {
        logout: PropTypes.func.isRequired,
    };

    handleLogoutButtonClick = () => {
        this.props.logout();
    }

    render() {
        return (
            <div styleName="home-screen">
                <p>Hello</p>
                <Button onClick={this.handleLogoutButtonClick}>Logout</Button>
            </div>
        );
    }
}
