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

    render() {
        const {
            handleDelete,
            handleCancel,

            getType,
            getName,
            pending,
        } = this.props;

        const getTypeNameDefined = getType && getName;
        return (
            <div>
                <div>
                    {
                        pending &&
                        <div styleName="pending-overlay">
                            <i
                                className="ion-load-c"
                                styleName="loading-icon"
                            />
                        </div>
                    }
                    <span>
                        { getTypeNameDefined ?
                            `Do you want to delete ${getType()} '${getName()}' ?` :
                            'Are you sure you want to delete ?'
                        }
                    </span>
                </div>
                <div>
                    <DangerButton onClick={handleDelete}>
                        Delete
                    </DangerButton>
                    <PrimaryButton onClick={handleCancel}>
                        Cancel
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
