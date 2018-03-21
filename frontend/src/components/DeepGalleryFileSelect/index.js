import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Modal from '../../vendor/react-store/components/View/Modal';

import DeepGallerySelect from './DeepGallerySelect';
import styles from './styles.scss';

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

        if (!show) {
            return null;
        }

        return (
            <Modal
                closeOnEscape
                className={styles.addGalleryFileModal}
                onClose={onClose}
            >
                <DeepGallerySelect
                    {...this.props}
                />
            </Modal>
        );
    }
}
