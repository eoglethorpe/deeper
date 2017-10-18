import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import React from 'react';

import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import { RestBuilder } from '../../../public/utils/rest';
import {
    urlForApiDocs,
} from '../../../common/rest';


// Todo move this to common utils module
const isObjectEmpty = obj => (
    Object.keys(obj).length === 0 && obj.constructor === Object
);


@CSSModules(styles, { allowMultiple: true })
export default class ApiDocs extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            docs: {},
            expanded: [],
        };
    }

    componentWillMount() {
        this.fetchApiDocs(urlForApiDocs);
    }

    fetchApiDocs = (url) => {
        // Stop any retry action
        if (this.apiDocsRequest) {
            this.apiDocsRequest.stop();
        }

        this.apiDocsRequest = new RestBuilder()
            .url(url)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                this.setState({
                    successfullyFetched: true,
                    docs: this.preprocessDocs(response),
                    pending: false,
                });
            })
            .failure((response) => {
                console.info('FAILURE:', response);

                this.setState({
                    successfullyFetched: false,
                    pending: false,
                });
            })
            .build();

        this.setState({ pending: true });
        this.apiDocsRequest.start();
    }

    mapMethod = methodTitle => (
        {
            create: 'POST',
            destroy: 'DELETE',
            list: 'GET',
            partial_update: 'PATCH',
            retrieve: 'GET',
            update: 'PUT',
        }[methodTitle] || methodTitle
    );

    preprocessDocs = (docs) => {
        docs.apis.forEach((api) => {
            api.endpoints.sort((e1, e2) => (
                e1.title.localeCompare(e2.title)
            ));

            api.endpoints.forEach(endpoint => (
                endpoint.methods.sort((m1, m2) => (
                    m1.title.localeCompare(m2.title)
                ))
            ));
        });
        return docs;
    }

    toggleExpand = (endpoint) => {
        const key = endpoint.title;
        if (this.state.expanded.indexOf(key) === -1) {
            this.setState({
                expanded: [...this.state.expanded, key],
            });
        } else {
            this.setState({
                expanded: this.state.expanded.filter(e => e !== key),
            });
        }
    };

    renderDocs = docs => (
        <div styleName="docs">
            <h1>{docs.title}</h1>
            {docs.apis.map(api => (
                <div
                    key={api.title}
                    styleName="api"
                >
                    <h2>api-{api.title}</h2>
                    {api.endpoints.map(endpoint => this.renderEndpoint(endpoint))}
                </div>
            ))}
        </div>
    )

    renderEndpoint = endpoint => (
        <div
            key={endpoint.title}
            styleName={`
                endpoint
                ${this.state.expanded.indexOf(endpoint.title) === -1 ? '' : 'expanded'}
            `}
        >
            <h3>
                <button onClick={() => this.toggleExpand(endpoint)}>
                    {endpoint.title}
                </button>
            </h3>
            <div styleName="methods-container">
                {endpoint.methods.map(method => this.renderMethod(endpoint, method))}
            </div>
        </div>
    )

    renderMethod = (endpoint, method) => (
        <div
            key={`${endpoint.title}${method.title}`}
            styleName="method"
        >
            <h4>{this.mapMethod(method.title)}</h4>

            <p styleName="path">{method.path}</p>

            {!isObjectEmpty(method.requestSchema) && (
                <div styleName="schema">
                    <h5>Request Schema</h5>
                    {this.renderSchema(method.requestSchema)}
                </div>
            )}

            {!isObjectEmpty(method.responseSchema) && (
                <div styleName="schema">
                    <h5>Response Schema</h5>
                    {this.renderSchema(method.responseSchema)}
                </div>
            )}
        </div>
    )

    renderSchema = schema => (
        <pre>
            {JSON.stringify(schema, null, 2)}
        </pre>
    )

    render() {
        let content;
        if (this.state.pending) {
            content = (
                <p styleName="message">
                    Loading ...
                </p>
            );
        } else if (this.state.successfullyFetched) {
            content = this.renderDocs(this.state.docs);
        } else {
            content = (
                <p styleName="message">
                    You have got a problem. See a therapy?
                </p>
            );
        }

        return (
            <div>
                <Helmet>
                    <title>{ pageTitles.apiDocs }</title>
                </Helmet>
                { content }
            </div>
        );
    }
}
