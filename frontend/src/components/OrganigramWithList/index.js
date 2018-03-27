import PropTypes from 'prop-types';
import React from 'react';

// import OrgChart from '../../vendor/react-store/components/Visualization/OrgChart';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';

import { iconNames } from '../../constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
};

const defaultProps = {
    className: '',
    title: 'Organigram', // FIXME: use strings
};

export default class OrganigramWithList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.container,
            'organigram-with-list',
        ];

        return classNames.join(' ');
    }

    renderOrganigramModal = () => {
        // <OrgChart />
    }

    render() {
        const {
            title,
        } = this.props;

        const titleClassName = `${styles.title} title`;
        const headerClassName = `${styles.header} header`;

        return (
            <div className={this.getClassName()}>
                <header className={headerClassName}>
                    <div className={titleClassName}>
                        { title }
                    </div>
                    <AccentButton
                        type="button"
                        transparent
                        iconName={iconNames.chart}
                    />
                </header>
            </div>
        );
    }
}
