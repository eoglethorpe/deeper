import React from 'react';
import styles from './styles.scss';

export default class WidgetError extends React.PureComponent {
    getErrorText = () => (
        'Widget has failed'
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
