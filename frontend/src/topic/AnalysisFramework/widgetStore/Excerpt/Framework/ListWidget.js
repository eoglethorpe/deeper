import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class ExcerptTextList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        console.log('Edit excerpt (list)');
    }

    render() {
        return (
            <div styleName="excerpt-list">
                Text or image excerpt
            </div>
        );
    }
}
