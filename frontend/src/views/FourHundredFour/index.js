import React from 'react';
import ReactSVG from 'react-svg';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BoundError from '../../components/BoundError';
import { fourHundredFourStringsSelector } from '../../redux';
import { pathNames } from '../../constants';
import logo from '../../resources/img/deep-logo.svg';

import styles from './styles.scss';

const propTypes = {
    fourHundredFourStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    fourHundredFourStrings: fourHundredFourStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
export default class FourHundredFour extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles.fourHundredFour}>
                <ReactSVG
                    className={styles.deepLogo}
                    path={logo}
                />
                <h1 className={styles.heading}>
                    {this.props.fourHundredFourStrings('errorFourHundredFour')}
                </h1>
                <p className={styles.message}>
                    {this.props.fourHundredFourStrings('message1')}<br />
                    {this.props.fourHundredFourStrings('message2')}
                </p>
                <Link
                    to={pathNames.homeScreen}
                    className={styles.homeScreenLink}
                >
                    {this.props.fourHundredFourStrings('goToDeep')}
                </Link>
            </div>
        );
    }
}
