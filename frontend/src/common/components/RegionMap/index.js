import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import GeoJsonMap from '../GeoJsonMap';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForAdminLevelsForRegionGET,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
} from '../../../common/rest';
import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number.isRequired,
};
const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class RegionMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            error: false,
            adminLevels: [],
            selections: [],
        };
    }

    componentDidMount() {
        this.create();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.regionId !== nextProps.regionId) {
            this.create();
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    destroy() {
        if (this.staleRequestTimeout) {
            clearTimeout(this.staleRequestTimeout);
        }
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
    }

    create() {
        const {
            regionId,
        } = this.props;

        this.destroy();
        this.setState({ pending: true });

        const params = createParamsForAdminLevelsForRegionGET();
        const triggerUrl = createUrlForGeoAreasLoadTrigger(regionId);
        const adminLevelsUrl = createUrlForAdminLevelsForRegion(regionId);

        this.staleCheckCount = 0;
        this.triggerRequest = this.createRequest(
            triggerUrl,
            params,
            () => {
                console.log(`Triggered geo areas loading task for ${regionId}`);
                this.tryRequestToCheckStale();
            },
        );

        this.adminLevelsRequest = this.createRequest(
            adminLevelsUrl,
            params,
            (response) => {
                const stale = response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false);

                if (stale) {
                    if (this.staleCheckCount === 0) {
                        this.triggerRequest.start();
                    } else {
                        this.staleRequestTimeout = setTimeout(() => {
                            this.tryRequestToCheckStale();
                        }, 500);
                    }
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        adminLevels: response.results,
                    });
                }
            },
        );

        this.adminLevelsRequest.start();
    }

    tryRequestToCheckStale(maxCount = 20) {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }

        if (this.staleCheckCount === maxCount) {
            this.setState({
                pending: false,
                error: undefined,
                adminLevels: [],
            });
            return;
        }

        this.staleCheckCount += 1;
        this.adminLevelsRequest.start();
    }

    createRequest = (url, params, onSuccess) => (
        new FgRestBuilder()
            .url(url)
            .params(params)
            .success((response) => {
                try {
                    onSuccess(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
                });
            })
            .build()
    )

    handleAreaClick = (code) => {
        const selections = [...this.state.selections];
        const index = selections.indexOf(code);

        if (index === -1) {
            selections.push(code);
        } else {
            selections.splice(index, 1);
        }

        this.setState({ selections });
    }

    renderContent() {
        const {
            error,
            adminLevels,
            selections,
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (adminLevels && adminLevels.length > 0) {
            return (
                <GeoJsonMap
                    selections={selections}
                    styleName="geo-json-map"
                    url={createUrlForGeoJsonMap(adminLevels[0].id)}
                    onAreaClick={this.handleAreaClick}
                />
            );
        }

        return (
            <div styleName="message">
                Map not available
            </div>
        );
    }

    render() {
        const {
            className,
        } = this.props;
        const {
            pending,
        } = this.state;

        return (
            <div
                className={className}
                styleName="region-map"
            >
                {
                    (pending && (
                        <LoadingAnimation />
                    )) || (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
