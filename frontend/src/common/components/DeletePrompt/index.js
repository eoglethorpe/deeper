/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DangerButton,
    PrimaryButton,
} from '../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    handleCancel: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    getName: PropTypes.func,
    getType: PropTypes.func,
};

const defaultProps = {
    getName: null,
    getType: null,
};


@CSSModules(styles, { allowMultiple: true })
export default class DeletePrompt extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        console.log(props);
    }

    handleCancel = () => {
        this.props.handleCancel();
    }

    handleDelete = () => {
        this.props.handleDelete();
    }

    renderMessage = () => {
        const showDetail = this.props.getName && this.props.getType;
        return (
            <span>
                {showDetail ?
                    `Do you want to delete ${this.props.getType()}: ${this.props.getName()}` :
                    'Are you sure'
                }?
            </span>
        );
    }

    render() {
        return (
            <div>
                <div>
                    {this.renderMessage()}
                </div>
                <div>
                    <DangerButton onClick={() => { this.handleDelete(); }}>
                        Delete
                    </DangerButton>
                    <PrimaryButton onClick={() => { this.handleCancel(); }}>
                        Cancel
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
