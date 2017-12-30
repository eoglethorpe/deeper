import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentPrimaryButton,
} from '../../../public/components/Action';
import {
    ListView,
    Modal,
    ModalHeader,
    ModalBody,
} from '../../../public/components/View';
import {
    iconNames,
} from '../../constants';

import styles from './styles.scss';


const propTypes = {
    images: PropTypes.array, //eslint-disable-line
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    images: [],
};

@CSSModules(styles, { allowMultiple: true })
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
            <div
                className={className}
                styleName="images-grid"
            >
                <ListView
                    styleName="images"
                    keyExtractor={ImagesGrid.imageKeySelector}
                    data={images}
                    modifier={this.renderImage}
                />
                <Modal
                    styleName="image-preview"
                    show={imageViewModalShow}
                    onClose={this.handleImagePreviewClose}
                    closeOnEscape
                >
                    <ModalHeader
                        title=""
                        styleName="modal-header"
                        rightComponent={
                            <TransparentPrimaryButton
                                className={styles['transparent-btn']}
                                onClick={this.handleImagePreviewClose}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody styleName="modal-body">
                        <img
                            styleName="preview-image"
                            src={activeImageSource}
                            alt={activeImageSource}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
