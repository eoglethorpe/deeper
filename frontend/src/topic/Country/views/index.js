import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Link, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import browserHistory from '../../../common/browserHistory';
import CountryDetail from '../components/CountryDetail';
import TextInput from '../../../public/components/TextInput';
import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import { PrimaryButton } from '../../../public/components/Button';
import {
    countriesSelector,
} from '../../../common/selectors/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';

const propTypes = {
    // NOTE: is Required removed by @frozenhelium
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }),
    countries: PropTypes.array, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
    location: {},
    countries: [],
};

// TODO:
// Scroll to selected country

const mapStateToProps = state => ({
    countries: countriesSelector(state),
});

const mapDispatchToProps = dispatch => ({
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
            displayCountryList: this.props.countries,
            searchInputValue: '',
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
                pageTitles.projectPanel,
                pageTitles.countryPanel,
            ],
        });
    }

    goToAddCountry = () => {
        browserHistory.push('/countrypanel/');
    };

    search = (value) => {
        const caseInsensitiveSubmatch = country => (
            country.fullName.toLowerCase().includes(value.toLowerCase())
        );
        const displayCountryList = this.props.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
            searchInputValue: value,
        });
    };

    render() {
        const { pathname } = this.props.location;

        return (
            <div styleName="country-panel">
                <Helmet>
                    <title>{ pageTitles.countryPanel }</title>
                </Helmet>
                <div styleName="country-list">
                    <div styleName="list-header">
                        <div styleName="header-text">
                            Countires
                        </div>
                        <PrimaryButton onClick={this.goToAddCountry}>
                            + Add country
                        </PrimaryButton>
                        <TextInput
                            onChange={this.search}
                            placeholder="Search Country"
                            type="search"
                        />
                    </div>
                    <div styleName="list">
                        {
                            this.state.displayCountryList.map(item => (
                                <Link
                                    key={item.countryId}
                                    styleName={pathname === `/countrypanel/${item.countryId}/` ? 'list-item active' : 'list-item'}
                                    to={`/countrypanel/${item.countryId}/`}
                                >
                                    {item.fullName}
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div styleName="country-details">
                    <Switch>
                        {
                            this.props.countries.map(item => (
                                <Route
                                    component={() => (
                                        <CountryDetail
                                            fullName={item.fullName}
                                            countryId={item.countryId}
                                        />
                                    )}
                                    key={item.countryId}
                                    path={`/countrypanel/${item.countryId}/`}
                                />
                            ))
                        }
                        <Route
                            component={() => (
                                <CountryDetail fullName="Add new country" />
                            )}
                            path="/countrypanel/"
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
