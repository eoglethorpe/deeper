import React from 'react';
import styles from './styles.scss';

export default class WidgetError extends React.PureComponent {
    constructor(props) {
        super(props);
        console.warn('Error Occured');
    }

    render() {
        return (
            <div className={styles.messageContainer}>
                I am the error now!
            </div>
        );
    }
}
