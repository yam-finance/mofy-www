import preprocess from 'svelte-preprocess';
import adapter_ipfs from 'sveltejs-adapter-ipfs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),

    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',
        adapter: adapter_ipfs({ removeBuiltInServiceWorkerRegistration: true, injectPagesInServiceWorker: true }),
        ssr: false,
        vite: () => ({
            define: {
                'process.env.NODE_ENV': {}
            }
        })
    }
};

export default config;
