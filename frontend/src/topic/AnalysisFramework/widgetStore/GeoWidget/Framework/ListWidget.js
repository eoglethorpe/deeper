import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    iconNames,
} from '../../../../../common/constants';

import styles from './styles.scss';
import {
    TransparentButton,
} from '../../../../../public/components/Action';

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
                <TransparentButton>
                    Location <i className={iconNames.globe} />
                </TransparentButton>
            </div>
        );
    }
}
