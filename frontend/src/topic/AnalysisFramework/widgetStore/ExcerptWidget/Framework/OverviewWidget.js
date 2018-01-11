import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { afStrings } from '../../../../../common/constants';

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
        console.log('Edit excerpt (overview)');
    }

    render() {
        return (
            <div styleName="excerpt-overview">
                {afStrings.textOrImageExcerptWidgetLabel}
            </div>
        );
    }
}
