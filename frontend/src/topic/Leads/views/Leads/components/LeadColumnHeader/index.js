import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../../../../public/constants';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    sortOrder: PropTypes.string,
    sortable: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    sortOrder: undefined,
    sortable: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class LeadColumnHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (props) => {
        const classNames = [];
        const {
            sortOrder,
            sortable,
            className,
        } = props;

        classNames.push(className);
        classNames.push(styles['lead-column-header']);

        if (sortable) {
            classNames.push(styles.sortable);
            if (sortOrder) {
                classNames.push('active');
            }
        }
        return classNames.join(' ');
    }

    getIconClassName = (props) => {
        const {
            sortOrder,
            sortable,
        } = props;

        const classNames = [];
        classNames.push(styles.icon);

        if (sortable) {
            if (sortOrder === 'asc') {
                classNames.push(iconNames.sortAscending);
            } else if (sortOrder === 'dsc') {
                classNames.push(iconNames.sortDescending);
            }
            classNames.push(iconNames.sort);
        }
        return classNames.join(' ');
    }

    render() {
        const {
            label,
        } = this.props;

        const divClassName = this.getClassName(this.props);
        const iconClassName = this.getIconClassName(this.props);

        return (
            <div className={divClassName}>
                <span className={iconClassName} />
                {label}
            </div>
        );
    }
}
