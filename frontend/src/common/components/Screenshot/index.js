import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { getScreenshot } from '../../utils/browserExtension';
import { isTruthy } from '../../../public/utils/common';


const propTypes = {
    className: PropTypes.string,
    onCapture: PropTypes.func,
};

const defaultProps = {
    className: '',
    onCapture: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class Screenshot extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.mouseDown = false;
        this.state = {
            image: undefined,

            offsetX: undefined,
            offsetY: undefined,
            width: undefined,
            height: undefined,

            startX: undefined,
            startY: undefined,
            endX: undefined,
            endY: undefined,
        };
    }

    componentDidMount() {
        this.capture();

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }

    getCroppedImage() {
        const { canvas } = this;
        const {
            image,
            offsetX, offsetY,
            startX, startY,
            endX, endY,
        } = this.state;

        if (!canvas || !image || !startX || !startY || !endX || !endY) {
            return undefined;
        }

        canvas.width = endX - startX;
        canvas.height = endY - startY;

        const context = canvas.getContext('2d');
        context.drawImage(
            image,
            offsetX + startX, offsetY + startY, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height,
        );
        const croppedImage = canvas.toDataURL('image/jpeg');
        this.drawCanvas();

        return croppedImage;
    }

    capture() {
        getScreenshot().then((result) => {
            const scale = window.devicePixelRatio;

            const rect = this.canvas.getBoundingClientRect();
            const offsetX = rect.left * scale;
            const offsetY = rect.top * scale;
            const width = (rect.right - rect.left) * scale;
            const height = (rect.bottom - rect.top) * scale;

            const image = new Image();
            image.onload = () => {
                this.setState({ image, offsetX, offsetY, width, height });
            };
            image.src = result.image;
        });
    }

    handleMouseDown = (e) => {
        this.mouseDown = true;
        this.setState({
            startX: e.offsetX,
            startY: e.offsetY,

            endX: undefined,
            endY: undefined,
        });
    }

    handleMouseMove = (e) => {
        if (!this.mouseDown) {
            return;
        }
        this.setState({
            endX: e.offsetX,
            endY: e.offsetY,
        });
    }

    handleMouseUp = (e) => {
        this.mouseDown = false;
        this.setState({
            endX: e.offsetX,
            endY: e.offsetY,
        }, () => {
            if (this.props.onCapture) {
                this.props.onCapture(this.getCroppedImage());
            }
        });
    }

    drawCanvas() {
        if (!this.canvas) {
            return;
        }
        const {
            image,
            offsetX, offsetY,
            width, height,
            startX, startY,
            endX, endY,
        } = this.state;
        const { canvas } = this;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (image) {
            context.drawImage(
                image,
                offsetX, offsetY,
                width, height,
                0, 0,
                canvas.width, canvas.height,
            );
        }

        if (isTruthy(startX) && isTruthy(startY) && isTruthy(endX) && isTruthy(endY)) {
            context.fillStyle = 'rgba(0, 0, 0, 0.3)';
            context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            context.fillRect(startX, startY, endX - startX, endY - startY);
            context.strokeRect(startX, startY, endX - startX, endY - startY);
        }
    }

    render() {
        const {
            className,
        } = this.props;
        this.drawCanvas();

        return (
            <div
                className={className}
                styleName="screenshot"
            >
                <canvas
                    ref={(ref) => { this.canvas = ref; }}
                />
            </div>
        );
    }
}
