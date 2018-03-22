import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../vendor/react-store/components/Action/Button';

import { iconNames } from '../../constants';
import { InternalGallery } from '../DeepGallery';

import styles from './styles.scss';


const propTypes = {
    galleryIds: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryIds: [],
};

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

    getClassName = (galleryIndex) => {
        const classNames = [styles.image];
        const { selectedIndex } = this.state;

        if (galleryIndex === selectedIndex) {
            classNames.push(styles.visible);
        }
        return classNames.join(' ');
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
                className={styles.imagesSlider}
            >
                {
                    galleryIds.map((galleryId, key) => (
                        galleryId && (
                            <InternalGallery
                                key={galleryId}
                                galleryId={galleryId}
                                className={this.getClassName(key)}
                            />
                        )
                    ))
                }
                {galleryIds.length > 0 &&
                    <div className={styles.actionBar}>
                        {!isFirstItem &&
                            <Button
                                onClick={this.handlePreviousClick}
                                transparent
                            >
                                <span className={iconNames.chevronLeft} />
                            </Button>
                        }
                        {!isLastItem &&
                            <Button
                                onClick={this.handleNextClick}
                                transparent
                            >
                                <span className={iconNames.chevronRight} />
                            </Button>
                        }
                    </div>
                }
            </div>
        );
    }
}
