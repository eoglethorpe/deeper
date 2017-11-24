import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../../views/styles.scss';
import AddDocumentButtons from '../../views/AddDocumentButtons';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class DocumentView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
        return (
            <div styleName={this.props.className}>
                <div styleName="header">
                    <h2>Category Editor</h2>
                </div>
                <div styleName="preview-container">
                    <div><h1>No Preview Available</h1></div>
                </div>
                <AddDocumentButtons />
            </div>
        );
    }
}
