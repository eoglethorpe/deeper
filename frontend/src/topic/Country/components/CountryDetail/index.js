import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import { DangerButton } from '../../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
} from '../../../../public/components/View';

import DeletePrompt from '../../../../common/components/DeletePrompt';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForCountryDelete,
    createUrlForRegion,
} from '../../../../common/rest';

import {
    tokenSelector,
    countryDetailSelector,
    unSetRegionAction,
} from '../../../../common/redux';

import CountryGeneral from '../CountryGeneral';
import CountryKeyFigures from '../CountryKeyFigures';
import CountryMediaSources from '../CountryMediaSources';
import CountryPopulationData from '../CountryPopulationData';
import CountrySeasonalCalendar from '../CountrySeasonalCalendar';
import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    }).isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    unSetRegion: PropTypes.func.isRequired,
};

const defaultProps = {
    title: '',
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    token: tokenSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    unSetRegion: params => dispatch(unSetRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Delete Modal state
            deleteCountry: false,
            deletePending: false,
        };
    }

    onClickDeleteButton = () => {
        this.setState({
            deleteCountry: true,
        });
    }

    createRequestForRegionDelete = (regionId) => {
        const urlForRegionDelete = createUrlForRegion(regionId);
        const regionDeleteRequest = new RestBuilder()
            .url(urlForRegionDelete)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForCountryDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .success(() => {
                try {
                    this.props.unSetRegion({ regionId });
                } catch (er) {
                    console.error(er);
                }
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return regionDeleteRequest;
    }

    deleteActiveCountry = () => {
        const { countryDetail } = this.props;

        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
        this.regionDeleteRequest = this.createRequestForRegionDelete(
            countryDetail.id);

        this.regionDeleteRequest.start();
    }

    // Delete Close
    handleDeleteCountryClose = () => {
        this.setState({ deleteCountry: false });
    }

    render() {
        const { deleteCountry, deletePending } = this.state;
        const { countryDetail } = this.props;

        return (
            <div styleName="country-detail">
                <div styleName="header">
                    <div styleName="header-title">
                        {countryDetail.title}
                    </div>
                    <div styleName="button-container">
                        <DangerButton onClick={this.onClickDeleteButton}>
                            Delete Country
                        </DangerButton>
                    </div>
                    <Modal
                        styleName="delete-confirm-modal"
                        closeOnEscape
                        onClose={this.handleDeleteCountryClose}
                        show={deleteCountry}
                        closeOnBlur
                    >
                        <ModalHeader title="Delete Country" />
                        <ModalBody>
                            <DeletePrompt
                                handleCancel={this.handleDeleteCountryClose}
                                handleDelete={this.deleteActiveCountry}
                                getName={() => countryDetail.title}
                                getType={() => 'Country'}
                                pending={deletePending}
                            />
                        </ModalBody>
                    </Modal>
                </div>
                <Tabs
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="general"
                        >
                            general
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="key-figures"
                        >
                            key figures
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="population-data"
                        >
                           Population data
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="seasonal-calendar"
                        >
                           Seasonal Calendar
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="media-sources"
                        >
                            Media Sources
                        </TabLink>
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <div styleName="tabs-content">
                        <TabContent
                            for="general"
                            styleName="tab"
                        >
                            <CountryGeneral countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="key-figures"
                            styleName="tab"
                        >
                            <CountryKeyFigures countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="population-data"
                            styleName="tab"
                        >
                            <CountryPopulationData countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="seasonal-calendar"
                            styleName="tab"
                        >
                            <CountrySeasonalCalendar countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="media-sources"
                            styleName="tab"
                        >
                            <CountryMediaSources countryId={countryDetail.id} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        );
    }
}
