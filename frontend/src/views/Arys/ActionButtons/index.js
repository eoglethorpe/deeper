import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import {
    iconNames,
    pathNames,
} from '../../../constants/';

import { reverseRoute } from '../../../vendor/react-store/utils/common';

import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    arysStrings: PropTypes.func.isRequired,
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
                    aryId: row.id,
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
            arysStrings,
        } = this.props;

        return (
            <Fragment>
                <DangerButton
                    title={arysStrings('removeAryButtonTitle')}
                    onClick={() => onRemoveAry(row)}
                    smallVerticalPadding
                    transparent
                >
                    <i className={iconNames.delete} />
                </DangerButton>
                <Link
                    className={styles.editLink}
                    title={arysStrings('editAryButtonTitle')}
                    to={links.editAry}
                >
                    <i className={iconNames.edit} />
                </Link>
            </Fragment>
        );
    }
}
