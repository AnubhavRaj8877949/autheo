import axios from 'axios';
import { GRAPHQL_MESSAGES, EXCEPTION_CODES } from '../../constants';
import { Result, Exception, Response } from '../../internal';

export class GraphQLQueryBuilder {
    constructor() {
        this.operationName = '';
        this.variables = {};
        this.fields = [];
    }

    setName(name) {
        this.operationName = name;
        return this;
    }

    addVariable(name, type) {
        this.variables[name] = type;
        return this;
    }

    /**
     * @param {string} name - Field name (e.g., 'user')
     * @param {Object} [args] - Arguments map (e.g., { id: '$userId' })
     * @param {Array|string} [selections] - Fields to return (e.g., ['id', 'name', { profile: ['age'] }])
     */
    addField(name, args = null, selections = []) {
        this.fields.push({ name, args, selections });
        return this;
    }

    _parseArgs(args) {
        if (!args || Object.keys(args).length === 0) return '';
        const stringifiedArgs = Object.entries(args)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        return `(${stringifiedArgs})`;
    }

    _parseSelections(selections) {
        if (!selections || selections.length === 0) return '';
        if (typeof selections === 'string') return `{\n  ${selections}\n}`;

        let output = '{\n';
        for (const sel of selections) {
            if (typeof sel === 'string') {
                output += `  ${sel}\n`;
            } else if (typeof sel === 'object') {
                for (const [key, val] of Object.entries(sel)) {
                    output += `  ${key} ${this._parseSelections(val)}\n`;
                }
            }
        }
        output += '}';
        return output;
    }

    build() {
        const varKeys = Object.keys(this.variables);
        const varsString = varKeys.length > 0
            ? `(${varKeys.map(k => `$${k}: ${this.variables[k]}`).join(', ')})`
            : '';

        const fieldsString = this.fields.map(field => {
            const args = this._parseArgs(field.args);
            const selections = this._parseSelections(field.selections);
            const selStr = selections ? ` ${selections}` : '';
            return `${field.name}${args}${selStr}`.trim();
        }).join('\n  ');

        return `query ${this.operationName}${varsString} {\n  ${fieldsString}\n}`.trim();
    }
}


class GraphQLClient {
    /**
     * Initialize the GraphQL client singleton.
     * @param {string} [initialEndpoint]
     */
    constructor(initialEndpoint) {
        if (GraphQLClient.instance) {
            if (initialEndpoint) {
                GraphQLClient.instance.setEndpoint(initialEndpoint);
            }
            return GraphQLClient.instance;
        }

        this.endpoint = initialEndpoint || process.env.REACT_APP_SUBGRAPH_GRAPHQL_URL || '';

        this.client = axios.create({
            baseURL: this.endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Bind methods to ensure correct `this` context
        this.request = this.request.bind(this);
        this.query = this.query.bind(this);
        this.setEndpoint = this.setEndpoint.bind(this);

        GraphQLClient.instance = this;
    }

    /**
     * Function to dynamically update the GraphQL endpoint
     * @param {string} newEndpoint - The new endpoint URL
     */
    setEndpoint(newEndpoint) {
        if (!newEndpoint) return;
        this.endpoint = newEndpoint;
        this.client.defaults.baseURL = this.endpoint;
    }

    /**
     * Universal method to send a GraphQL request (Query or Mutation)
     * @param {string} query - The GraphQL query string
     * @param {Object} variables - Variables for the query
     * @returns {Promise<any>} The data object from the GraphQL response
     */
    async request(query, variables = {}) {
        if (!this.endpoint) {
            return new Result(null, false, new Exception(GRAPHQL_MESSAGES.ENDPOINT_NOT_DEFINED, EXCEPTION_CODES.GRAPHQL_ERROR));
        }

        try {
            const response = await this.client.post('', {
                query,
                variables,
            });

            if (response.data.errors) {
                const errorMsg = response.data.errors.map((error) => error.message).join('\n');
                return new Result(null, false, new Exception(errorMsg, EXCEPTION_CODES.GRAPHQL_ERROR));
            }

            return new Result(new Response(response.data.data));
        } catch (error) {
            return new Result(null, false, new Exception(error.message || GRAPHQL_MESSAGES.REQUEST_ERROR, EXCEPTION_CODES.GRAPHQL_ERROR));
        }
    }

    async query(query, variables = {}) {
        return this.request(query, variables);
    }
}

// Create a default instance. Can be configured later using setEndpoint.
const graphqlClient = new GraphQLClient();

export default graphqlClient;