import PropTypes from 'prop-types';
import React from 'react';

import { brush as d3Brush } from 'd3-brush';
import { select, event } from 'd3-selection';

import { getScreenshot } from '../../utils/browserExtension';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onCapture: PropTypes.func,
    onCaptureError: PropTypes.func,
};

const defaultProps = {
    className: '',
    onCapture: undefined,
    onCaptureError: undefined,
};


export default class Screenshot extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            image: undefined,
            offsetX: 0,
            offsetY: 0,
            width: 0,
            height: 0,
        };
    }

    componentDidMount() {
        this.capture();
        this.createBrush();
    }

    componentWillUnmount() {
        if (this.brushGroup) {
            this.brushGroup.remove();
        }
    }

    getCroppedImage(startX, startY, endX, endY) {
        const { canvas } = this;
        const { image } = this.state;

        if (!canvas || !image) {
            return undefined;
        }

        canvas.width = endX - startX;
        canvas.height = endY - startY;

        const context = canvas.getContext('2d');
        context.drawImage(
            image,
            startX, startY, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height,
        );
        const croppedImage = canvas.toDataURL('image/jpeg');

        canvas.width = 0;
        canvas.height = 0;
        return croppedImage;
    }

    createBrush() {
        if (!this.svg || !this.brushContainer) {
            return;
        }

        const rect = this.svg.getBoundingClientRect();

        const container = select(this.brushContainer);
        const g = container.append('g').attr('class', 'brush');
        const brush = d3Brush()
            .extent([[rect.left, rect.top], [rect.right, rect.bottom]])
            .on('end', this.handleBrush);
        g.call(brush);

        this.g = g;
    }

    handleBrush = () => {
        if (!this.props.onCapture) {
            return;
        }

        const r = event.selection;
        if (event.selection) {
            this.props.onCapture(this.getCroppedImage(
                r[0][0], r[0][1],
                r[1][0], r[1][1],
            ));
        } else {
            this.props.onCapture(undefined);
        }
    }

    capture = () => {
        getScreenshot().then((result) => {
            const scale = window.devicePixelRatio;

            const rect = this.svg.getBoundingClientRect();
            const offsetX = rect.left * scale;
            const offsetY = rect.top * scale;
            const width = rect.width * scale;
            const height = rect.height * scale;

            const image = new Image();
            image.onload = () => {
                this.setState({ image, offsetX, offsetY, width, height });
            };
            image.src = result.image;
        }).catch(() => {
            // TODO: Add to strings
            const captureError = 'Failed to capture screenshot.\n ' +
                'Please make sure you have latest browser extension installed.';

            console.error(captureError);
            if (this.props.onCaptureError) {
                this.props.onCaptureError(captureError);
            }
        });
    }

    render() {
        const {
            className,
        } = this.props;
        const {
            image,
            offsetX, offsetY,
            width, height,
        } = this.state;

        return (
            <div className={`${className} ${styles.screenshot}`}>
                <svg
                    ref={(ref) => { this.svg = ref; }}
                    viewBox={`${offsetX} ${offsetY} ${width} ${height}`}
                >
                    {image && (
                        <image
                            href={image.src}
                        />
                    )}
                    <g ref={(ref) => { this.brushContainer = ref; }} />
                </svg>
                <canvas ref={(ref) => { this.canvas = ref; }} width={0} height={0} />
            </div>
        );
    }
}
