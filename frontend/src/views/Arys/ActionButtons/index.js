import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '../../../vendor/react-store/utils/common';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';

import {
    iconNames,
    pathNames,
} from '../../../constants/';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onRemoveAry: PropTypes.func.isRequired,
};

const defaultProps = {};


export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            activeProject,
            row,
        } = this.props;

        const editAry = {
            pathname: reverseRoute(
                pathNames.editAry,
                {
                    projectId: activeProject,
                    leadId: row.lead,
                },
            ),
        };

        return { editAry };
    }

    render() {
        const links = this.getLinks();
        const {
            onRemoveAry,
            row,
        } = this.props;

        return (
            <Fragment>
                <DangerButton
                    title={_ts('arys', 'removeAryButtonTitle')}
                    onClick={() => onRemoveAry(row)}
                    smallVerticalPadding
                    transparent
                >
                    <i className={iconNames.delete} />
                </DangerButton>
                <Link
                    className={styles.editLink}
                    title={_ts('arys', 'editAryButtonTitle')}
                    to={links.editAry}
                >
                    <i className={iconNames.edit} />
                </Link>
            </Fragment>
        );
    }
}
