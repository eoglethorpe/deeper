import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TextInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';


const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class GeoFrameworkList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        console.log('Edit Geographic Location (List)');
    }

    render() {
        return (
            <div styleName="geo-list">
                <TextInput
                    showHintAndError={false}
                    disabled
                    placeholder="Location"
                />
            </div>
        );
    }
}
