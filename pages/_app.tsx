import '../styles/globals.css';
import {createTelemetryClient, TelemetryProvider} from '../lib/telemetry';
import { Provider } from 'next-auth/client';
import { appWithTranslation } from 'next-i18next'

function MyApp({ Component, pageProps }) {
  return (
      <TelemetryProvider value={createTelemetryClient()}>
        <Provider session={pageProps.session}>
            <Component {...pageProps} />
        </Provider>
      </TelemetryProvider>
  );
}

export default appWithTranslation(MyApp);
