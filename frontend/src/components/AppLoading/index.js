import React from 'react';

import { getRandomFromList } from '../../vendor/react-store/utils/common';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
};

export default class AppLoading extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const loadingMessages = [
            _ts('common', 'loadingMessages1'),
            _ts('common', 'loadingMessages2'),
            _ts('common', 'loadingMessages3'),
            _ts('common', 'loadingMessages4'),
            _ts('common', 'loadingMessages5'),
            _ts('common', 'loadingMessages6'),
            _ts('common', 'loadingMessages7'),
            _ts('common', 'loadingMessages8'),
            _ts('common', 'loadingMessages9'),
            _ts('common', 'loadingMessages10'),
            _ts('common', 'loadingMessages11'),
            _ts('common', 'loadingMessages12'),
            _ts('common', 'loadingMessages13'),
            _ts('common', 'loadingMessages14'),
            _ts('common', 'loadingMessages15'),
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
