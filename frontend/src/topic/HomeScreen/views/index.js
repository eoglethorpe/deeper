import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { pageTitles } from '../../../common/utils/labels';
import { ImageInput } from '../../../public/components/FileInput';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';

import styles from './styles.scss';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;

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
                pageTitles.projectPanel,
            ],
        });
    }

    render() {
        return (
            <div styleName="home-screen">
                <Helmet>
                    <title>{ pageTitles.dashboard }</title>
                </Helmet>
                <div>
                    <ImageInput
                        styleName="image-input"
                        showPreview
                    />
                </div>
            </div>
        );
    }
}
