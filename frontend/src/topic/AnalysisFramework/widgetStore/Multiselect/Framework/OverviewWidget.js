import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    SelectInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class MultiselectOverview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        console.log('Edit Multiselect (Overview)');
    }

    render() {
        return (
            <div styleName="multiselect-overview">
                <SelectInput />

            </div>
        );
    }
}
