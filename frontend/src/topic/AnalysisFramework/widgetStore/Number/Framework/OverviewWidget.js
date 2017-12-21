import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        console.log('Edit Date (Overview)');
    }

    render() {
        return (
            <div styleName="date-overview">
                <DateInput />

            </div>
        );
    }
}
