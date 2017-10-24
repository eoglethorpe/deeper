import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import AddLeadForm from '../../components/AddLeadForm';
import { pageTitles } from '../../../../common/utils/labels';
import styles from './styles.scss';
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
            leads: [],
            counter: 1,
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
    onWebsiteClickHandler = () => {
        console.log('Website');
        this.setState({
            leads: [
                ...this.state.leads,
                {
                    key: 4,
                    type: 'Website',
                    title: `Leads #${this.state.counter}`,
                },
            ],
            counter: this.state.counter + 1,
        });
    };

    onManualEntryClickHandler = () => {
        console.log('Manual Entry');
        this.setState({
            leads: [
                ...this.state.leads,
                {
                    key: 4,
                    type: 'manualEntry',
                    title: `Leads #${this.state.counter}`,
                },
            ],
            counter: this.state.counter + 1,
        });
    };

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
                        </header>
                        <div styleName="list">
                            <div styleName="list-item">
                                {
                                    this.state.leads.map(lead => (
                                        <div key={lead.key}>
                                            <span
                                                className="ion-document-text"
                                                styleName="icon"
                                            />
                                            <p>{lead.title}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div styleName="upload-container">
                            <div
                                onClick={this.onClickHandler}
                                role="presentation"
                            >
                                <span
                                    className="ion-social-google"
                                />
                                <p>Google Drive</p>
                            </div>
                            <div
                                onClick={this.onClickHandler}
                                role="presentation"
                            >
                                <span
                                    className="ion-social-dropbox"
                                />
                                <p>Dropbox</p>
                            </div>
                            <div
                                onClick={this.onClickHandler}
                                role="presentation"
                            >
                                <span
                                    className="ion-android-upload"

                                />
                                <p>Upload</p>
                            </div>
                            <div
                                onClick={this.onWebsiteClickHandler}
                                role="presentation"
                            >
                                <span
                                    className="ion-earth"
                                />
                                <p>Website</p>
                            </div>
                            <div
                                onClick={this.onManualEntryClickHandler}
                                role="presentation"
                            >
                                <span
                                    className="ion-clipboard"
                                />
                                <p>Manual Entry</p>
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
