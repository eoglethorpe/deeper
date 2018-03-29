import React from 'react';
import styles from './styles.scss';

export default class AppError extends React.PureComponent {
    getErrorText = () => (
        'There seems to be some problem with the page'
    )

    render() {
        const errorText = this.getErrorText();

        return (
            <div className={styles.messageContainer}>
                { errorText }
            </div>
        );
    }
}
