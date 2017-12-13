import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentButton,
} from '../../../public/components/Action';
import {
    iconNames,
} from '../../constants';

import DeepGallery from '../DeepGallery';

import styles from './styles.scss';


const propTypes = {
    galleryIds: PropTypes.array, //eslint-disable-line
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryIds: [],
};

@CSSModules(styles, { allowMultiple: true })
export default class ImagesSlider extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            selectedIndex: 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { galleryIds } = nextProps;
        if (galleryIds !== this.props.galleryIds) {
            const selectedId = galleryIds.length > 0 ? galleryIds[0] : 0;

            this.setState({ selectedId });
        }
    }

    getStyleName = (galleryIndex) => {
        const styleNames = ['image'];
        const { selectedIndex } = this.state;

        if (galleryIndex === selectedIndex) {
            styleNames.push('visible');
        }
        return styleNames.join(' ');
    }

    handlePreviousClick = () => {
        const { selectedIndex } = this.state;
        const newIndex = selectedIndex - 1;
        this.setState({ selectedIndex: newIndex });
    }

    handleNextClick = () => {
        const { selectedIndex } = this.state;
        const newIndex = selectedIndex + 1;
        this.setState({ selectedIndex: newIndex });
    }

    render() {
        const {
            className,
            galleryIds,
        } = this.props;

        const { selectedIndex } = this.state;
        const isFirstItem = selectedIndex === 0;
        const isLastItem = selectedIndex === galleryIds.length - 1;

        return (
            <div
                className={className}
                styleName="images-slider"
            >
                {
                    galleryIds.map((galleryId, key) => (
                        galleryId && (
                            <DeepGallery
                                key={galleryId}
                                galleryId={galleryId}
                                styleName={this.getStyleName(key)}
                            />
                        )
                    ))
                }
                {galleryIds.length > 0 &&
                    <div styleName="action-bar">
                        {!isFirstItem &&
                            <TransparentButton
                                onClick={this.handlePreviousClick}
                            >
                                <span className={iconNames.chevronLeft} />
                            </TransparentButton>
                        }
                        {!isLastItem &&
                            <TransparentButton
                                onClick={this.handleNextClick}
                            >
                                <span className={iconNames.chevronRight} />
                            </TransparentButton>
                        }
                    </div>
                }
            </div>
        );
    }
}
