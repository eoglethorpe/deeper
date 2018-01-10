import CSSModules from 'react-css-modules';
import React from 'react';

import {
    List,
    ListView,
} from '../../../public/components/View';
import { FgRestBuilder } from '../../../public/utils/rest';
import { isObjectEmpty } from '../../../public/utils/common';
import { apiStrings } from '../../../common/constants';

import { urlForApiDocs } from '../../../common/rest';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class ApiDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            docs: {},
            expanded: [],
            pending: true,
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

        this.apiDocsRequest = new FgRestBuilder()
            .url(url)
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                // FIXME: write schema
                this.setState(
                    { docs: this.preprocessDocs(response) },
                    () => console.log(this.state.docs),
                );
            })
            .failure((response) => {
                console.error('FAILURE:', response);
            })
            .fatal((response) => {
                console.error('FATAL:', response);
            })
            .build();

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

    calcApiKey = api => api.title
    calcEndpointKey = method => method.title
    calcMethodKey = method => method.title

    renderDocs = docs => (
        <div styleName="docs">
            <h1>{docs.title}</h1>
            <List
                data={docs.apis}
                keyExtractor={this.calcApiKey}
                modifier={this.renderApi}
            />
        </div>
    )

    renderApi = (key, api) => (
        <div
            key={key}
            className={styles.api}
        >
            <h2>api-{api.title}</h2>
            <List
                data={api.endpoints}
                keyExtractor={this.calcEndpointKey}
                modifier={this.renderEndpoint}
            />
        </div>
    )

    renderEndpoint = (key, endpoint) => (
        <div
            key={key}
            className={`
                ${styles.endpoint}
                ${this.state.expanded.indexOf(endpoint.title) === -1 ? '' : styles.expanded}
            `}
        >
            <h3>
                <button onClick={() => this.toggleExpand(endpoint)}>
                    {endpoint.title}
                </button>
            </h3>
            <ListView
                className={styles['methods-container']}
                data={endpoint.methods}
                modifier={this.renderMethod}
                keyExtractor={this.calcMethodKey}
            />
        </div>
    )

    renderMethod = (key, method) => (
        <div
            key={key}
            className={styles.method}
        >
            <h4>
                {this.mapMethod(method.title)}
            </h4>
            <p className={styles.path}>
                {method.path}
            </p>

            {!isObjectEmpty(method.requestSchema) && (
                <div className={styles.schema}>
                    <h5>
                        {apiStrings.requestSchemaLabel}
                    </h5>
                    {this.renderSchema(method.requestSchema)}
                </div>
            )}

            {!isObjectEmpty(method.responseSchema) && (
                <div className={styles.schema}>
                    <h5>
                        {apiStrings.responseSchemaLabel}
                    </h5>
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
        const {
            pending,
            docs,
        } = this.state;
        let content;
        if (pending) {
            content = (
                <p styleName="message">
                    {apiStrings.loadingLabel}
                </p>
            );
        } else {
            content = this.renderDocs(docs);
        }

        return (
            <div className={styles['api-docs']}>
                { content }
            </div>
        );
    }
}
