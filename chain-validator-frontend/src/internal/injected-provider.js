export class InjectedProviderManager {
    // class properties
    static #instance = null;

    // instance properties
    #injectedProvider = null;

    /**
     * Create the InjectedProviderManager instance
     * @param {string} provideType wallet injected provider name
     * @returns {InjectedProviderManager}
     */
    static create = (provideType) => {
        // check if the provider is injected
        if (!window[provideType]) return null;

        if (this.#instance === null) {
            this.#instance = new InjectedProviderManager();
            this.#instance.#injectedProvider = window[provideType];
        }
        return this.#instance;
    };


    /**
     * Get the InjectedProviderManager instance
     * @returns {InjectedProviderManager}
     */
    static getInstance = () => {
        return this.#instance;
    };

    /**
     * destroy the InjectedProviderManager instance
     */
    static destroy = () => {
        this.#instance.#injectedProvider = null;
        this.#instance = null;
    };


    /**
     * Get the injected provider
     * @returns {any}
     */
    getInjectedProvider = () => {
        return this.#injectedProvider;
    };

    /**
     * Get the offline signer from the injected provider
     * @param {number} chainId 
     * @returns 
     */
    getOfflineSigner = (chainId) => {
        return this.#injectedProvider.getOfflineSigner(chainId);
    };

    /**
     * Get the accounts from the injected provider
     * @returns {Promise<any>}
     */
    getAccounts = async (chainId) => {
        const offlineSigner = await this.getOfflineSigner(chainId);
        return (await offlineSigner.getAccounts());
    };

    /**
     * Enable the injected provider
     * @param {number} chainId 
     */
    enable = async (chainId) => {
        await this.#injectedProvider.enable(chainId);
    };

    /**
     * Disable the injected provider
     */
    disable = async () => {
        await this.#injectedProvider.disable();
    };
};