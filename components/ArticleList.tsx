import React from 'react'
import { Item } from '../types/item'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import fromUnixTime from 'date-fns/fromUnixTime'
import { HN_ITEM_URL, HN_USER_URL } from '../constants'
import { getFaviconURL } from '../utils'

export interface ListProps {
  items: Item[]
}

export const ArticleList: React.FC<ListProps> = ({ items }) => {
  return (
    <ul role="list" className="max-h-full">
      {items.map((item) => {
        const url = item.url ?? HN_ITEM_URL + item.id
        let hostname = ''
        try {
          hostname = new URL(url).hostname
        } catch (error) {
          console.error(error)
        }

        const upvotes = (
          <>
            <div className="flex flex-row space-x-1 text-sm font-semibold md:w-16 md:flex-col md:justify-center md:space-y-1">
              <p className='text-center' >↑ &nbsp;{item.score}</p>
              <button
                aria-label='open comments'
                onClick={(e) => { 
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(HN_ITEM_URL + item.id)
                }}
                className="hover:underline"
              >
                💬 {item.descendants}
              </button>
            </div>
          </>
        )

        return (
          <li
            key={item.id}
            className="group cursor-pointer relative rounded-lg bg-white py-5 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-600 hover:bg-gray-50"
            onClick={() => window.open(url, '_blank')}
          >
            <div className="flex flex-col justify-between space-y-1 md:flex-row md:space-x-3">
              <div className="hidden self-center md:block">{upvotes}</div>
              <div className="order-2 min-w-0 flex-1">
                <button
                  aria-label='open article'
                  className="group-hover:underline focus:outline-none"
                >
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                </button>
                {hostname ? (
                  <div className="order-3">
                    { hostname ? 
                      <span className='mr-1'>
                        <img className="inline" src={getFaviconURL(url ?? '')} />
                        <span className="ml-1 text-sm italic">{hostname}</span>
                      </span>
                      : null
                    }
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      { item.type }
                    </span>
                  </div>
                ) : null}
                <button
                  aria-label="open user page"
                  onClick={(e) => { 
                    window.open(HN_USER_URL + item.by, '_target')
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="order-4 hover:underline"
                >
                  <p className="truncate text-sm text-gray-500">by {item.by}</p>
                </button>
              </div>
              <time
                dateTime={fromUnixTime(item.time!).toString()}
                className="order-5 flex flex-shrink-0 justify-between whitespace-nowrap text-sm text-gray-500"
              >
                <div className="block md:hidden">{upvotes}</div>
                {formatDistanceToNow(fromUnixTime(item.time!), {
                  addSuffix: true,
                })
                  .replace('about', '')
                  .trim()}
              </time>
            </div>
            {item.text ? (
              <div className="mt-1">
                <div className="line-clamp-2 m-2 rounded-md p-3 text-sm text-gray-600 ring-2 ring-stone-200">
                  {/* TODO: Sanitize this html with xss */}
                  <div dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
