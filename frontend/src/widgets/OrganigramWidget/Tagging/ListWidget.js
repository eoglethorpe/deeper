import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import OrgChart from '../../../vendor/react-store/components/Visualization/OrgChart';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import ListView from '../../../vendor/react-store/components/View/List/ListView';

import { iconNames } from '../../../constants';
import { afStringsSelector } from '../../../redux';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: undefined,
    attribute: {},
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
export default class OrganigramTaggingList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { attribute: { values = [] } = {} } = props;
        this.state = {
            showOrgChartModal: false,
            values,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            const { attribute: { values = [] } = {} } = nextProps;
            this.setState({
                values,
            });
        }
    }

    handleShowModal = () => {
        this.setState({ showOrgChartModal: true });
    }

    handleCancelClick = () => {
        this.setState({ showOrgChartModal: false });

        const { attribute: { values = [] } = {} } = this.props;
        this.setState({ values });
    }

    handleSaveClick = () => {
        this.setState({ showOrgChartModal: false });

        const { api, id, entryId } = this.props;
        const attribute = { values: this.state.values };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    handleSelection = (values) => {
        this.setState({ values });
    };

    idAccessor = organ => organ.key;
    labelAccessor = organ => organ.title;
    childAccessor = organ => organ.organs;

    renderOrgChartModal = () => {
        const { showOrgChartModal } = this.state;
        const { data } = this.props;

        if (!showOrgChartModal) {
            return null;
        }

        return (
            <Modal className={styles['org-chart-modal']}>
                <ModalHeader title={this.props.afStrings('organigramWidgetLabel')} />
                <ModalBody className={styles.body}>
                    <OrgChart
                        data={data}
                        labelAccessor={this.labelAccessor}
                        idAccessor={this.idAccessor}
                        childAccessor={this.childAccessor}
                        onSelection={this.handleSelection}
                        value={this.state.values}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        {this.props.afStrings('cancelButtonLabel')}
                    </Button>
                    <PrimaryButton onClick={this.handleSaveClick} >
                        {this.props.afStrings('applyButtonLabel')}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    renderSelectedOrgan = (key, data) => {
        const {
            id,
            name,
        } = data;
        const marker = '●';

        return (
            <div
                className={styles.organ}
                key={id}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { name }
                </div>
            </div>
        );
    }

    render() {
        const OrgChartModal = this.renderOrgChartModal;
        const { values } = this.state;

        return (
            <div className={styles.list}>
                <header className={styles.header}>
                    <AccentButton
                        onClick={this.handleShowModal}
                        iconName={iconNames.chart}
                        transparent
                    />
                </header>
                <ListView
                    className={styles['selected-organs']}
                    data={values}
                    modifier={this.renderSelectedOrgan}
                />
                <OrgChartModal />
            </div>
        );
    }
}
