import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button, { TransparentButton } from '../../../../public/components/Button';
import EditAdminLevelForm from '../EditAdminLevelForm';
import Modal, { Header, Body } from '../../../../public/components/Modal';
import Table from '../../../../public/components/Table';
import TextInput from '../../../../public/components/TextInput';
import styles from './styles.scss';
import {
    adminLevelSelector,
} from '../../../../common/selectors/domainData';

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
    countryId: PropTypes.string.isRequired,
};

const defaultProps = {
    adminLevelList: [],
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelSelector(state, props),
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
                        <Button onClick={() => this.editAdminLevel(row)}>
                            <i className="ion-edit" />
                        </Button>
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
        const { countryId } = this.props;
        const { displayAdminLevelList } = this.state;
        const iso = countryId;

        return (
            <div styleName="country-general">
                <div styleName="form-map-container">
                    <form styleName="details-form">
                        {
                            iso &&
                            <TextInput
                                disabled
                                initialValue={iso}
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        {
                            !iso &&
                            <TextInput
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        <TextInput
                            label="Name"
                            placeholder="Nepal"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Region"
                            placeholder="Enter WB Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Income Region"
                            placeholder="Enter WB Income Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="OCHA Region"
                            placeholder="Enter OCHA Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="ECHO Region"
                            placeholder="Enter ECHO Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Region"
                            placeholder="Enter UN Geographical Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Sub Region"
                            placeholder="Enter UN Geographical Sub Region"
                            styleName="text-input"
                        />
                    </form>
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
                            <Header title="Add admin level" />
                            <Body>
                                <EditAdminLevelForm onClose={this.handleModalClose} />
                            </Body>
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
                            <Header title="Edit admin level" />
                            <Body>
                                <EditAdminLevelForm
                                    adminLevelDetail={this.state.clickedAdminLevel}
                                    onClose={this.handleModalClose}
                                />
                            </Body>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}
