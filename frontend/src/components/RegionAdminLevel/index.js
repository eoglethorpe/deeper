import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '../../vendor/react-store/utils/rest';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import Table from '../../vendor/react-store/components/View/Table';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    createUrlForAdminLevelsForRegion,
    createParamsForAdminLevelsForRegionGET,
    createParamsForAdminLevelDelete,
    createUrlForAdminLevel,
} from '../../rest';
import {
    adminLevelForRegionSelector,
    setAdminLevelsForRegionAction,
    unsetAdminLevelForRegionAction,
    notificationStringsSelector,
    countriesStringsSelector,
} from '../../redux';
import schema from '../../schema';
import { iconNames } from '../../constants';

import notify from '../../notify';
import EditAdminLevel from '../EditAdminLevel';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    countryId: PropTypes.number.isRequired,
    adminLevelList: PropTypes.arrayOf(
        PropTypes.shape({
            adminLevelId: PropTypes.number,
            level: PropTypes.number,
            name: PropTypes.string,
            nameProperty: PropTypes.string,
            parentNameProperty: PropTypes.string,
            parentPcodeProperty: PropTypes.string,
            podeProperty: PropTypes.string,
        }),
    ),

    setAdminLevelsForRegion: PropTypes.func.isRequired,
    unsetAdminLevelForRegion: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    adminLevelList: [],
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelForRegionSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    countriesStrings: countriesStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAdminLevelsForRegion: params => dispatch(setAdminLevelsForRegionAction(params)),
    unsetAdminLevelForRegion: params => dispatch(unsetAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RegionAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.adminLevelHeaders = [
            {
                key: 'level',
                label: this.props.countriesStrings('levelLabel'),
                order: 1,
            },
            {
                key: 'title',
                label: this.props.countriesStrings('adminLevelNameText'),
                order: 2,
            },
            {
                key: 'nameProp',
                label: this.props.countriesStrings('namePropertyLabel'),
                order: 3,
            },
            {
                key: 'codeProp',
                label: this.props.countriesStrings('pcodePropertyLabel'),
                order: 4,
            },
            {
                key: 'parentNameProp',
                label: this.props.countriesStrings('parentNamePropPlaceholder'),
                order: 5,
            },
            {
                key: 'parentCodeProp',
                label: this.props.countriesStrings('parentCodePropLabel'),
                order: 6,
            },
            {
                key: 'actions',
                label: this.props.countriesStrings('actionsLabel'),
                order: 7,
                modifier: row => (
                    <div className="action-btns">
                        <PrimaryButton
                            onClick={() => this.editAdminLevel(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <span className={iconNames.edit} />
                        </PrimaryButton>
                        <DangerButton
                            onClick={() => this.handleDeleteAdminLevel(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <span className={iconNames.delete} />
                        </DangerButton>
                    </div>
                ),
            },
        ];

        this.state = {
            addAdminLevel: false,
            clickedAdminLevel: {},
            editAdminLevel: false,
            deletePending: false,
            showDeleteModal: false,
            activeAdminLevelDelete: {},
        };

        this.requestForAdminLevelsForRegion = this.createAlsForRegionRequest(props.countryId);
    }

    componentWillMount() {
        this.requestForAdminLevelsForRegion.start();
    }

    componentWillUnmount() {
        this.requestForAdminLevelsForRegion.stop();
    }

    createAlsForRegionRequest = (regionId) => {
        const urlForAdminLevelsForRegion = createUrlForAdminLevelsForRegion(regionId);
        const requestForAdminLevelsForRegion = new BgRestBuilder()
            .url(urlForAdminLevelsForRegion)
            .params(() => createParamsForAdminLevelsForRegionGET())
            .preLoad(() => {})
            .postLoad(() => {})
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelsGetResponse');
                    this.props.setAdminLevelsForRegion({
                        adminLevels: response.results,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return requestForAdminLevelsForRegion;
    }

    createAlDeleteRequest = (adminLevelId, regionId) => {
        const urlForAdminLevel = createUrlForAdminLevel(adminLevelId);
        const requestForAdminLevelDelete = new BgRestBuilder()
            .url(urlForAdminLevel)
            .params(() => createParamsForAdminLevelDelete())
            .preLoad(() => { this.setState({ deletePending: true }); })
            .postLoad(() => { this.setState({ deletePending: false }); })
            .success(() => {
                try {
                    // FIXME: write schema
                    this.props.unsetAdminLevelForRegion({
                        adminLevelId,
                        regionId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('adminLevelDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('adminLevelDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelDeleteFatal'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return requestForAdminLevelDelete;
    }

    addAdminLevel = () => {
        this.setState({ addAdminLevel: true });
    };

    editAdminLevel = (clickedAdminLevel) => {
        this.setState({
            editAdminLevel: true,
            clickedAdminLevel,
        });
    };

    handleModalClose = () => {
        this.setState({
            editAdminLevel: false,
            addAdminLevel: false,
        });
    };

    handleDeleteAdminLevel = (row) => {
        this.setState({
            showDeleteModal: true,
            activeAdminLevelDelete: row,
        });
    }

    handleDeleteActiveAdminLevelConfirmClose = (confirm) => {
        if (confirm) {
            if (this.requestForAlDelete) {
                this.requestForAlDelete.stop();
            }
            const { activeAdminLevelDelete } = this.state;
            this.requestForAlDelete = this.createAlDeleteRequest(
                activeAdminLevelDelete.id, this.props.countryId);
            this.requestForAlDelete.start();
        }

        this.setState({
            showDeleteModal: false,
            activeAdminLevelDelete: {},
        });
    }

    keyExtractor = rowData => rowData.id

    render() {
        const { className, adminLevelList, countryId } = this.props;
        const { activeAdminLevelDelete, showDeleteModal, deletePending } = this.state;

        return (
            <div className={`${className} ${styles.adminLevels}`}>
                { deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h5>
                        {this.props.countriesStrings('adminLevelsHeader')}
                    </h5>
                    <PrimaryButton
                        iconName={iconNames.add}
                        disabled={deletePending}
                        onClick={this.addAdminLevel}
                    >
                        {this.props.countriesStrings('addAdminLevelButtonLabel')}
                    </PrimaryButton>
                    { this.state.addAdminLevel &&
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                        >
                            <ModalHeader
                                title={this.props.countriesStrings('addAdminLevelButtonLabel')}
                                rightComponent={
                                    <PrimaryButton
                                        onClick={this.handleModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </PrimaryButton>
                                }
                            />
                            <ModalBody>
                                <EditAdminLevel
                                    countryId={countryId}
                                    onClose={this.handleModalClose}
                                    adminLevelsOfRegion={adminLevelList}
                                />
                            </ModalBody>
                        </Modal>
                    }
                </div>
                <div className={styles.adminLevelsList}>
                    <Table
                        data={adminLevelList}
                        headers={this.adminLevelHeaders}
                        keyExtractor={this.keyExtractor}
                    />
                    { this.state.editAdminLevel &&
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                        >
                            <ModalHeader
                                title={this.props.countriesStrings('editAdminLevelModalTitle')}
                                rightComponent={
                                    <PrimaryButton
                                        onClick={this.handleModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </PrimaryButton>
                                }
                            />
                            <ModalBody>
                                <EditAdminLevel
                                    adminLevelDetail={this.state.clickedAdminLevel}
                                    onClose={this.handleModalClose}
                                    adminLevelsOfRegion={adminLevelList}
                                />
                            </ModalBody>
                        </Modal>
                    }
                </div>
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.handleDeleteActiveAdminLevelConfirmClose}
                >
                    <p>
                        {`${this.props.countriesStrings('removeAdminLevelConfirm')}
                        ${activeAdminLevelDelete.title}?`}
                    </p>
                </Confirm>
            </div>
        );
    }
}
