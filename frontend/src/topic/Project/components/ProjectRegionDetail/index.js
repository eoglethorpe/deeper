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
    tokenSelector,

    regionDetailForRegionSelector,
    setRegionDetailsAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import RegionDetailForm from '../../../../common/components/RegionDetailForm';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    regionId: PropTypes.number.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    regionDetails: PropTypes.object.isRequired, // eslint-disable-line
    setRegionDetails: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    regionDetails: regionDetailForRegionSelector(state, props),
    token: tokenSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.regionRequest = this.createRegionRequest(props.regionId);
    }

    componentWillMount() {
        this.regionRequest.start();
    }

    componentWillUnmount() {
        if (this.regionRequest) {
            this.regionRequest.stop();
        }
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
    };

    render() {
        const {
            regionId,
            regionDetails,
        } = this.props;

        return (
            <div styleName="region-details">
                <div styleName="form-map-container">
                    <RegionDetailForm
                        styleName="country-general-form"
                        regionDetail={regionDetails}
                    />
                    <div styleName="map-container">
                        The map
                    </div>
                </div>
                <RegionAdminLevel
                    regionId={regionId}
                />
            </div>
        );
    }
}
