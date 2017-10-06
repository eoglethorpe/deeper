import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Link, Route } from 'react-router-dom';

import browserHistory from '../../../common/browserHistory';
import CountryDetail from '../components/CountryDetail';
import TextInput from '../../../public/components/TextInput';
import styles from './styles.scss';
import { PrimaryButton } from '../../../public/components/Button';

const propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }).isRequired,
};

// TODO:
// Scroll to selected country

@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.countryList = [
            {
                fullName: 'Afganistan',
                iso: 'AFG',
            },
            {
                fullName: 'Nepal',
                iso: 'NPL',
            },
            {
                fullName: 'China',
                iso: 'CHI',
            },
            {
                fullName: 'India',
                iso: 'IND',
            },
            {
                fullName: 'United States of America',
                iso: 'USA',
            },
            {
                fullName: 'Russia',
                iso: 'RUS',
            },
            {
                fullName: 'Belgium',
                iso: 'BEL',
            },
            {
                fullName: 'Argentina',
                iso: 'ARG',
            },
            {
                fullName: 'Brazil',
                iso: 'BRA',
            },
            {
                fullName: 'Columbia',
                iso: 'COL',
            },
            {
                fullName: 'Cuba',
                iso: 'CUB',
            },
            {
                fullName: 'Hiati',
                iso: 'HIA',
            },
            {
                fullName: 'Bangaladeh',
                iso: 'BAN',
            },
            {
                fullName: 'Pakistan',
                iso: 'PAK',
            },
            {
                fullName: 'Bhutan',
                iso: 'BHU',
            },
            {
                fullName: 'Italy',
                iso: 'ITL',
            },
            {
                fullName: 'France',
                iso: 'FRA',
            },
            {
                fullName: 'Germany',
                iso: 'GER',
            },
        ];

        this.state = {
            displayCountryList: this.countryList,
            searchInputValue: '',
        };
    }

    goToAddCountry = () => {
        browserHistory.push('/countrypanel/');
    };

    search = (value) => {
        const caseInsensitiveSubmatch = country => (
            country.fullName.toLowerCase().includes(value.toLowerCase())
        );
        const displayCountryList = this.countryList.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
            searchInputValue: value,
        });
    };

    render() {
        const { pathname } = this.props.location;

        return (
            <div styleName="country-panel">
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
                                    key={item.iso}
                                    styleName={pathname === `/countrypanel/${item.iso}/` ? 'list-item active' : 'list-item'}
                                    to={`/countrypanel/${item.iso}/`}
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
                            this.countryList.map(item => (
                                <Route
                                    component={() => (
                                        <CountryDetail
                                            fullName={item.fullName}
                                            iso={item.iso}
                                        />
                                    )}
                                    key={item.iso}
                                    path={`/countrypanel/${item.iso}/`}
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
