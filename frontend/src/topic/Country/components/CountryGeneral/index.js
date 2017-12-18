import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';

import {
    createParamsForUser,
    createUrlForRegionWithField,
} from '../../../../common/rest';

import {
    countryDetailSelector,
    setRegionDetailsAction,
    activeUserSelector,
} from '../../../../common/redux';

import schema from '../../../../common/schema';
import RegionDetail from '../../../../common/components/RegionDetail';
import RegionDetailView from '../../../../common/components/RegionDetailView';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';
import GeoMap from '../../../../common/components/GeoMap';

import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    activeUser: activeUserSelector(state),
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

        this.state = {
            dataLoading: true,
        };

        this.requestForRegion = this.createRegionRequest(props.countryDetail.id);
    }

    componentWillMount() {
        this.requestForRegion.start();
    }

    createRegionRequest = (regionId) => {
        const urlForRegionForRegionalGroups = createUrlForRegionWithField(regionId, ['regional_groups']);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegionForRegionalGroups)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ dataLoading: true }); })
            .postLoad(() => { this.setState({ dataLoading: false }); })
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
            activeUser,
        } = this.props;

        const { dataLoading } = this.state;

        return (
            <div styleName="country-general">
                { activeUser.isSuperuser &&
                    <div styleName="details-edit">
                        <div styleName="detail-map-container">
                            <RegionDetail
                                styleName="region-detail-form"
                                regionId={countryDetail.id}
                                dataLoading={dataLoading}
                            />
                            <div styleName="map-container">
                                <GeoMap />
                            </div>
                        </div>
                        <RegionAdminLevel
                            styleName="admin-levels"
                            regionId={countryDetail.id}
                        />
                    </div>
                }
                { !activeUser.isSuperuser &&
                    <div styleName="details-no-edit">
                        <RegionDetailView regionId={countryDetail.id} />
                        <div styleName="map-container">
                            The map
                        </div>
                    </div>
                }
            </div>
        );
    }
}
