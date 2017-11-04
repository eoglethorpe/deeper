import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Link, Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import CountryDetail from '../components/CountryDetail';
import Form, {
    requiredCondition,
} from '../../../public/components/Form';
import Modal, { Header } from '../../../public/components/Modal';
import ListView, { ListItem } from '../../../public/components/ListView';
import TextInput from '../../../public/components/TextInput';
import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import { RestBuilder } from '../../../public/utils/rest';
import { PrimaryButton, DangerButton } from '../../../public/components/Button';
import {
    tokenSelector,
} from '../../../common/selectors/auth';
import {
    activeCountrySelector,
    countriesSelector,
} from '../../../common/selectors/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    setActiveCountryAction,
    setCountriesAction,
} from '../../../common/action-creators/domainData';
import {
    createParamsForUser,
    urlForCountries,
} from '../../../common/rest';
import schema from '../../../common/schema';

// NOTE: is Required removed by @frozenhelium
const propTypes = {
    activeCountry: PropTypes.number,
    countries: PropTypes.array, // eslint-disable-line
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }),
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
    setCountries: PropTypes.func.isRequired,
    setActiveCountry: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeCountry: undefined,
    location: {},
    countries: [],
};

// TODO:
// Scroll to selected country

const mapStateToProps = state => ({
    activeCountry: activeCountrySelector(state),
    countries: countriesSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCountries: params => dispatch(setCountriesAction(params)),
    setActiveProject: params => dispatch(setActiveCountryAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            addCountryModal: false,
            displayCountryList: this.props.countries,
            searchInputValue: '',

            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        };

        this.elements = [
            'name',
            'code',
        ];
        this.validations = {
            name: [requiredCondition],
            code: [requiredCondition],
        };
        const { token } = this.props;
        this.countriesRequest = new RestBuilder()
            .url(urlForCountries)
            .params(() => {
                const { access } = token;
                return createParamsForUser({ access });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'countriesGetResponse');
                    this.props.setCountries({
                        countries: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
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
                pageTitles.projectPanel,
                pageTitles.countryPanel,
            ],
        });
        this.countriesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const caseInsensitiveSubmatch = country => (
            country.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())
        );
        const displayCountryList = nextProps.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
        });
    }

    onSelectCountry = (countryId) => {
        this.props.setActiveCountry({ activeCountry: countryId });
    }

    onAddCountry = () => {
        this.setState({
            addCountryModal: true,
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        });
    };

    getStyleName = (countryId) => {
        const linkId = this.props.match.params.countryId;

        const styleNames = [];
        styleNames.push('list-item');

        if (linkId === `${countryId}`) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    componentWillUnMount() {
        this.countriesRequest.stop();
    }

    search = (value) => {
        const caseInsensitiveSubmatch = country => (
            country.title.toLowerCase().includes(value.toLowerCase())
        );
        const displayCountryList = this.props.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
            searchInputValue: value,
        });
    };

    keySelector = data => (data.countryId)

    handleModalClose = () => {
        this.setState({
            addCountryModal: false,
        });
    };

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (data) => {
        console.log(data);

        // Rest Request goes here
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
        } = this.state;

        const { pathname } = this.props.location;
        const { activeCountry } = this.props;

        if (this.props.countries.length === 0) {
            return (
                <div styleName="country-panel-empty">
                    <Helmet>
                        <title>{ pageTitles.countryPanel }</title>
                    </Helmet>
                    <h1>No added countries yet. Mark your terretories.</h1>
                    <h1>Arey country nahi hai re jadau</h1>
                    <PrimaryButton
                        iconName="ion-plus"
                        onClick={this.onAddCountry}
                    >
                        Add country
                    </PrimaryButton>
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addCountryModal}
                        closeOnBlur
                    >
                        <Header title="Add new country" />
                        <Form
                            styleName="add-country-form"
                            changeCallback={this.changeCallback}
                            elements={this.elements}
                            failureCallback={this.failureCallback}
                            successCallback={this.successCallback}
                            validation={this.validation}
                            validations={this.validations}
                            onSubmit={this.handleSubmit}
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
                            <div styleName="non-field-errors">
                                {
                                    formErrors.map(err => (
                                        <div
                                            key={err}
                                            styleName="error"
                                        >
                                            {err}
                                        </div>
                                    ))
                                }
                                { formErrors.length <= 0 &&
                                    <div styleName="error empty">
                                        -
                                    </div>
                                }
                            </div>
                            <TextInput
                                label="Country Name"
                                formname="name"
                                placeholder="Enter county name"
                                initialValue={formValues.name}
                                error={formFieldErrors.name}
                            />
                            <TextInput
                                label="Code"
                                formname="code"
                                placeholder="Enter country code"
                                initialValue={formValues.code}
                                error={formFieldErrors.code}
                            />
                            <div styleName="action-buttons">
                                <DangerButton
                                    onClick={this.handleModalClose}
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <PrimaryButton disabled={pending || !stale} >
                                    Save changes
                                </PrimaryButton>
                            </div>
                        </Form>
                    </Modal>
                </div>
            );
        }

        if (this.props.countries.length > 0 && this.props.match.params.countryId === undefined) {
            let redirectTo = activeCountry;

            if (activeCountry === undefined) {
                setActiveCountryAction(this.props.countries[0].id);
                redirectTo = this.props.countries[0].id;
            }
            return (
                <Redirect
                    to={{
                        pathname: `/countrypanel/${redirectTo}/`,
                        from: location,
                    }}
                />
            );
        }

        return (
            <div styleName="country-panel">
                <Helmet>
                    <title>{ pageTitles.countryPanel }</title>
                </Helmet>
                <div styleName="country-list">
                    <div styleName="list-header">
                        <div styleName="header-text">
                            Countries
                        </div>
                        <PrimaryButton
                            iconName="ion-plus"
                            onClick={this.onAddCountry}
                        >
                            Add country
                        </PrimaryButton>
                        <TextInput
                            onChange={this.search}
                            placeholder="Search Country"
                            type="search"
                        />
                    </div>

                    <ListView styleName="list">
                        {
                            this.state.displayCountryList.map(country => (
                                <ListItem
                                    key={country.id}
                                    styleName={this.getStyleName(country.id)}
                                >
                                    <Link
                                        styleName="link"
                                        to={`/countrypanel/${country.id}/`}
                                    >
                                        {country.title}
                                    </Link>
                                </ListItem>
                            ))
                        }
                    </ListView>
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addCountryModal}
                        closeOnBlur
                    >
                        <Header title="Add new country" />
                        <Form
                            styleName="add-country-form"
                            changeCallback={this.changeCallback}
                            elements={this.elements}
                            failureCallback={this.failureCallback}
                            successCallback={this.successCallback}
                            validation={this.validation}
                            validations={this.validations}
                            onSubmit={this.handleSubmit}
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
                            <div styleName="non-field-errors">
                                {
                                    formErrors.map(err => (
                                        <div
                                            key={err}
                                            styleName="error"
                                        >
                                            {err}
                                        </div>
                                    ))
                                }
                                { formErrors.length <= 0 &&
                                    <div styleName="error empty">
                                        -
                                    </div>
                                }
                            </div>
                            <TextInput
                                label="Country Name"
                                formname="name"
                                placeholder="Enter county name"
                                initialValue={formValues.name}
                                error={formFieldErrors.name}
                            />
                            <TextInput
                                label="Code"
                                formname="code"
                                placeholder="Enter country code"
                                initialValue={formValues.code}
                                error={formFieldErrors.code}
                            />
                            <div styleName="action-buttons">
                                <DangerButton
                                    onClick={this.handleModalClose}
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <PrimaryButton disabled={pending || !stale} >
                                    Save changes
                                </PrimaryButton>
                            </div>
                        </Form>
                    </Modal>
                </div>
                <div styleName="country-details">
                    <Switch>
                        {
                            this.props.countries.map(item => (
                                <Route
                                    component={() => (
                                        <CountryDetail
                                            fullName={item.title}
                                            countryId={item.id}
                                        />
                                    )}
                                    key={item.id}
                                    path={`/countrypanel/${item.id}/`}
                                />
                            ))
                        }
                    </Switch>
                </div>
            </div>
        );
    }
}
