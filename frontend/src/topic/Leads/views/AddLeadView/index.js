import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import AddLeadForm from '../../components/AddLeadForm';
import { pageTitles } from '../../../../common/utils/labels';
import { PrimaryButton, DangerButton } from '../../../../public/components/Button';
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
                            <h1>Leads List</h1>
                        </header>
                    </div>
                    <div styleName="leads-details-container">
                        <AddLeadForm
                            onSubmit={() => {}}
                            pending={false}
                            values={this.state.editRow}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
