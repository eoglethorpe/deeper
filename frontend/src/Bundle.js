import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';


class Bundle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mod: null,
        };
    }

    componentWillMount() {
        this.load(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.load !== this.props.load) {
            this.load(nextProps);
        }
    }

    load(props) {
        this.setState({
            mod: null,
        });

        props.load().then((mod) => {
            this.setState({
                mod: withRouter(mod.default ? mod.default : mod),
            });
        });
    }

    render() {
        return this.state.mod ? <this.state.mod {...this.props} /> : null;
    }
}

Bundle.propTypes = {
    load: PropTypes.func.isRequired,
};

export default Bundle;
