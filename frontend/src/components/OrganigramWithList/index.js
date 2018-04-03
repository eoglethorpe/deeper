import PropTypes from 'prop-types';
import React from 'react';

import OrgChart from '../../vendor/react-store/components/Visualization/OrgChart';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../vendor/react-store/components/View/Modal/Footer';
import ListInput from '../../vendor/react-store/components/Input/ListInput';

import { iconNames } from '../../constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    className: '',
    title: 'Organigram', // FIXME: use strings
    onChange: undefined,
    value: [],
};

const emptyObject = {};

export default class OrganigramWithList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static idSelector = organ => organ.id;
    static labelSelector = organ => organ.title;
    static childSelector = organ => organ.children;

    static valueKeySelector = item => item.id;
    static valueLabelSelector = item => item.name;

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            showOrgChartModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.organigramWithList,
            'organigram-with-list',
        ];

        return classNames.join(' ');
    }

    handleCancelClick = () => {
        const { value } = this.props;
        this.setState({ showOrgChartModal: false, value });
    }

    handleApplyClick = () => {
        const { value } = this.state;
        const { onChange } = this.props;

        this.setState({ showOrgChartModal: false }, () => {
            if (onChange) {
                onChange(value);
            }
        });
    }

    handleSelection = (value) => {
        this.setState({ value });
    }

    handleShowModal = () => {
        this.setState({ showOrgChartModal: true });
    }

    renderOrgChartModal = () => {
        const { showOrgChartModal, value } = this.state;
        const { title, data } = this.props;

        if (!showOrgChartModal) {
            return null;
        }

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <OrgChart
                        data={data[0] || emptyObject}
                        labelAccessor={OrganigramWithList.labelSelector}
                        idAccessor={OrganigramWithList.idSelector}
                        childAccessor={OrganigramWithList.childSelector}
                        onSelection={this.handleSelection}
                        value={value}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const {
            title,
            value,
            onChange,
        } = this.props;

        const titleClassName = `${styles.title} title`;
        const headerClassName = `${styles.header} header`;
        const OrgChartModal = this.renderOrgChartModal;

        return (
            <div className={this.getClassName()}>
                <header className={headerClassName}>
                    <div className={titleClassName}>
                        { title }
                    </div>
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.chart}
                        onClick={this.handleShowModal}
                        transparent
                    />
                </header>
                <ListInput
                    className={styles.listInput}
                    labelSelector={OrganigramWithList.valueLabelSelector}
                    keySelector={OrganigramWithList.valueKeySelector}
                    onChange={onChange}
                    value={value}
                />
                <OrgChartModal />
            </div>
        );
    }
}
