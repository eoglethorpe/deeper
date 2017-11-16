import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TransparentButton,
} from '../../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';
import RegionDetailForm from '../../../../common/components/RegionDetailForm';

import {
    adminLevelSelector,
    countryDetailSelector,
} from '../../../../common/redux';

import EditAdminLevelForm from '../EditAdminLevelForm';
import styles from './styles.scss';

const propTypes = {
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
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    adminLevelList: [],
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelSelector(state, props),
    countryDetail: countryDetailSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.adminLevelHeaders = [
            {
                key: 'level',
                label: 'Admin Level',
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
            countryDetail,
        } = this.props;
        const {
            displayAdminLevelList,
        } = this.state;

        return (
            <div styleName="country-general">
                <div styleName="form-map-container">
                    <RegionDetailForm
                        styleName="country-general-form"
                        countryDetail={countryDetail}
                    />
                    <div styleName="map-container">
                        The map
                    </div>
                </div>
                <div styleName="admin-levels">
                    <div styleName="header">
                        Admin Levels
                        <TransparentButton onClick={this.addAdminLevel}>
                            Add admin level
                        </TransparentButton>
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                            show={this.state.addAdminLevel}
                        >
                            <ModalHeader title="Add admin level" />
                            <ModalBody>
                                <EditAdminLevelForm onClose={this.handleModalClose} />
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
                                <EditAdminLevelForm
                                    adminLevelDetail={this.state.clickedAdminLevel}
                                    onClose={this.handleModalClose}
                                />
                            </ModalBody>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}
