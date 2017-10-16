import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import AddLeadForm from '../../components/AddLeadForm';
import { pageTitles } from '../../../../common/utils/labels';
import { PrimaryButton } from '../../../../public/components/Button';
import styles from './styles.scss';
import dropbox from '../../../../img/dropbox.png';
import googleDrive from '../../../../img/google-drive.png';
import uploadIcon from '../../../../img/upload-icon.png';
import {
    setNavbarStateAction,
} from '../../../../common/action-creators/navbar';

const mapStateToProps = state => ({
    state,
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),

});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: { },
            formValues: { },
        };
    }
    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
            ],
        });
    }

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }


    handleOptionChange = (changeEvent) => {
        this.setState({ selectedValue: changeEvent.target.value });
    };

    render() {
        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="container">
                    <div styleName="leads-list-container">
                        <header styleName="header-title">
                            <h1>Leads Overview</h1>
                            <PrimaryButton>
                                Add New
                            </PrimaryButton>
                        </header>
                        <div styleName="list">
                            <div styleName="list-item">
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>How long until everyone is vampire?</p>
                                    <span
                                        className="ion-ios-checkmark"
                                        styleName="icon-checked"
                                    />
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Voluntary return home and coming back to the EU</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some conflict in Syria</p>
                                    <span
                                        className="ion-ios-checkmark"
                                        styleName="icon-checked"
                                    />
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some flood in Bangladesh</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some conflict in Syria</p>
                                    <span
                                        className="ion-ios-checkmark"
                                        styleName="icon-checked"
                                    />
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Malnutrition in Somalia</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Voluntary return home and coming back to the EU</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Malnutrition in Somalia</p>
                                    <span
                                        className="ion-ios-checkmark"
                                        styleName="icon-checked"
                                    />
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some flood in Bangladesh</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some conflict in Syria</p>
                                </div>
                                <div>
                                    <span
                                        className="ion-document-text"
                                        styleName="icon"
                                    />
                                    <p>Some flood in Bangladesh</p>
                                </div>
                            </div>
                        </div>
                        <div styleName="upload-container">
                            <div>
                                <img src={googleDrive} alt="DEEP" />
                                <p>Google Drive</p>
                            </div>
                            <div>
                                <img src={dropbox} alt="DEEP" />
                                <p>Dropbox</p>
                            </div>
                            <div>
                                <img src={uploadIcon} alt="DEEP" />
                                <p>Manual Upload</p>
                            </div>
                        </div>
                    </div>
                    <div styleName="leads-details-container">
                        <AddLeadForm
                            onSubmit={() => {}}
                            pending={false}
                            values={this.state.editRow}
                        />
                        <div styleName="preview-container">
                            <h2> Preview Container goes here</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
