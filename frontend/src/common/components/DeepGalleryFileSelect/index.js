import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    Modal,
} from '../../../public/components/View';

import DeepGallerySelect from './DeepGallerySelect';

const propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    show: false,
    galleryFiles: [],
};

/*
 * Deep Gallery Files Selector Component Modal Wrapper
 *
 */
@CSSModules(styles, { allowMultiple: true })
export default class DeepGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            show,
            onClose,
        } = this.props;

        return (
            <Modal
                closeOnEscape
                styleName="add-gallery-file-modal"
                onClose={onClose}
                show={show}
            >
                <DeepGallerySelect
                    {...this.props}
                />
            </Modal>
        );
    }
}
