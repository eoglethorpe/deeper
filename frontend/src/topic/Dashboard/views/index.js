import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    currentUserActiveProjectSelector,
} from '../../../common/redux';

import notify from '../../../common/notify';


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

    componentDidMount() {
        setTimeout(() => {
            notify.send({
                message: 'Sending message from homescreen',
                duration: 3000,
            });
        }, 1000);
    }

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
