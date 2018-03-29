import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRandomFromList } from '../../vendor/react-store/utils/common';
import { commonStringsSelector } from '../../redux';
import styles from './styles.scss';

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

const propTypes = {
    commonStrings: PropTypes.func.isRequired,
};

@connect(mapStateToProps)
export default class AppLoading extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const loadingMessages = [
            this.props.commonStrings('loadingMessages1'),
            this.props.commonStrings('loadingMessages2'),
            this.props.commonStrings('loadingMessages3'),
            this.props.commonStrings('loadingMessages4'),
            this.props.commonStrings('loadingMessages5'),
            this.props.commonStrings('loadingMessages6'),
            this.props.commonStrings('loadingMessages7'),
            this.props.commonStrings('loadingMessages8'),
            this.props.commonStrings('loadingMessages9'),
            this.props.commonStrings('loadingMessages10'),
            this.props.commonStrings('loadingMessages11'),
            this.props.commonStrings('loadingMessages12'),
            this.props.commonStrings('loadingMessages13'),
            this.props.commonStrings('loadingMessages14'),
            this.props.commonStrings('loadingMessages15'),
        ];

        // Get a random message from the loading message list
        this.randomMessage = getRandomFromList(loadingMessages);
    }

    render() {
        return (
            <div className={styles.messageContainer}>
                { this.randomMessage }
            </div>
        );
    }
}
