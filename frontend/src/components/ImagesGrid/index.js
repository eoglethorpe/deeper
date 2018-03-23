import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';

import { iconNames } from '../../constants';
import styles from './styles.scss';

const propTypes = {
    images: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    images: [],
};

export default class ImagesGrid extends React.PureComponent {
    static imageKeySelector = d => d;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            activeImageSource: '',
            imageViewModalShow: false,
        };
    }

    getStyleName = (galleryIndex) => {
        const styleNames = ['image'];
        const { selectedIndex } = this.state;

        if (galleryIndex === selectedIndex) {
            styleNames.push('visible');
        }
        return styleNames.join(' ');
    }

    handleImageClick = (source) => {
        this.setState({
            activeImageSource: source,
            imageViewModalShow: true,
        });
    }

    handleImagePreviewClose = () => {
        this.setState({ imageViewModalShow: false });
    }

    handleOnDragStart = source => (e) => {
        const data = JSON.stringify({
            type: 'image',
            data: source,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    renderImage = (key, data) => {
        let source = data;

        if (source[0] === '/') {
            source = `http://localhost:8000${source}`;
        }

        return (
            <img
                className={styles.image}
                src={source}
                role="presentation"
                onClick={() => this.handleImageClick(source)}
                draggable
                onDragStart={this.handleOnDragStart(source)}
                alt={key}
                key={key}
            />
        );
    }

    render() {
        const {
            className,
            images,
        } = this.props;

        const {
            activeImageSource,
            imageViewModalShow,
        } = this.state;

        return (
            <div className={`${className} ${styles.imagesGrid}`}>
                <ListView
                    className={styles.images}
                    keyExtractor={ImagesGrid.imageKeySelector}
                    data={images}
                    modifier={this.renderImage}
                />
                { imageViewModalShow &&
                    <Modal
                        className={styles.imagePreview}
                        onClose={this.handleImagePreviewClose}
                        closeOnEscape
                    >
                        <ModalHeader
                            title=""
                            className={styles.modalHeader}
                            rightComponent={
                                <PrimaryButton
                                    className={styles.transparentBtn}
                                    onClick={this.handleImagePreviewClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody className={styles.modalBody}>
                            <img
                                className={styles.previewImage}
                                src={activeImageSource}
                                alt={activeImageSource}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
