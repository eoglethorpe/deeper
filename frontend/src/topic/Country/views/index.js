import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
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
import browserHistory from '../../../common/browserHistory';
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
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
        }),
    }),
    setCountries: PropTypes.func.isRequired,
    setActiveCountry: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeCountry: undefined,
    match: undefined,
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
    setActiveCountry: params => dispatch(setActiveCountryAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

const pages = Object.freeze({
    noCountries: 0,
    countryDoesNotExist: 1,
    normal: 2,
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
            renderPages: pages.noCountries,

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
        this.setState({ renderPages: pages.normal });
        const caseInsensitiveSubmatch = country => (
            country.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())
        );

        const displayCountryList = nextProps.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
        });

        const { activeCountry, countries } = nextProps;
        const { countryId } = nextProps.match.params;

        if (countries.length === 0) {
            this.setState({ renderPages: pages.noCountries });
        }

        if (countries.length > 0 && (countryId === undefined || countryId === 'undefined')) {
            let redirectTo = activeCountry;

            if (activeCountry === undefined) {
                this.props.setActiveCountry({ activeCountry: countries[0].id });
                redirectTo = countries[0].id;
            }
            this.setState({ renderPages: pages.normal });
            browserHistory.push(`/countrypanel/${redirectTo}/`);
        }

        const index = countries.findIndex(country => `${country.id}` === countryId);
        if (index === -1) {
            this.setState({ renderPages: pages.countryDoesNotExist });
        } else if (index >= 0 && countryId !== `${activeCountry}`) {
            this.props.setActiveCountry({ activeCountry: Number(countryId) });
        }
    }

    componentWillUnmount() {
        this.countriesRequest.stop();
    }

    onSelectCountry = (countryId) => {
        this.props.setActiveCountry({ activeCountry: countryId });
    }

    onBrowseCountriesClick = () => {
        this.props.setActiveCountry({ activeCountry: undefined });
        browserHistory.push('/countrypanel/undefined/');
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

    renderPageContent = (pageContent) => {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
        } = this.state;

        const { countryId } = this.props.match.params;

        switch (pageContent) {
            case pages.noCountries:
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
            case pages.countryDoesNotExist:
                return (
                    <div styleName="country-panel-not-found">
                        <h1>
                            The country you previously selected is either deleted,
                            or does not exist.
                        </h1>
                        <PrimaryButton onClick={this.onBrowseCountriesClick}>
                            Browse other countries
                        </PrimaryButton>
                    </div>
                );
            default:
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
                                        `${country.id}` === countryId ? (
                                            <ListItem
                                                key={country.id}
                                                styleName="list-item active"
                                            >
                                                <Link
                                                    styleName="link"
                                                    onClick={
                                                        () => this.props.setActiveCountry({
                                                            activeCountry: country.id,
                                                        })}
                                                    to={`/countrypanel/${country.id}/`}
                                                >
                                                    {country.title}
                                                </Link>
                                            </ListItem>
                                        ) : (
                                            <ListItem
                                                key={country.id}
                                                styleName="list-item"
                                            >
                                                <Link
                                                    styleName="link"
                                                    to={`/countrypanel/${country.id}/`}
                                                >
                                                    {country.title}
                                                </Link>
                                            </ListItem>
                                        )
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
                            <CountryDetail
                                countryId={Number(countryId)}
                            />
                        </div>
                    </div>
                );
        }
    }

    render() {
        return (this.renderPageContent(this.state.renderPages));
    }
}
