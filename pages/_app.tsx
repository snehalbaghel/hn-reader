import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import {ReactQueryDevtools } from 'react-query/devtools'
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental'

export const dummyStorageApi = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  length: 0,
  clear: () => undefined,
  key: () => null
}

 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       cacheTime: 1000 * 60 * 60 * 24, // 24 hours
     },
   },
 })
 
 const localStoragePersistor = createWebStoragePersistor({storage: typeof window === 'undefined' ? dummyStorageApi : window.localStorage })
 
 persistQueryClient({ 
   queryClient,
   persistor: localStoragePersistor,
 })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp
