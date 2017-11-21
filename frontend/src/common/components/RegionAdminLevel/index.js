import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TransparentButton,
    TransparentPrimaryButton,
    PrimaryButton,
    TransparentAccentButton,
} from '../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../public/components/View';

import {
    adminLevelForRegionSelector,
} from '../../../common/redux';

import EditAdminLevel from '../EditAdminLevel';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
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
};

const defaultProps = {
    className: '',
    adminLevelList: [],
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelForRegionSelector(state, props),
    state,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
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
                key: 'name',
                label: 'Admin Level Name',
                order: 2,
            },
            {
                key: 'nameProperty',
                label: 'Name Property',
                order: 3,
            },
            {
                key: 'pcodeProperty',
                label: 'Pcode Property',
                order: 4,
            },
            {
                key: 'parentNameProperty',
                label: 'Parent Name Property',
                order: 5,
            },
            {
                key: 'parentPcodeProperty',
                label: 'Parent Pcode Property',
                order: 6,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
                modifier: row => (
                    <div className="action-btns">
                        <TransparentButton onClick={() => this.editAdminLevel(row)}>
                            <i
                                className="ion-edit edit"
                            />
                        </TransparentButton>
                        <TransparentButton onClick={() => this.deleteAdminLevel(row)}>
                            <i
                                className="ion-ios-trash delete"
                            />
                        </TransparentButton>
                    </div>
                ),
            },
        ];

        this.state = {
            addAdminLevel: false,
            clickedAdminLevel: {},
            displayAdminLevelList: this.props.adminLevelList,
            editAdminLevel: false,
        };
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

    render() {
        const {
            displayAdminLevelList,
        } = this.state;
        const { className } = this.props;

        return (
            <div
                className={className}
                styleName="admin-levels"
            >
                <div styleName="header">
                    Admin Levels
                    <PrimaryButton
                        iconName="ion-plus"
                        onClick={this.addAdminLevel}
                    >
                        Add admin level
                    </PrimaryButton>
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addAdminLevel}
                    >
                        <ModalHeader title="Add admin level" />
                        <ModalBody>
                            <EditAdminLevel onClose={this.handleModalClose} />
                        </ModalBody>
                    </Modal>
                </div>
                <div styleName="admin-levels-list">
                    <Table
                        data={displayAdminLevelList}
                        headers={this.adminLevelHeaders}
                        keyExtractor={rowData => rowData.adminLevelId}
                    />
                    <Modal
                        styleName="edit-admin-modal"
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.editAdminLevel}
                        closeOnBlur
                    >
                        <ModalHeader title="Edit admin level" />
                        <ModalBody>
                            <EditAdminLevel
                                adminLevelDetail={this.state.clickedAdminLevel}
                                onClose={this.handleModalClose}
                            />
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        );
    }
}
