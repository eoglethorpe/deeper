/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentDangerButton,
    TransparentPrimaryButton,
} from '../../../public/components/Action';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    handleCancel: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    getName: PropTypes.func,
    getType: PropTypes.func,
    pending: PropTypes.bool,
};

const defaultProps = {
    getName: null,
    getType: null,
    pending: false,
};


@CSSModules(styles, { allowMultiple: true })
export default class DeletePrompt extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            error: false,
        };
    }

    componentDidCatch(error, info) {
        console.warn(error, info);
        this.setState({ error, info });
    }

    render() {
        const {
            handleDelete,
            handleCancel,

            getType,
            getName,
            pending,
        } = this.props;

        const getTypeNameDefined = getType && getName;

        if (this.state.error) {
            return <div>Error: {this.state.error.toString()}</div>;
        }

        return (
            <div>
                { pending && <LoadingAnimation key="animation" /> }
                <div
                    key="text"
                    styleName="warning-text"
                >
                    { getTypeNameDefined ?
                        `Do you want to delete the ${getType()} '${getName()}' ?` :
                        'Are you sure you want to delete ?'
                    }
                </div>
                <div
                    key="action-buttons"
                    styleName="action-buttons"
                >
                    <TransparentPrimaryButton
                        onClick={handleCancel}
                    >
                        Cancel
                    </TransparentPrimaryButton>
                    <TransparentDangerButton
                        onClick={handleDelete}
                        styleName="delete-btn"
                    >
                        Delete
                    </TransparentDangerButton>
                </div>
            </div>
        );
    }
}
