import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    urlForExports,
    createUrlForExport,
    createParamsForUserExportsGET,

    transformResponseErrorToFormError,
} from '../../../common/rest';

import {
    userExportsSelector,
    setUserExportsAction,
} from '../../../common/redux';

import schema from '../../../common/schema';
import notify from '../../../common/notify';
import {
    exportStrings,
} from '../../../common/constants';

import { FgRestBuilder } from '../../../public/utils/rest';

import styles from './styles.scss';

const propTypes = {
    userExports: PropTypes.object.isRequired, //eslint-disable-line
    setUserExports: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => ({
    userExports: userExportsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserExports: params => dispatch(setUserExportsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserExports extends React.PureComponent {
    static propTypes = propTypes;

    componentWillMount() {
        this.userExportsRequest = this.createUserExportsRequest();
        this.userExportsRequest.start();
    }

    componentWillUnmount() {
        if (this.userExportsRequest) {
            this.userExportsRequest.stop();
        }
    }

    createUserExportsRequest = () => {
        const userExportsRequest = new FgRestBuilder()
            .url(urlForExports)
            .params(() => createParamsForUserExportsGET())
            .success((response) => {
                try {
                    schema.validate(response, 'userExportsGetResponse');
                    this.props.setUserExports({
                        exports: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: exportStrings.userExportsTitle,
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: exportStrings.userExportsTitle,
                    type: notify.type.ERROR,
                    message: exportStrings.userExportsFataMessage,
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userExportsRequest;
    };

    render() {
        return (
            <div styleName="user-exports">
                Exports view
            </div>
        );
    }
}
