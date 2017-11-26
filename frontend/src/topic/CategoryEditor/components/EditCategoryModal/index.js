import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class EditCategoryModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
        return (
            <div styleName={this.props.className}>
                <div>
                    Title and Stuff
                </div>
            </div>
        );
    }
}
