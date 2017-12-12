import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    PrimaryButton,
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Confirm,
    Table,
    LoadingAnimation,
} from '../../../public/components/View';

import { BgRestBuilder } from '../../../public/utils/rest';
import schema from '../../../common/schema';
import {
    createUrlForAdminLevelsForRegion,
    createParamsForAdminLevelsForRegionGET,
    createParamsForAdminLevelDelete,
    createUrlForAdminLevel,
} from '../../../common/rest';
import {
    adminLevelForRegionSelector,
    setAdminLevelsForRegionAction,
    unsetAdminLevelForRegionAction,
} from '../../../common/redux';
import {
    iconNames,
} from '../../../common/constants';

import EditAdminLevel from '../EditAdminLevel';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number.isRequired,
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
};

const defaultProps = {
    className: '',
    adminLevelList: [],
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelForRegionSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAdminLevelsForRegion: params => dispatch(setAdminLevelsForRegionAction(params)),
    unsetAdminLevelForRegion: params => dispatch(unsetAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class RegionAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.adminLevelHeaders = [
            {
                key: 'level',
                label: 'Level',
                order: 1,
            },
            {
                key: 'title',
                label: 'Admin Level Name',
                order: 2,
            },
            {
                key: 'nameProp',
                label: 'Name Property',
                order: 3,
            },
            {
                key: 'codeProp',
                label: 'Pcode Property',
                order: 4,
            },
            {
                key: 'parentNameProp',
                label: 'Parent Name Property',
                order: 5,
            },
            {
                key: 'parentCodeProp',
                label: 'Parent Pcode Property',
                order: 6,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
                modifier: row => (
                    <div className="action-btns">
                        <TransparentPrimaryButton onClick={() => this.editAdminLevel(row)}>
                            <span className={iconNames.edit} />
                        </TransparentPrimaryButton>
                        <TransparentDangerButton onClick={() => this.handleDeleteAdminLevel(row)}>
                            <span className={iconNames.delete} />
                        </TransparentDangerButton>
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

        this.requestForAdminLevelsForRegion = this.createAlsForRegionRequest(props.regionId);
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
                    this.props.unsetAdminLevelForRegion({
                        adminLevelId,
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

    deleteActiveAdminLevel = (confirm) => {
        if (confirm) {
            if (this.requestForAlDelete) {
                this.requestForAlDelete.stop();
            }
            const { activeAdminLevelDelete } = this.state;
            this.requestForAlDelete = this.createAlDeleteRequest(
                activeAdminLevelDelete.id, this.props.regionId);
            this.requestForAlDelete.start();
        }

        this.setState({
            showDeleteModal: false,
            activeAdminLevelDelete: {},
        });
    }

    keyExtractor = rowData => rowData.id

    render() {
        const { className, adminLevelList, regionId } = this.props;
        const { activeAdminLevelDelete, showDeleteModal, deletePending } = this.state;

        return (
            <div
                className={className}
                styleName="admin-levels"
            >
                { deletePending && <LoadingAnimation /> }
                <div styleName="header">
                    <h5>Admin Levels</h5>
                    <PrimaryButton
                        iconName={iconNames.add}
                        disabled={deletePending}
                        onClick={this.addAdminLevel}
                    >
                        Add admin level
                    </PrimaryButton>
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addAdminLevel}
                    >
                        <ModalHeader
                            title="Add admin level"
                            rightComponent={
                                <TransparentPrimaryButton
                                    onClick={this.handleModalClose}
                                >
                                    <span className={iconNames.close} />
                                </TransparentPrimaryButton>
                            }
                        />
                        <ModalBody>
                            <EditAdminLevel
                                regionId={regionId}
                                onClose={this.handleModalClose}
                                adminLevelsOfRegion={adminLevelList}
                            />
                        </ModalBody>
                    </Modal>
                </div>
                <div styleName="admin-levels-list">
                    <Table
                        data={adminLevelList}
                        headers={this.adminLevelHeaders}
                        keyExtractor={this.keyExtractor}
                    />
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.editAdminLevel}
                    >
                        <ModalHeader
                            title="Edit admin level"
                            rightComponent={
                                <TransparentPrimaryButton
                                    onClick={this.handleModalClose}
                                >
                                    <span className={iconNames.close} />
                                </TransparentPrimaryButton>
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
                </div>
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.deleteActiveAdminLevel}
                >
                    <p>{`Are you sure you want to remove admin level
                        ${activeAdminLevelDelete.title}?`}</p>
                </Confirm>
            </div>
        );
    }
}
