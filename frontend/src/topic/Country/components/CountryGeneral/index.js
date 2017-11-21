import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';

import {
    createParamsForUser,
    createUrlForRegion,
} from '../../../../common/rest';

import {
    countryDetailSelector,
    tokenSelector,
    setRegionDetailsAction,
} from '../../../../common/redux';

import schema from '../../../../common/schema';
import RegionDetailForm from '../../../../common/components/RegionDetailForm';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    setRegionDetails: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    token: tokenSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.requestForRegion = this.createRegionRequest(props.countryDetail.id);
    }

    componentWillMount() {
        this.requestForRegion.start();
    }

    createRegionRequest = (regionId) => {
        const regionRequest = new RestBuilder()
            .url(createUrlForRegion(regionId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionRequest;
    }

    render() {
        const {
            countryDetail,
        } = this.props;

        return (
            <div styleName="country-general">
                <div styleName="detail-map-container">
                    <RegionDetailForm
                        styleName="region-detail-form"
                        regionId={countryDetail.id}
                    />
                    <div styleName="map-container">
                        The map
                    </div>
                </div>
                <RegionAdminLevel
                    styleName="admin-levels"
                    regionId={countryDetail.id}
                />
            </div>
        );
    }
}
