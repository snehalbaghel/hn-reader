import axios from 'axios'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { useQueries, useQuery } from 'react-query'
import { ArticleList } from '../components/ArticleList'
import { HN_API_ENDPOINT } from '../constants'
import HNIcon from '../public/hackernews.svg'

const navigation = [
  { name: 'top', href: '/topstories' },
  { name: 'new', href: '/newstories' },
  { name: 'best', href: '/beststories' },
  { name: 'ask', href: '/askstories' },
  { name: 'show', href: '/showstories' },
  { name: 'jobs', href: '/jobstories' }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const PAGE_SIZE = 14

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageType = context.query.type
  const allItems = await axios.get<number[]>(HN_API_ENDPOINT + `${pageType}.json`)
  const initialData = allItems.data

  return {
    props: {
      pageType,
      allItems: initialData
    }, // will be passed to the page component as props
  }
}

const MainPage: NextPage<{ pageType?: string, allItems: number[] }> = ({ pageType, allItems: allItemsInitial }) => {
  const { query, push } = useRouter()
  const queryObj = (query as { page?: string, type?: string })
  
  const page = parseInt(queryObj.page ?? '1')
  
  const { data: allItemIds } = useQuery(
    pageType ?? '',
    async ({ signal }) =>
      (await axios.get<number[]>(HN_API_ENDPOINT + `${pageType}.json`, {
        signal,
      })).data,
    { cacheTime: 600000, refetchOnWindowFocus: false, enabled: !!pageType, initialData: allItemsInitial  }
  )

  const isFirstPage = useMemo(() => page === 1, [page])
  const [isLastPage, setIsLastPage] = useState(false)

  useEffect(() => {
    setIsLastPage(page + 1 > (allItemIds?.length ?? 1) / PAGE_SIZE)
  }, [allItemIds?.length, page])

  const queries = useQueries(
    allItemIds
      ?.slice((PAGE_SIZE * (page -1)), PAGE_SIZE * page)
      .map((itemId) => ({
        queryKey: ['item', itemId],
        queryFn: async () =>
          (await axios.get(
            HN_API_ENDPOINT + `item/${itemId.toString()}.json`
          )) ?? null,
        enabled: Number.isInteger(itemId),
        cacheTime: 600000 + Math.random() * 6000 * 2,
        refetchOnWindowFocus: false
      })) ?? []
  )

  return (
    <>
      <div className="min-h-full w-full">
        <header className="bg-orange-600 pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="py-5">
                <div className="col-span-2">
                  <nav className="flex items-center space-x-4 flex-wrap gap-1">
                    <HNIcon className="h-9 w-9" />
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.href === `/${pageType}`
                            ? 'bg-black bg-opacity-10 text-white'
                            : 'text-orange-100',
                          'rounded-md px-3 py-2 text-sm font-medium hover:bg-black hover:bg-opacity-5'
                        )}
                        aria-current={item.href === `/${pageType}`  ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
            </div>
          </div>
        </header>
        <main className="-mt-24 h-full pb-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="flex flex-col space-y-3">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <h2 className="sr-only" id="section-1-title">
                    ask
                  </h2>
                  <div className="overflow-hidden rounded-lg bg-white shadow min-h-screen">
                    <div className="p-2">
                      <ArticleList
                        items={queries
                          .map((query) => query.data?.data)
                          .filter((item) => !!item)}
                      />
                    </div>
                  </div>
                </section>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end">
                <button
                  disabled={isFirstPage}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 
                ${isFirstPage ? 'bg-gray-50 text-gray-300' : ''}`}
                  onClick={() => push({ pathname: pageType,  query: { page: page - 1 } })}
                >
                  Previous
                </button>
                <button
                  disabled={isLastPage}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50
                ${isLastPage ? 'bg-gray-50 text-gray-300' : ''}`}
                  onClick={() => push({ pathname: pageType, query: { page: page + 1 } })}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default MainPage
