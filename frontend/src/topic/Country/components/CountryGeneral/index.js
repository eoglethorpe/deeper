import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    DangerButton,
    SuccessButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';

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
    pending: PropTypes.bool,
    stale: PropTypes.bool.isRequired,
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    adminLevelList: [],
    pending: false,
    stale: false,
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
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
        };
        this.elements = [
            'countryCode',
            'countryName',
            'wbRegion',
            'wbIncomeRegion',
            'ochaRegion',
            'echoRegion',
            'unGeoRegion',
            'unGeoSubregion',
        ];
        this.validations = {
            countryCode: [requiredCondition],
            countryName: [requiredCondition],
            wbRegion: [requiredCondition],
            wbIncomeRegion: [requiredCondition],
            ochaRegion: [requiredCondition],
            echoRegion: [requiredCondition],
            unGeoRegion: [requiredCondition],
            unGeoSubregion: [requiredCondition],
        };
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
    };

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
            pending,
            stale,
        } = this.props;
        const {
            displayAdminLevelList,
            formErrors,
            formFieldErrors,
            formValues,
        } = this.state;

        return (
            <div styleName="country-general">
                <div styleName="form-map-container">
                    <Form
                        changeCallback={this.changeCallback}
                        elements={this.elements}
                        failureCallback={this.failureCallback}
                        onSubmit={this.handleSubmit}
                        successCallback={this.successCallback}
                        validation={this.validation}
                        validations={this.validations}
                        styleName="country-general-form"
                    >
                        {
                            pending &&
                                <div styleName="pending-overlay">
                                    <i
                                        className="ion-load-c"
                                        styleName="loading-icon"
                                    />
                                </div>
                        }
                        <header styleName="header-title">
                            <NonFieldErrors errors={formErrors} />
                            <div styleName="action-buttons">
                                <DangerButton
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <SuccessButton
                                    disabled={pending || !stale}
                                >
                                    Save
                                </SuccessButton>
                            </div>
                        </header>
                        {
                            countryDetail.code &&
                            <TextInput
                                disabled
                                value={countryDetail.code}
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        {
                            !countryDetail.code &&
                            <TextInput
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        <TextInput
                            label="Name"
                            formname="countryName"
                            placeholder="Nepal"
                            value={countryDetail.title}
                            error={formFieldErrors.countryName}
                        />
                        <TextInput
                            label="WB Region"
                            formname="wbRegion"
                            placeholder="Enter WB Region"
                            value={formValues.wbRegion}
                            error={formFieldErrors.wbRegion}
                        />
                        <TextInput
                            label="WB Income Region"
                            formname="wbIncomeRegion"
                            placeholder="Enter WB Income Region"
                            value={formValues.wbIncomeRegion}
                            error={formFieldErrors.wbIncomeRegion}
                        />
                        <TextInput
                            label="OCHA Region"
                            formname="ochaRegion"
                            placeholder="Enter OCHA Region"
                            value={formValues.ochaRegion}
                            error={formFieldErrors.ochaRegion}
                        />
                        <TextInput
                            label="ECHO Region"
                            formname="echoRegion"
                            placeholder="Enter ECHO Region"
                            value={formValues.echoRegion}
                            error={formFieldErrors.echoRegion}
                        />
                        <TextInput
                            label="UN Geographical Region"
                            formname="unGeoRegion"
                            placeholder="Enter UN Geographical Region"
                            value={formValues.unGeoRegion}
                            error={formFieldErrors.unGeoRegion}
                        />
                        <TextInput
                            label="UN Geographical Sub Region"
                            formname="unGeoSubregion"
                            placeholder="Enter UN Geographical Sub Region"
                            value={formValues.unGeoSubregion}
                            error={formFieldErrors.unGeoSubregion}
                        />
                    </Form>
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
